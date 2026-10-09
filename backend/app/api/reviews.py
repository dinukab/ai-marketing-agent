from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timezone

from app.db.database import get_db
from app.db import models
from app.schemas.review import ReviewResponse

router = APIRouter()

@router.get("/", response_model=List[ReviewResponse])
def get_reviews(business_id: int = None, db: Session = Depends(get_db)):
    query = db.query(models.Review)
    if business_id:
        query = query.filter(models.Review.business_id == business_id)
    # Order by newest first
    reviews = query.order_by(models.Review.created_at.desc()).all()
    return reviews

@router.post("/seed", response_model=List[ReviewResponse])
def seed_reviews(business_id: int, db: Session = Depends(get_db)):
    """A quick seed endpoint to populate dummy reviews for a business."""
    # Ensure business exists
    business = db.query(models.Business).filter(models.Business.id == business_id).first()
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")

    dummy_reviews = [
        models.Review(
            business_id=business_id,
            google_review_id="dummy_g_1",
            customer_name="Sarah M.",
            customer_avatar="SM",
            rating=5,
            review_text="The service was excellent. The staff were very friendly and the flat white was perfect. Definitely coming back for their weekend brunch pastries!",
            sentiment="Positive",
            sentiment_score=0.9,
            topics=["Service", "Staff", "Coffee"],
            ai_response="Tone: Warm",
            response_status="AI Ready",
            source="Google Local Guide • Level 4"
        ),
        models.Review(
            business_id=business_id,
            google_review_id="dummy_g_2",
            customer_name="John D.",
            customer_avatar="JD",
            rating=3,
            review_text="The food was good but delivery took too long. Ordered at...",
            sentiment="Neutral",
            sentiment_score=0.0,
            topics=["Food", "Delivery Delays"],
            response_status="Needs Response",
            source="Local Guide"
        )
    ]
    
    db.add_all(dummy_reviews)
    db.commit()
    
    for r in dummy_reviews:
        db.refresh(r)
        
    return dummy_reviews
