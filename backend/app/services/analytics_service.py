import math
from collections import Counter, defaultdict
from datetime import datetime, timedelta, timezone
from typing import Dict, List, Optional, Tuple

from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from app.db import models
from app.models.review import Review
from app.models.review_analysis import ReviewAnalysis
from app.schemas.analytics import (
    AnalyticsDashboardResponse,
    AnalyticsOverview,
    AnalyticsOverviewResponse,
    EmotionItem,
    IssueMetric,
    RatingDistribution,
    RatingDistributionResponse,
    RatingTrendPoint,
    ReplyPerformance,
    ReplyPerformanceResponse,
    ReplyRatingBreakdown,
    ReviewTrends,
    ReviewTrendsResponse,
    SentimentDistribution,
    SentimentDistributionResponse,
    SentimentItem,
    SentimentTrendPoint,
    StarRatingCount,
    TopicMetric,
    TopicsAndIssues,
    TopicsAndIssuesResponse,
    VolumeTrendPoint,
)


def _to_utc(dt: Optional[datetime]) -> Optional[datetime]:
    """Ensures datetime is offset-aware UTC for safe comparison."""
    if dt is None:
        return None
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc)


def _get_timeframe_range(timeframe: str) -> Tuple[Optional[datetime], Optional[datetime], Optional[datetime]]:
    """
    Returns (current_start, previous_start, previous_end) in UTC.
    """
    now = datetime.now(timezone.utc)
    tf = (timeframe or "30days").lower().strip()

    if tf == "24hours":
        current_start = now - timedelta(hours=24)
        prev_start = now - timedelta(hours=48)
        prev_end = current_start
    elif tf == "7days":
        current_start = now - timedelta(days=7)
        prev_start = now - timedelta(days=14)
        prev_end = current_start
    elif tf == "90days":
        current_start = now - timedelta(days=90)
        prev_start = now - timedelta(days=180)
        prev_end = current_start
    elif tf in ("12months", "year", "365days"):
        current_start = now - timedelta(days=365)
        prev_start = now - timedelta(days=730)
        prev_end = current_start
    elif tf == "all":
        current_start = None
        prev_start = None
        prev_end = None
    else:  # default "30days"
        current_start = now - timedelta(days=30)
        prev_start = now - timedelta(days=60)
        prev_end = current_start

    return current_start, prev_start, prev_end


def _filter_reviews_by_timeframe(
    query,
    start_date: Optional[datetime],
    end_date: Optional[datetime] = None,
):
    """Filters query using created_at or review_date."""
    if start_date:
        query = query.filter(Review.created_at >= start_date)
    if end_date:
        query = query.filter(Review.created_at < end_date)
    return query


def _normalize_sentiment(sentiment_str: Optional[str]) -> str:
    """Normalizes sentiment into 'positive', 'neutral', 'negative', or 'unanalyzed'."""
    if not sentiment_str:
        return "unanalyzed"
    s = sentiment_str.lower().strip()
    if "pos" in s or s == "happy":
        return "positive"
    if "neg" in s or s in ("angry", "frustrated", "sad"):
        return "negative"
    if "neu" in s or "mix" in s:
        return "neutral"
    return "neutral"


# ============================================================================
# 1. Overview Statistics
# ============================================================================

