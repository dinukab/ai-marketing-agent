from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from typing import List, Optional
import math

from datetime import datetime, timedelta, timezone
import os

from app.db.database import get_db
from app.db import models as db_models
from app.models.review import Review
from app.models.review_analysis import ReviewAnalysis
from app.core.dependencies import get_current_user
from app.services.review_analysis_service import analyze_review
from app.schemas.review import ReviewResponse, ReviewCreate, ReviewUpdate, PaginatedReviewResponse, ReviewStats

router = APIRouter()


@router.get("/", response_model=PaginatedReviewResponse)
def get_reviews(
    business_id: Optional[int] = Query(None, gt=0), 
    search: Optional[str] = Query(None, max_length=100),
    sentiment: Optional[str] = Query(None, max_length=50),
    rating: Optional[int] = Query(None, ge=1, le=5),
    sort: Optional[str] = Query("newest", max_length=50),
    date_range: Optional[str] = Query("30days", max_length=50),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    query = db.query(Review)
    
    if business_id:
        query = query.filter(Review.business_id == business_id)
        
    if search:
        query = query.filter(
            or_(
                Review.review_text.ilike(f"%{search}%"),
                Review.customer_name.ilike(f"%{search}%")
            )
        )
        
    if sentiment and sentiment.lower() != "all":
        query = query.filter(Review.sentiment.ilike(sentiment))
        
    if rating and rating > 0:
        query = query.filter(Review.rating == rating)
        
    if date_range and date_range != "all":
        now = datetime.now(timezone.utc)
        if date_range == "30days":
            query = query.filter(Review.created_at >= now - timedelta(days=30))
        elif date_range == "7days":
            query = query.filter(Review.created_at >= now - timedelta(days=7))
        elif date_range == "24hours":
            query = query.filter(Review.created_at >= now - timedelta(hours=24))
            
    if sort == "oldest":
        query = query.order_by(Review.created_at.asc())
    elif sort == "highest":
        query = query.order_by(Review.rating.desc(), Review.created_at.desc())
    elif sort == "lowest":
        query = query.order_by(Review.rating.asc(), Review.created_at.desc())
    else: # newest
        query = query.order_by(Review.created_at.desc())
        
    total = query.count()
    total_pages = math.ceil(total / limit) if total > 0 else 1
    
    reviews = query.offset((page - 1) * limit).limit(limit).all()
    
    return {
        "items": reviews,
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": total_pages
    }

@router.get("/stats", response_model=ReviewStats)
def get_review_stats(
    business_id: Optional[int] = Query(None, gt=0),
    db: Session = Depends(get_db)
):
    query = db.query(Review)
    if business_id:
        query = query.filter(Review.business_id == business_id)
        
    total_reviews = query.count()
    
    positive_count = query.filter(Review.sentiment.ilike("positive")).count()
    neutral_count = query.filter(Review.sentiment.ilike("neutral")).count()
    negative_count = query.filter(Review.sentiment.ilike("negative")).count()
    
    # Calculate average rating
    avg_rating_result = query.with_entities(func.avg(Review.rating)).scalar()
    average_rating = float(avg_rating_result) if avg_rating_result else 0.0
    
    awaiting_response_count = query.filter(Review.response_status.ilike("needs response")).count()
    # A bit naive but works - assuming any status that isn't 'needs response' or empty means it's answered/drafted
    answered_count = query.filter(Review.ai_response.is_not(None)).count()
    
    # Rating distribution
    distribution = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
    rating_counts = query.with_entities(Review.rating, func.count(Review.rating)).group_by(Review.rating).all()
    for rating, count in rating_counts:
        if rating in distribution:
            distribution[rating] = count
            
    return ReviewStats(
        total_reviews=total_reviews,
        positive_count=positive_count,
        neutral_count=neutral_count,
        negative_count=negative_count,
        average_rating=round(average_rating, 1),
        awaiting_response_count=awaiting_response_count,
        answered_count=answered_count,
        rating_distribution=distribution
    )


@router.get("/{review_id}", response_model=ReviewResponse)
def get_review(review_id: int, db: Session = Depends(get_db)):
    db_review = db.query(Review).filter(Review.id == review_id).first()
    if not db_review:
        raise HTTPException(status_code=404, detail="Review not found")
    return db_review


@router.post("/", response_model=ReviewResponse)
def create_review(review: ReviewCreate, db: Session = Depends(get_db)):
    business = db.query(db_models.Business).filter(db_models.Business.id == review.business_id).first()
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
        
    db_review = Review(**review.model_dump())
    db.add(db_review)
    db.commit()
    db.refresh(db_review)
    return db_review

@router.patch("/{review_id}", response_model=ReviewResponse)
def update_review(review_id: int, review_update: ReviewUpdate, db: Session = Depends(get_db)):
    db_review = db.query(Review).filter(Review.id == review_id).first()
    if not db_review:
        raise HTTPException(status_code=404, detail="Review not found")
        
    update_data = review_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_review, key, value)
        
    db.commit()
    db.refresh(db_review)
    return db_review

