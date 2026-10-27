import json
import logging
import os
from collections import Counter
from datetime import datetime, timezone
from typing import List, Optional

from dotenv import load_dotenv
from google import genai
from google.genai import types
from sqlalchemy.orm import Session

from app.db import models
from app.models.review import Review
from app.models.review_analysis import ReviewAnalysis
from app.schemas.analytics import AIInsightItem, AIInsights, AIInsightsResponse
from app.services.analytics_service import _get_timeframe_range

logger = logging.getLogger(__name__)

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = os.getenv("GEMINI_MODEL") or "gemini-flash-lite-latest"

gemini_client: Optional[genai.Client] = None
if GEMINI_API_KEY:
    try:
        gemini_client = genai.Client(api_key=GEMINI_API_KEY)
    except Exception as e:
        logger.warning("Failed to initialize Gemini genai Client: %s", e)


def _generate_fallback_insights(
    business_name: str,
    reviews: List[Review],
    analyses: List[ReviewAnalysis],
    business_id: int,
    timeframe: str,
) -> AIInsightsResponse:
    """
    Deterministically synthesizes high-quality business insights from review metrics
    when Gemini LLM is offline, unavailable, or rate-limited.
    """
    total = len(reviews)
    if total == 0:
        return AIInsightsResponse(
            business_id=business_id,
            timeframe=timeframe,
            executive_summary=f"No customer reviews have been logged for {business_name} in the selected timeframe ({timeframe}).",
            key_strengths=["Establish an initial customer review collection channel."],
            areas_for_improvement=["Encourage first-time diners and visitors to leave feedback."],
            recommended_actions=[
                "Send post-purchase follow-up emails requesting a Google Review.",
                "Display table QR codes linking directly to your review page.",
            ],
            insights=[],
            generated_at=datetime.now(timezone.utc),
        )

    ratings = [r.rating for r in reviews if r.rating is not None]
    avg_rating = round(sum(ratings) / len(ratings), 2) if ratings else 0.0

    # Collect topics and issues
    topics = []
    issues = []
    positive_reviews = []
    negative_reviews = []

    for r in reviews:
        if r.rating and r.rating >= 4:
            positive_reviews.append(r)
        elif r.rating and r.rating <= 2:
            negative_reviews.append(r)

    for a in analyses:
        if a.topics and isinstance(a.topics, list):
            topics.extend([str(t).title() for t in a.topics])
        if a.issues and isinstance(a.issues, list):
            issues.extend([str(iss).capitalize() for iss in a.issues])

    top_topics = [t for t, _ in Counter(topics).most_common(5)]
    top_issues = [iss for iss, _ in Counter(issues).most_common(4)]

    # Executive summary
    if avg_rating >= 4.2:
        sentiment_summary = f"{business_name} maintains a strong brand reputation with an impressive {avg_rating} / 5 average rating across {total} reviews."
    elif avg_rating >= 3.3:
        sentiment_summary = f"{business_name} holds a moderate {avg_rating} / 5 average rating. While core offerings are appreciated, customer pain points require targeted action."
    else:
        sentiment_summary = f"{business_name} is experiencing customer friction with an average rating of {avg_rating} / 5. Immediate operational improvements and customer recovery replies are critical."

    # Key strengths
    strengths = []
    if top_topics:
        strengths.append(f"Consistently high customer praise around {', '.join(top_topics[:3])}.")
    if positive_reviews:
        sample_quote = positive_reviews[0].review_text or "Great service and atmosphere"
        strengths.append(f"Strong customer loyalty evidenced by positive sentiment: '{sample_quote[:90]}...'")
    if not strengths:
        strengths.append("High overall rating stability across repeat customers.")

    # Areas for improvement
    areas = []
    if top_issues:
        areas.append(f"Frequent complaints highlighting {', '.join(top_issues[:2])}.")
    if negative_reviews:
        areas.append(f"{len(negative_reviews)} dissatisfied reviews recorded requiring proactive staff intervention.")
    if not areas:
        areas.append("Optimize response turnaround time for neutral 3-star reviews.")

    # Recommended actions
    actions = [
        "Acknowledge and reply to all critical 1-2 star reviews within 24 hours with an empathetic tone.",
        "Coach front-of-house staff on the most frequently identified customer friction points.",
        "Highlight positive customer quotes in your marketing campaigns and social media.",
    ]

    # Structured insight items
    insights_list: List[AIInsightItem] = []

    if top_issues:
        insights_list.append(
            AIInsightItem(
                id="iss-1",
                category="Service Operations",
                insight_type="alert",
                priority="high",
                title=f"Recurring friction: {top_issues[0]}",
                description=f"Multiple customers reported '{top_issues[0]}' as a detriment to their overall experience.",
                actionable_recommendation=f"Review staff workflows and implement a quality check for {top_issues[0]}.",
                supporting_review_ids=[r.id for r in negative_reviews[:3]],
            )
        )

    if top_topics:
        insights_list.append(
            AIInsightItem(
                id="str-1",
                category="Brand Strength",
                insight_type="strength",
                priority="medium",
                title=f"Competitive advantage in {top_topics[0]}",
                description=f"Customers frequently celebrate {top_topics[0]} as a standout reason for visiting {business_name}.",
                actionable_recommendation=f"Feature customer testimonials about {top_topics[0]} prominently on your website and social channels.",
                supporting_review_ids=[r.id for r in positive_reviews[:3]],
            )
        )

    insights_list.append(
        AIInsightItem(
            id="opp-1",
            category="Customer Engagement",
            insight_type="opportunity",
            priority="medium",
            title="Increase Review Response Coverage",
            description="Responding to every customer review reinforces trust and signals proactive management to future prospects.",
            actionable_recommendation="Use our AI reply generator to draft swift, personalized responses for all pending reviews.",
            supporting_review_ids=[r.id for r in reviews[:2]],
        )
    )

    return AIInsightsResponse(
        business_id=business_id,
        timeframe=timeframe,
        executive_summary=sentiment_summary,
        key_strengths=strengths,
        areas_for_improvement=areas,
        recommended_actions=actions,
        insights=insights_list,
        generated_at=datetime.now(timezone.utc),
    )