def get_analytics_overview(
    db: Session,
    business_id: int,
    timeframe: str = "30days",
) -> AnalyticsOverviewResponse:
    current_start, prev_start, prev_end = _get_timeframe_range(timeframe)

    current_query = db.query(Review).filter(Review.business_id == business_id)
    current_query = _filter_reviews_by_timeframe(current_query, current_start)
    reviews: List[Review] = current_query.all()

    total_reviews = len(reviews)
    if total_reviews == 0:
        return AnalyticsOverviewResponse(
            business_id=business_id,
            timeframe=timeframe,
            total_reviews=0,
            average_rating=0.0,
            positive_reviews=0,
            negative_reviews=0,
            neutral_reviews=0,
            unanalyzed_reviews=0,
            unanswered_reviews=0,
            reply_coverage_percentage=0.0,
            rating_change=None,
            review_count_change=None,
        )

    # Average rating
    ratings = [r.rating for r in reviews if r.rating is not None]
    average_rating = round(sum(ratings) / len(ratings), 2) if ratings else 0.0

    # Sentiment counts
    positive_count = 0
    negative_count = 0
    neutral_count = 0
    unanalyzed_count = 0

    for r in reviews:
        norm = _normalize_sentiment(r.sentiment)
        if norm == "positive":
            positive_count += 1
        elif norm == "negative":
            negative_count += 1
        elif norm == "neutral":
            neutral_count += 1
        else:
            unanalyzed_count += 1

    # Unanswered & reply coverage
    replied_count = 0
    unanswered_count = 0

    for r in reviews:
        has_reply = bool(r.ai_response and r.ai_response.strip()) or (r.response_status == "Published")
        if has_reply:
            replied_count += 1
        else:
            unanswered_count += 1

    reply_coverage_percentage = round((replied_count / total_reviews) * 100, 1)

    # Comparison metrics with previous period
    rating_change = None
    review_count_change = None

    if prev_start and prev_end:
        prev_query = db.query(Review).filter(Review.business_id == business_id)
        prev_query = _filter_reviews_by_timeframe(prev_query, prev_start, prev_end)
        prev_reviews: List[Review] = prev_query.all()

        prev_count = len(prev_reviews)
        if prev_count > 0:
            prev_ratings = [r.rating for r in prev_reviews if r.rating is not None]
            prev_avg = sum(prev_ratings) / len(prev_ratings) if prev_ratings else 0.0
            rating_change = round(average_rating - prev_avg, 2)
            review_count_change = round(((total_reviews - prev_count) / prev_count) * 100, 1)

    return AnalyticsOverviewResponse(
        business_id=business_id,
        timeframe=timeframe,
        total_reviews=total_reviews,
        average_rating=average_rating,
        positive_reviews=positive_count,
        negative_reviews=negative_count,
        neutral_reviews=neutral_count,
        unanalyzed_reviews=unanalyzed_count,
        unanswered_reviews=unanswered_count,
        reply_coverage_percentage=reply_coverage_percentage,
        rating_change=rating_change,
        review_count_change=review_count_change,
    )


# ============================================================================
# 2. Sentiment Distribution
# ============================================================================

def get_sentiment_distribution(
    db: Session,
    business_id: int,
    timeframe: str = "30days",
) -> SentimentDistributionResponse:
    current_start, _, _ = _get_timeframe_range(timeframe)

    query = db.query(Review).filter(Review.business_id == business_id)
    query = _filter_reviews_by_timeframe(query, current_start)
    reviews: List[Review] = query.all()

    pos = 0
    neu = 0
    neg = 0

    for r in reviews:
        norm = _normalize_sentiment(r.sentiment)
        if norm == "positive":
            pos += 1
        elif norm == "negative":
            neg += 1
        elif norm == "neutral":
            neu += 1

    total_analyzed = pos + neu + neg
    if total_analyzed > 0:
        pos_pct = round((pos / total_analyzed) * 100, 1)
        neu_pct = round((neu / total_analyzed) * 100, 1)
        neg_pct = round((neg / total_analyzed) * 100, 1)
    else:
        pos_pct = 0.0
        neu_pct = 0.0
        neg_pct = 0.0

    items = [
        SentimentItem(name="Positive", count=pos, percentage=pos_pct, color="#10B981"),
        SentimentItem(name="Neutral", count=neu, percentage=neu_pct, color="#F59E0B"),
        SentimentItem(name="Negative", count=neg, percentage=neg_pct, color="#EF4444"),
    ]

    # Granular emotion breakdown from ReviewAnalysis
    review_ids = [r.id for r in reviews]
    emotion_items: List[EmotionItem] = []

    if review_ids:
        analyses = db.query(ReviewAnalysis).filter(ReviewAnalysis.review_id.in_(review_ids)).all()
        emotion_counts = Counter(a.emotion.lower() for a in analyses if a.emotion)
        total_emotions = sum(emotion_counts.values())

        if total_emotions > 0:
            for emotion, count in emotion_counts.most_common(10):
                pct = round((count / total_emotions) * 100, 1)
                emotion_items.append(EmotionItem(emotion=emotion, count=count, percentage=pct))

    dist = SentimentDistribution(
        positive=pos,
        neutral=neu,
        negative=neg,
        positive_percentage=pos_pct,
        neutral_percentage=neu_pct,
        negative_percentage=neg_pct,
        items=items,
        emotions=emotion_items,
    )

    return SentimentDistributionResponse(
        business_id=business_id,
        timeframe=timeframe,
        total_analyzed=total_analyzed,
        positive=pos,
        neutral=neu,
        negative=neg,
        positive_percentage=pos_pct,
        neutral_percentage=neu_pct,
        negative_percentage=neg_pct,
        items=items,
        emotions=emotion_items,
    )