@router.delete("/{review_id}")
def delete_review(review_id: int, db: Session = Depends(get_db)):
    db_review = db.query(Review).filter(Review.id == review_id).first()
    if not db_review:
        raise HTTPException(status_code=404, detail="Review not found")
        
    db.delete(db_review)
    db.commit()
    return {"message": "Review deleted successfully"}


@router.post("/{review_id}/analyze")
def analyze_review_endpoint(
    review_id: int,
    db: Session = Depends(get_db),
    current_user: db_models.User = Depends(get_current_user),
):
    # Fetch the review
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")

    # Fetch the Business and verify ownership
    business = (
        db.query(db_models.Business)
        .filter(db_models.Business.id == review.business_id)
        .first()
    )
    if not business or business.owner_id != current_user.id:
        raise HTTPException(status_code=404, detail="Review not found")

    if not review.review_text or not review.review_text.strip():
        raise HTTPException(status_code=400, detail="Review text cannot be empty")

    # Call analyze_review from the analysis service
    try:
        analysis_result = analyze_review(review.review_text)
    except ValueError as err:
        raise HTTPException(status_code=422, detail=str(err))
    except Exception as err:
        raise HTTPException(status_code=502, detail=f"AI analysis failed: {str(err)}")

    # Save the result in ReviewAnalysis
    analysis = ReviewAnalysis(
        review_id=review.id,
        sentiment=analysis_result.sentiment,
        emotion=analysis_result.emotion,
        topics=analysis_result.topics,
        issues=analysis_result.issues,
        summary=analysis_result.summary,
        confidence=analysis_result.confidence,
        model_name=os.getenv("GEMINI_MODEL") or "gemini-flash-lite-latest",
    )
    db.add(analysis)

    # Update original review's sentiment, sentiment_score, topics, and updated_at
    review.sentiment = analysis_result.sentiment
    review.sentiment_score = analysis_result.confidence
    review.topics = analysis_result.topics
    review.updated_at = datetime.now(timezone.utc)

    # Commit and refresh
    db.commit()
    db.refresh(analysis)
    db.refresh(review)

    return {
        "message": "Review analyzed successfully",
        "analysis": {
            "id": analysis.id,
            "review_id": analysis.review_id,
            "sentiment": analysis.sentiment,
            "emotion": analysis.emotion,
            "topics": analysis.topics,
            "issues": analysis.issues,
            "summary": analysis.summary,
            "confidence": analysis.confidence,
            "model_name": analysis.model_name,
            "created_at": analysis.created_at,
        },
        "review": {
            "id": review.id,
            "sentiment": review.sentiment,
            "sentiment_score": review.sentiment_score,
            "topics": review.topics,
            "updated_at": review.updated_at,
        },
    }