def generate_ai_business_insights(
    db: Session,
    business_id: int,
    timeframe: str = "30days",
) -> AIInsightsResponse:
    """
    Generates strategic business insights using Google Gemini AI,
    with an intelligent heuristics fallback if Gemini is unconfigured or unavailable.
    """
    business = db.query(models.Business).filter(models.Business.id == business_id).first()
    business_name = business.name if business else f"Business #{business_id}"

    current_start, _, _ = _get_timeframe_range(timeframe)
    query = db.query(Review).filter(Review.business_id == business_id)
    if current_start:
        query = query.filter(Review.created_at >= current_start)
    reviews: List[Review] = query.order_by(Review.created_at.desc()).limit(50).all()

    review_ids = [r.id for r in reviews]
    analyses: List[ReviewAnalysis] = []
    if review_ids:
        analyses = db.query(ReviewAnalysis).filter(ReviewAnalysis.review_id.in_(review_ids)).all()

    # If no reviews or Gemini client is not initialized, return heuristic synthesis
    if not reviews or not gemini_client:
        return _generate_fallback_insights(
            business_name,
            reviews,
            analyses,
            business_id,
            timeframe,
        )

    # Format reviews for Gemini prompt
    review_snippets = []
    for r in reviews[:25]:
        review_snippets.append({
            "id": r.id,
            "rating": r.rating,
            "sentiment": r.sentiment or "unspecified",
            "text": (r.review_text or "")[:350],
        })

    prompt = f"""
You are an expert Chief Marketing Officer and Hospitality Business Analytics Consultant.
Analyze the following customer reviews for '{business_name}' over the '{timeframe}' period.

Generate deep strategic business insights in structured JSON with the following format:
{{
  "executive_summary": "Comprehensive 2-3 sentence overview of brand health and customer sentiment",
  "key_strengths": ["Strength 1 with context", "Strength 2 with context", "Strength 3"],
  "areas_for_improvement": ["Pain point 1", "Pain point 2", "Pain point 3"],
  "recommended_actions": ["Specific actionable recommendation 1", "Action 2", "Action 3"],
  "insights": [
    {{
      "id": "ins-1",
      "category": "Customer Service | Food Quality | Atmosphere | Pricing | Operations",
      "insight_type": "strength | weakness | opportunity | alert",
      "priority": "high | medium | low",
      "title": "Short punchy insight title",
      "description": "Specific finding based on customer comments",
      "actionable_recommendation": "Concrete tactical advice for management",
      "supporting_review_ids": [1, 2]
    }}
  ]
}}

REVIEWS DATA:
{json.dumps(review_snippets, indent=2)}
"""

    try:
        response = gemini_client.models.generate_content(
            model=GEMINI_MODEL,
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                temperature=0.2,
            ),
        )

        if not response.text:
            raise ValueError("Gemini returned empty insights response")

        data = json.loads(response.text)

        insight_items: List[AIInsightItem] = []
        for raw_item in data.get("insights", []):
            insight_items.append(
                AIInsightItem(
                    id=raw_item.get("id"),
                    category=raw_item.get("category", "General"),
                    insight_type=raw_item.get("insight_type", "opportunity"),
                    priority=raw_item.get("priority", "medium"),
                    title=raw_item.get("title", "Insight"),
                    description=raw_item.get("description", ""),
                    actionable_recommendation=raw_item.get("actionable_recommendation"),
                    supporting_review_ids=raw_item.get("supporting_review_ids", []),
                )
            )

        return AIInsightsResponse(
            business_id=business_id,
            timeframe=timeframe,
            executive_summary=data.get("executive_summary", ""),
            key_strengths=data.get("key_strengths", []),
            areas_for_improvement=data.get("areas_for_improvement", []),
            recommended_actions=data.get("recommended_actions", []),
            insights=insight_items,
            generated_at=datetime.now(timezone.utc),
        )

    except Exception as exc:
        logger.error("Gemini AI insights generation failed, falling back to heuristic engine: %s", exc)
        return _generate_fallback_insights(
            business_name,
            reviews,
            analyses,
            business_id,
            timeframe,
        )