# ============================================================================
# 3. Star Rating Distribution
# ============================================================================

def get_rating_distribution(
    db: Session,
    business_id: int,
    timeframe: str = "30days",
) -> RatingDistributionResponse:
    current_start, _, _ = _get_timeframe_range(timeframe)

    query = db.query(Review).filter(Review.business_id == business_id)
    query = _filter_reviews_by_timeframe(query, current_start)
    reviews: List[Review] = query.all()

    counts = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
    ratings = []
    for r in reviews:
        if r.rating and 1 <= r.rating <= 5:
            counts[r.rating] += 1
            ratings.append(r.rating)

    total_ratings = len(ratings)
    avg_rating = round(sum(ratings) / total_ratings, 2) if total_ratings > 0 else 0.0

    items = []
    for star in range(5, 0, -1):
        c = counts[star]
        pct = round((c / total_ratings) * 100, 1) if total_ratings > 0 else 0.0
        items.append(StarRatingCount(rating=star, count=c, percentage=pct))

    return RatingDistributionResponse(
        business_id=business_id,
        timeframe=timeframe,
        average_rating=avg_rating,
        total_reviews=total_ratings,
        star_1=counts[1],
        star_2=counts[2],
        star_3=counts[3],
        star_4=counts[4],
        star_5=counts[5],
        breakdown=counts,
        items=items,
    )


# ============================================================================
# 4. Review Trends
# ============================================================================

def get_review_trends(
    db: Session,
    business_id: int,
    timeframe: str = "30days",
) -> ReviewTrendsResponse:
    current_start, prev_start, _ = _get_timeframe_range(timeframe)
    now = datetime.now(timezone.utc)

    query = db.query(Review).filter(Review.business_id == business_id)
    # Fetch current and comparison window
    fetch_start = prev_start if prev_start else current_start
    if fetch_start:
        query = query.filter(Review.created_at >= fetch_start)
    reviews: List[Review] = query.all()

    tf = (timeframe or "30days").lower().strip()

    # Determine interval bucketing
    if tf == "7days":
        num_buckets = 7
        bucket_duration = timedelta(days=1)
        start_anchor = now - timedelta(days=7)
        date_format = "%b %d"
    elif tf == "90days":
        num_buckets = 6
        bucket_duration = timedelta(days=15)
        start_anchor = now - timedelta(days=90)
        date_format = "%b %d"
    elif tf in ("12months", "year", "all"):
        num_buckets = 6
        bucket_duration = timedelta(days=60)
        start_anchor = now - timedelta(days=365)
        date_format = "%b %Y"
    else:  # default 30days -> 4 weekly intervals
        num_buckets = 4
        bucket_duration = timedelta(days=7.5)
        start_anchor = now - timedelta(days=30)
        date_format = "%b %d"

    rating_trends: List[RatingTrendPoint] = []
    volume_trends: List[VolumeTrendPoint] = []
    sentiment_trends: List[SentimentTrendPoint] = []

    for i in range(num_buckets):
        b_start = start_anchor + i * bucket_duration
        b_end = b_start + bucket_duration

        # Comparison previous bucket
        prev_b_start = b_start - (num_buckets * bucket_duration)
        prev_b_end = b_end - (num_buckets * bucket_duration)

        # Current bucket reviews
        b_reviews = [
            r for r in reviews
            if _to_utc(r.created_at) and b_start <= _to_utc(r.created_at) < b_end
        ]
        # Prev bucket reviews
        prev_reviews = [
            r for r in reviews
            if _to_utc(r.created_at) and prev_b_start <= _to_utc(r.created_at) < prev_b_end
        ]

        period_label = f"Week {i + 1}" if tf == "30days" else b_start.strftime(date_format)
        date_str = b_start.strftime("%Y-%m-%d")

        # Rating trend
        b_ratings = [r.rating for r in b_reviews if r.rating is not None]
        avg_rating = round(sum(b_ratings) / len(b_ratings), 2) if b_ratings else 0.0

        rating_trends.append(
            RatingTrendPoint(
                period=period_label,
                date=date_str,
                average_rating=avg_rating,
                count=len(b_reviews),
            )
        )

        # Volume trend
        volume_trends.append(
            VolumeTrendPoint(
                period=period_label,
                date=date_str,
                current=len(b_reviews),
                previous=len(prev_reviews),
            )
        )

        # Sentiment trend
        pos = sum(1 for r in b_reviews if _normalize_sentiment(r.sentiment) == "positive")
        neu = sum(1 for r in b_reviews if _normalize_sentiment(r.sentiment) == "neutral")
        neg = sum(1 for r in b_reviews if _normalize_sentiment(r.sentiment) == "negative")

        sentiment_trends.append(
            SentimentTrendPoint(
                period=period_label,
                date=date_str,
                positive=pos,
                neutral=neu,
                negative=neg,
                total=len(b_reviews),
            )
        )

    return ReviewTrendsResponse(
        business_id=business_id,
        timeframe=timeframe,
        rating_trends=rating_trends,
        volume_trends=volume_trends,
        sentiment_trends=sentiment_trends,
    )


