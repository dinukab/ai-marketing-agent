import logging
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_optional_current_user
from app.db import models
from app.db.database import get_db
from app.schemas.analytics import (
    AIInsightsResponse,
    AnalyticsDashboardResponse,
    AnalyticsOverviewResponse,
    RatingDistributionResponse,
    ReplyPerformanceResponse,
    ReviewTrendsResponse,
    SentimentDistributionResponse,
    TopicsAndIssuesResponse,
)
from app.services.analytics_insights_service import generate_ai_business_insights
from app.services.analytics_service import (
    get_analytics_overview,
    get_rating_distribution,
    get_reply_performance,
    get_review_trends,
    get_sentiment_distribution,
    get_topics_and_issues,
)

logger = logging.getLogger(__name__)

router = APIRouter()


def _resolve_business_id(
    business_id: Optional[int],
    current_user: Optional[models.User],
    db: Session,
) -> int:
    """
    Resolves the target business ID from explicit parameter, current authenticated user,
    or default active business in database.
    """
    if business_id and business_id > 0:
        return business_id

    # Try resolving from authenticated user
    if current_user and current_user.businesses:
        return current_user.businesses[0].id

    # Fallback to the first available business in the database
    first_biz = db.query(models.Business).first()
    if first_biz:
        return first_biz.id

    # Fallback to default ID 1
    return 1


# ============================================================================
# 1. Overview Statistics API
# ============================================================================

@router.get("/overview", response_model=AnalyticsOverviewResponse, summary="Get Overview Statistics")
def get_overview_endpoint(
    business_id: Optional[int] = Query(None, description="The business ID (optional if authenticated)"),
    timeframe: Optional[str] = Query("30days", description="Timeframe: '7days', '30days', '90days', '12months', 'all'"),
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(get_optional_current_user),
):
    """
    Returns high-level review statistics: total reviews, average rating,
    positive/neutral/negative counts, unanswered reviews, reply coverage %,
    and period-over-period percentage changes.
    """
    target_id = _resolve_business_id(business_id, current_user, db)
    return get_analytics_overview(db, business_id=target_id, timeframe=timeframe or "30days")


@router.get("/{business_id}/overview", response_model=AnalyticsOverviewResponse, summary="Get Overview Statistics by Business ID")
def get_overview_by_id_endpoint(
    business_id: int,
    timeframe: Optional[str] = Query("30days"),
    db: Session = Depends(get_db),
):
    return get_analytics_overview(db, business_id=business_id, timeframe=timeframe or "30days")


# ============================================================================
# 2. Sentiment Analytics API
# ============================================================================

@router.get("/sentiment", response_model=SentimentDistributionResponse, summary="Get Sentiment Distribution")
def get_sentiment_endpoint(
    business_id: Optional[int] = Query(None, description="The business ID"),
    timeframe: Optional[str] = Query("30days"),
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(get_optional_current_user),
):
    """
    Returns sentiment classification breakdown (positive, neutral, negative counts & percentages),
    chart-ready color items, and granular detected emotional states.
    """
    target_id = _resolve_business_id(business_id, current_user, db)
    return get_sentiment_distribution(db, business_id=target_id, timeframe=timeframe or "30days")


@router.get("/{business_id}/sentiment", response_model=SentimentDistributionResponse, summary="Get Sentiment by Business ID")
def get_sentiment_by_id_endpoint(
    business_id: int,
    timeframe: Optional[str] = Query("30days"),
    db: Session = Depends(get_db),
):
    return get_sentiment_distribution(db, business_id=business_id, timeframe=timeframe or "30days")


# ============================================================================
# 3. Review Trends API
# ============================================================================

@router.get("/trends", response_model=ReviewTrendsResponse, summary="Get Review Trends")
def get_trends_endpoint(
    business_id: Optional[int] = Query(None, description="The business ID"),
    timeframe: Optional[str] = Query("30days"),
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(get_optional_current_user),
):
    """
    Returns time-series trend data over the requested timeframe:
    - Rating trends (average rating per interval)
    - Volume trends (review counts vs previous periods)
    - Sentiment trends (positive vs neutral vs negative over time)
    """
    target_id = _resolve_business_id(business_id, current_user, db)
    return get_review_trends(db, business_id=target_id, timeframe=timeframe or "30days")


@router.get("/{business_id}/trends", response_model=ReviewTrendsResponse, summary="Get Review Trends by Business ID")
def get_trends_by_id_endpoint(
    business_id: int,
    timeframe: Optional[str] = Query("30days"),
    db: Session = Depends(get_db),
):
    return get_review_trends(db, business_id=business_id, timeframe=timeframe or "30days")


# ============================================================================
# 4. Topics and Issues API
# ============================================================================

@router.get("/topics-and-issues", response_model=TopicsAndIssuesResponse, summary="Get Topics and Pain Points")
@router.get("/topics", response_model=TopicsAndIssuesResponse, include_in_schema=False)
@router.get("/issues", response_model=TopicsAndIssuesResponse, include_in_schema=False)
def get_topics_and_issues_endpoint(
    business_id: Optional[int] = Query(None, description="The business ID"),
    timeframe: Optional[str] = Query("30days"),
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(get_optional_current_user),
):
    """
    Extracts recurring customer conversation topics and customer issues/pain points
    ranked by frequency and severity.
    """
    target_id = _resolve_business_id(business_id, current_user, db)
    return get_topics_and_issues(db, business_id=target_id, timeframe=timeframe or "30days")