# ============================================================================
# 5. Topics and Issues
# ============================================================================

def get_topics_and_issues(
    db: Session,
    business_id: int,
    timeframe: str = "30days",
) -> TopicsAndIssuesResponse:
    current_start, _, _ = _get_timeframe_range(timeframe)

    query = db.query(Review).filter(Review.business_id == business_id)
    query = _filter_reviews_by_timeframe(query, current_start)
    reviews: List[Review] = query.all()

    total_reviews = len(reviews)
    review_ids = [r.id for r in reviews]

    topic_counts: Dict[str, int] = Counter()
    topic_sentiments: Dict[str, List[str]] = defaultdict(list)
    issue_counts: Dict[str, int] = Counter()
    issue_ratings: Dict[str, List[int]] = defaultdict(list)

    if review_ids:
        # Check ReviewAnalysis table
        analyses = db.query(ReviewAnalysis).filter(ReviewAnalysis.review_id.in_(review_ids)).all()
        review_rating_map = {r.id: r.rating for r in reviews}

        for a in analyses:
            r_rating = review_rating_map.get(a.review_id, 3)
            # Topics
            if a.topics and isinstance(a.topics, list):
                for t in a.topics:
                    t_clean = str(t).strip().title()
                    if t_clean:
                        topic_counts[t_clean] += 1
                        topic_sentiments[t_clean].append(a.sentiment or "positive")

            # Issues
            if a.issues and isinstance(a.issues, list):
                for iss in a.issues:
                    iss_clean = str(iss).strip().capitalize()
                    if iss_clean:
                        issue_counts[iss_clean] += 1
                        issue_ratings[iss_clean].append(r_rating)

    # Fallback to Review.topics if ReviewAnalysis had no topics
    if not topic_counts:
        for r in reviews:
            if r.topics and isinstance(r.topics, list):
                for t in r.topics:
                    t_clean = str(t).strip().title()
                    if t_clean:
                        topic_counts[t_clean] += 1
                        norm_sent = _normalize_sentiment(r.sentiment)
                        topic_sentiments[t_clean].append(norm_sent)

    topics_list: List[TopicMetric] = []
    base_count = max(total_reviews, 1)

    for name, cnt in Counter(topic_counts).most_common(12):
        pct = round((cnt / base_count) * 100, 1)
        sents = topic_sentiments.get(name, [])
        pos_sents = sum(1 for s in sents if "pos" in s.lower())
        neg_sents = sum(1 for s in sents if "neg" in s.lower())
        is_pos = pos_sents >= neg_sents
        sentiment_label = "Positive" if is_pos else ("Negative" if neg_sents > pos_sents else "Neutral")

        topics_list.append(
            TopicMetric(
                name=name,
                count=cnt,
                percentage=pct,
                is_positive=is_pos,
                sentiment=sentiment_label,
            )
        )

    issues_list: List[IssueMetric] = []
    for issue_text, cnt in Counter(issue_counts).most_common(10):
        pct = round((cnt / base_count) * 100, 1)
        r_list = issue_ratings.get(issue_text, [3])
        avg_r = sum(r_list) / len(r_list) if r_list else 3.0

        if avg_r <= 2.2 or cnt >= 5:
            severity = "high"
        elif avg_r <= 3.2:
            severity = "medium"
        else:
            severity = "low"

        issues_list.append(
            IssueMetric(
                issue=issue_text,
                count=cnt,
                percentage=pct,
                severity=severity,
                status="open",
            )
        )

    return TopicsAndIssuesResponse(
        business_id=business_id,
        timeframe=timeframe,
        topics=topics_list,
        issues=issues_list,
        total_topics_detected=len(topics_list),
        total_issues_detected=len(issues_list),
    )