@router.get("/{business_id}/topics-and-issues", response_model=TopicsAndIssuesResponse, summary="Get Topics & Issues by Business ID")
def get_topics_and_issues_by_id_endpoint(
    business_id: int,
    timeframe: Optional[str] = Query("30days"),
    db: Session = Depends(get_db),
):
    return get_topics_and_issues(db, business_id=business_id, timeframe=timeframe or "30days")


# ============================================================================
# 5. Reply Performance API
# ============================================================================

@router.get("/reply-performance", response_model=ReplyPerformanceResponse, summary="Get Reply Performance")
def get_reply_performance_endpoint(
    business_id: Optional[int] = Query(None, description="The business ID"),
    timeframe: Optional[str] = Query("30days"),
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(get_optional_current_user),
):
    """
    Returns review reply response rate, reply coverage percentage,
    average response turnaround time, and response rates segmented by star rating tiers.
    """
    target_id = _resolve_business_id(business_id, current_user, db)
    return get_reply_performance(db, business_id=target_id, timeframe=timeframe or "30days")


@router.get("/{business_id}/reply-performance", response_model=ReplyPerformanceResponse, summary="Get Reply Performance by Business ID")
def get_reply_performance_by_id_endpoint(
    business_id: int,
    timeframe: Optional[str] = Query("30days"),
    db: Session = Depends(get_db),
):
    return get_reply_performance(db, business_id=business_id, timeframe=timeframe or "30days")


# ============================================================================
# 6. AI Business Insights API
# ============================================================================

@router.get("/ai-insights", response_model=AIInsightsResponse, summary="Get AI Business Insights")
def get_ai_insights_endpoint(
    business_id: Optional[int] = Query(None, description="The business ID"),
    timeframe: Optional[str] = Query("30days"),
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(get_optional_current_user),
):
    """
    Uses Google Gemini AI to synthesize reviews into actionable business intelligence:
    executive summary, core strengths, customer friction points, prioritized action steps,
    and structured insight cards with severity and evidence links.
    """
    target_id = _resolve_business_id(business_id, current_user, db)
    return generate_ai_business_insights(db, business_id=target_id, timeframe=timeframe or "30days")


@router.get("/{business_id}/ai-insights", response_model=AIInsightsResponse, summary="Get AI Business Insights by Business ID")
def get_ai_insights_by_id_endpoint(
    business_id: int,
    timeframe: Optional[str] = Query("30days"),
    db: Session = Depends(get_db),
):
    return generate_ai_business_insights(db, business_id=business_id, timeframe=timeframe or "30days")


# ============================================================================
# 7. Rating Distribution API (1 to 5 Stars Breakdown)
# ============================================================================

@router.get("/rating-distribution", response_model=RatingDistributionResponse, summary="Get 1-5 Star Rating Distribution")
def get_rating_distribution_endpoint(
    business_id: Optional[int] = Query(None, description="The business ID"),
    timeframe: Optional[str] = Query("30days"),
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(get_optional_current_user),
):
    target_id = _resolve_business_id(business_id, current_user, db)
    return get_rating_distribution(db, business_id=target_id, timeframe=timeframe or "30days")


# ============================================================================
# 8. Consolidated Dashboard API (All-in-one for Analysis Page)
# ============================================================================

@router.get("/dashboard", response_model=AnalyticsDashboardResponse, summary="Get Consolidated Analytics Dashboard")
def get_dashboard_endpoint(
    business_id: Optional[int] = Query(None, description="The business ID"),
    timeframe: Optional[str] = Query("30days"),
    include_ai_insights: bool = Query(True, description="Whether to include AI strategic insights"),
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(get_optional_current_user),
):
    """
    Aggregates all analytics dimensions into a single unified JSON payload
    optimized for fast rendering of the analysis dashboard.
    """
    target_id = _resolve_business_id(business_id, current_user, db)
    tf = timeframe or "30days"

    overview_resp = get_analytics_overview(db, business_id=target_id, timeframe=tf)
    sentiment_resp = get_sentiment_distribution(db, business_id=target_id, timeframe=tf)
    rating_resp = get_rating_distribution(db, business_id=target_id, timeframe=tf)
    trends_resp = get_review_trends(db, business_id=target_id, timeframe=tf)
    topics_resp = get_topics_and_issues(db, business_id=target_id, timeframe=tf)
    reply_resp = get_reply_performance(db, business_id=target_id, timeframe=tf)

    ai_insights = None
    if include_ai_insights:
        ai_insights = generate_ai_business_insights(db, business_id=target_id, timeframe=tf)

    return AnalyticsDashboardResponse(
        business_id=target_id,
        timeframe=tf,
        overview=overview_resp,
        rating_distribution=rating_resp,
        sentiment_distribution=sentiment_resp,
        trends=trends_resp,
        topics=topics_resp.topics,
        issues=topics_resp.issues,
        topics_and_issues=topics_resp,
        reply_performance=reply_resp,
        ai_insights=ai_insights,
    )