# ============================================================================
# 6. Reply Performance
# ============================================================================

def get_reply_performance(
    db: Session,
    business_id: int,
    timeframe: str = "30days",
) -> ReplyPerformanceResponse:
    current_start, _, _ = _get_timeframe_range(timeframe)

    query = db.query(Review).filter(Review.business_id == business_id)
    query = _filter_reviews_by_timeframe(query, current_start)
    reviews: List[Review] = query.all()

    total_reviews = len(reviews)
    if total_reviews == 0:
        return ReplyPerformanceResponse(
            business_id=business_id,
            timeframe=timeframe,
            total_reviews=0,
            replied_count=0,
            unanswered_count=0,
            reply_coverage_percentage=0.0,
            average_response_time_hours=None,
            ai_generated_replies_count=0,
            manual_replies_count=0,
            rating_tier_breakdown=[],
        )

    replied_count = 0
    unanswered_count = 0
    ai_generated_count = 0
    manual_count = 0

    response_durations_hours: List[float] = []

    # Rating tier tracking
    tiers = {
        "1-2 Stars (Critical)": {"ratings": [1, 2], "total": 0, "replied": 0, "unreplied": 0, "hours": []},
        "3 Stars (Neutral)": {"ratings": [3], "total": 0, "replied": 0, "unreplied": 0, "hours": []},
        "4-5 Stars (Positive)": {"ratings": [4, 5], "total": 0, "replied": 0, "unreplied": 0, "hours": []},
    }

    for r in reviews:
        has_reply = bool(r.ai_response and r.ai_response.strip()) or (r.response_status == "Published")
        r_tier = None
        if r.rating in (1, 2):
            r_tier = "1-2 Stars (Critical)"
        elif r.rating == 3:
            r_tier = "3 Stars (Neutral)"
        elif r.rating in (4, 5):
            r_tier = "4-5 Stars (Positive)"

        if r_tier:
            tiers[r_tier]["total"] += 1

        if has_reply:
            replied_count += 1
            if r_tier:
                tiers[r_tier]["replied"] += 1

            if r.response_status in ("AI Ready", "Published") or (r.ai_response and len(r.ai_response) > 0):
                ai_generated_count += 1
            else:
                manual_count += 1

            # Estimate response time
            r_c = _to_utc(r.created_at)
            r_u = _to_utc(r.updated_at)
            if r_c and r_u and r_u > r_c:
                diff_hours = (r_u - r_c).total_seconds() / 3600.0
                if 0.05 <= diff_hours <= 720.0:
                    response_durations_hours.append(diff_hours)
                    if r_tier:
                        tiers[r_tier]["hours"].append(diff_hours)
        else:
            unanswered_count += 1
            if r_tier:
                tiers[r_tier]["unreplied"] += 1

    reply_coverage = round((replied_count / total_reviews) * 100, 1)
    avg_response_time = (
        round(sum(response_durations_hours) / len(response_durations_hours), 1)
        if response_durations_hours
        else None
    )

    tier_breakdowns: List[ReplyRatingBreakdown] = []
    for tier_name, data in tiers.items():
        t_total = data["total"]
        t_replied = data["replied"]
        t_unreplied = data["unreplied"]
        t_rate = round((t_replied / t_total) * 100, 1) if t_total > 0 else 0.0
        t_avg_hours = (
            round(sum(data["hours"]) / len(data["hours"]), 1)
            if data["hours"]
            else None
        )
        tier_breakdowns.append(
            ReplyRatingBreakdown(
                rating_group=tier_name,
                total_reviews=t_total,
                replied_count=t_replied,
                unreplied_count=t_unreplied,
                response_rate=t_rate,
                avg_response_hours=t_avg_hours,
            )
        )

    return ReplyPerformanceResponse(
        business_id=business_id,
        timeframe=timeframe,
        total_reviews=total_reviews,
        replied_count=replied_count,
        unanswered_count=unanswered_count,
        reply_coverage_percentage=reply_coverage,
        average_response_time_hours=avg_response_time,
        ai_generated_replies_count=ai_generated_count,
        manual_replies_count=manual_count,
        rating_tier_breakdown=tier_breakdowns,
    )
