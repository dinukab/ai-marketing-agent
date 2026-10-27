from datetime import datetime, timezone
from typing import Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field


# ============================================================================
# 1. Overview Statistics
# ============================================================================

class AnalyticsOverview(BaseModel):
    """Key overview metrics displayed on the analytics dashboard."""
    model_config = ConfigDict(from_attributes=True)

    total_reviews: int = Field(default=0, ge=0, description="Total number of reviews")
    average_rating: float = Field(
        default=0.0,
        ge=0.0,
        le=5.0,
        description="Average star rating (0.0 to 5.0)",
    )
    positive_reviews: int = Field(default=0, ge=0, description="Total positive reviews count")
    negative_reviews: int = Field(default=0, ge=0, description="Total negative reviews count")
    neutral_reviews: int = Field(default=0, ge=0, description="Total neutral reviews count")
    unanalyzed_reviews: int = Field(default=0, ge=0, description="Reviews awaiting sentiment analysis")
    unanswered_reviews: int = Field(default=0, ge=0, description="Reviews awaiting reply/response")
    reply_coverage_percentage: float = Field(
        default=0.0,
        ge=0.0,
        le=100.0,
        description="Percentage of reviews that have received a reply",
    )
    rating_change: Optional[float] = Field(
        default=None,
        description="Average rating change vs previous period (e.g. +0.2)",
    )
    review_count_change: Optional[float] = Field(
        default=None,
        description="Percentage change in review volume vs previous period",
    )


class AnalyticsOverviewResponse(AnalyticsOverview):
    """Response schema for the overview statistics endpoint."""
    business_id: int = Field(..., gt=0, description="The business ID")
    timeframe: Optional[str] = Field(
        default="30days",
        description="Selected timeframe filter (e.g. '7days', '30days', '90days', 'all')",
    )


# ============================================================================
# 2. Sentiment Distribution
# ============================================================================

class SentimentItem(BaseModel):
    """Represents a single sentiment breakdown item formatted for UI charts."""
    model_config = ConfigDict(from_attributes=True)

    name: str = Field(..., description="Sentiment label (Positive, Neutral, Negative)")
    count: int = Field(default=0, ge=0, description="Total review count with this sentiment")
    percentage: float = Field(default=0.0, ge=0.0, le=100.0, description="Percentage of total reviews")
    color: Optional[str] = Field(default=None, description="Hex or theme color code (e.g. '#10B981')")


class EmotionItem(BaseModel):
    """Represents frequency of a specific detected customer emotion."""
    model_config = ConfigDict(from_attributes=True)

    emotion: str = Field(..., description="Emotion name (e.g. happy, frustrated, excited)")
    count: int = Field(default=0, ge=0, description="Number of reviews expressing this emotion")
    percentage: float = Field(default=0.0, ge=0.0, le=100.0, description="Percentage of analyzed reviews")


class SentimentDistribution(BaseModel):
    """Distribution of sentiment classifications across reviews."""
    model_config = ConfigDict(from_attributes=True)

    positive: int = Field(default=0, ge=0, description="Positive review count")
    neutral: int = Field(default=0, ge=0, description="Neutral review count")
    negative: int = Field(default=0, ge=0, description="Negative review count")
    positive_percentage: float = Field(default=0.0, ge=0.0, le=100.0, description="Positive sentiment percentage")
    neutral_percentage: float = Field(default=0.0, ge=0.0, le=100.0, description="Neutral sentiment percentage")
    negative_percentage: float = Field(default=0.0, ge=0.0, le=100.0, description="Negative sentiment percentage")
    items: List[SentimentItem] = Field(default_factory=list, description="Chart-ready sentiment list")
    emotions: List[EmotionItem] = Field(default_factory=list, description="Detected granular emotion breakdown")


class SentimentDistributionResponse(SentimentDistribution):
    """Response schema for the sentiment distribution endpoint."""
    business_id: int = Field(..., gt=0, description="The business ID")
    timeframe: Optional[str] = Field(default="30days", description="Selected filter timeframe")
    total_analyzed: int = Field(default=0, ge=0, description="Total number of reviews with sentiment analyzed")


# ============================================================================
# 3. Star Rating Distribution
# ============================================================================

class StarRatingCount(BaseModel):
    """Count and percentage for an individual star rating (1 to 5)."""
    model_config = ConfigDict(from_attributes=True)

    rating: int = Field(..., ge=1, le=5, description="Star rating value (1 to 5)")
    count: int = Field(default=0, ge=0, description="Review count for this star rating")
    percentage: float = Field(default=0.0, ge=0.0, le=100.0, description="Percentage of total rated reviews")


class RatingDistribution(BaseModel):
    """Breakdown of customer reviews across 1 to 5 stars."""
    model_config = ConfigDict(from_attributes=True)

    star_1: int = Field(default=0, ge=0, description="Count of 1-star reviews")
    star_2: int = Field(default=0, ge=0, description="Count of 2-star reviews")
    star_3: int = Field(default=0, ge=0, description="Count of 3-star reviews")
    star_4: int = Field(default=0, ge=0, description="Count of 4-star reviews")
    star_5: int = Field(default=0, ge=0, description="Count of 5-star reviews")
    breakdown: Dict[int, int] = Field(
        default_factory=lambda: {1: 0, 2: 0, 3: 0, 4: 0, 5: 0},
        description="Key-value mapping of rating integer (1-5) to count",
    )
    items: List[StarRatingCount] = Field(
        default_factory=list,
        description="List of star rating counts with percentages for UI charts",
    )


class RatingDistributionResponse(RatingDistribution):
    """Response schema for the star rating breakdown endpoint."""
    business_id: int = Field(..., gt=0, description="The business ID")
    timeframe: Optional[str] = Field(default="30days", description="Selected timeframe")
    average_rating: float = Field(default=0.0, ge=0.0, le=5.0, description="Average star rating")
    total_reviews: int = Field(default=0, ge=0, description="Total reviews rated")


# ============================================================================
# 4. Review Trends (Rating, Volume, Sentiment)
# ============================================================================

class RatingTrendPoint(BaseModel):
    """Time-series data point for average rating trend."""
    model_config = ConfigDict(from_attributes=True)

    period: str = Field(..., description="Display label for the period (e.g. 'Week 1', 'Oct 2026')")
    date: Optional[str] = Field(default=None, description="ISO date or start date of period (YYYY-MM-DD)")
    average_rating: float = Field(default=0.0, ge=0.0, le=5.0, description="Average rating in this period")
    count: int = Field(default=0, ge=0, description="Number of reviews in this period")


class VolumeTrendPoint(BaseModel):
    """Time-series data point for review volume trend."""
    model_config = ConfigDict(from_attributes=True)

    period: str = Field(..., description="Display label for the period (e.g. 'Week 1', 'Day 12')")
    date: Optional[str] = Field(default=None, description="ISO date or start date of period (YYYY-MM-DD)")
    current: int = Field(default=0, ge=0, description="Review count in current period")
    previous: Optional[int] = Field(default=None, ge=0, description="Review count in comparison previous period")


class SentimentTrendPoint(BaseModel):
    """Time-series data point for sentiment breakdown trend."""
    model_config = ConfigDict(from_attributes=True)

    period: str = Field(..., description="Display label for the period (e.g. 'Week 1')")
    date: Optional[str] = Field(default=None, description="ISO date or start date (YYYY-MM-DD)")
    positive: int = Field(default=0, ge=0, description="Positive review count in period")
    neutral: int = Field(default=0, ge=0, description="Neutral review count in period")
    negative: int = Field(default=0, ge=0, description="Negative review count in period")
    total: int = Field(default=0, ge=0, description="Total review count in period")


class ReviewTrends(BaseModel):
    """Trend datasets containing volume, rating, and sentiment trends over time."""
    model_config = ConfigDict(from_attributes=True)

    rating_trends: List[RatingTrendPoint] = Field(default_factory=list, description="Rating trends over time")
    volume_trends: List[VolumeTrendPoint] = Field(default_factory=list, description="Review volume trends over time")
    sentiment_trends: List[SentimentTrendPoint] = Field(default_factory=list, description="Sentiment trends over time")


class ReviewTrendsResponse(ReviewTrends):
    """Response schema for the review trends endpoint."""
    business_id: int = Field(..., gt=0, description="The business ID")
    timeframe: Optional[str] = Field(default="30days", description="Selected filter timeframe")


# Alias for backward compatibility
AnalyticsTrendsResponse = ReviewTrendsResponse


# ============================================================================
# 5. Topics and Issues
# ============================================================================

class TopicMetric(BaseModel):
    """Frequently mentioned customer review topic."""
    model_config = ConfigDict(from_attributes=True)

    name: str = Field(..., description="Topic name (e.g. 'Food Quality', 'Customer Service')")
    count: int = Field(default=0, ge=0, description="Number of reviews mentioning this topic")
    percentage: float = Field(default=0.0, ge=0.0, le=100.0, description="Percentage of analyzed reviews mentioning this topic")
    is_positive: bool = Field(default=True, description="Whether sentiment toward this topic is predominantly positive")
    sentiment: Optional[str] = Field(default=None, description="Associated sentiment label (Positive, Neutral, Negative)")


class IssueMetric(BaseModel):
    """Frequently reported customer issue or pain point."""
    model_config = ConfigDict(from_attributes=True)

    issue: str = Field(..., description="Identified problem or complaint description")
    count: int = Field(default=0, ge=0, description="Number of reviews citing this issue")
    percentage: float = Field(default=0.0, ge=0.0, le=100.0, description="Percentage of reviews citing this issue")
    severity: Optional[str] = Field(default=None, description="Issue severity rating ('high', 'medium', 'low')")
    status: Optional[str] = Field(default="open", description="Current tracking status ('open', 'monitoring', 'resolved')")


class TopicsAndIssues(BaseModel):
    """Aggregated review topics and customer pain points."""
    model_config = ConfigDict(from_attributes=True)

    topics: List[TopicMetric] = Field(default_factory=list, description="Top positive and neutral topics")
    issues: List[IssueMetric] = Field(default_factory=list, description="Top identified issues and pain points")
    total_topics_detected: int = Field(default=0, ge=0, description="Total unique topics found")
    total_issues_detected: int = Field(default=0, ge=0, description="Total unique issues found")


class TopicsAndIssuesResponse(TopicsAndIssues):
    """Response schema for the topics and issues endpoint."""
    business_id: int = Field(..., gt=0, description="The business ID")
    timeframe: Optional[str] = Field(default="30days", description="Selected timeframe")


# ============================================================================
# 6. Reply Performance
# ============================================================================

class ReplyRatingBreakdown(BaseModel):
    """Reply statistics grouped by review star rating tier."""
    model_config = ConfigDict(from_attributes=True)

    rating_group: str = Field(..., description="Rating tier (e.g. '1-2 Stars', '3 Stars', '4-5 Stars')")
    total_reviews: int = Field(default=0, ge=0, description="Total reviews in this tier")
    replied_count: int = Field(default=0, ge=0, description="Number of replied reviews in this tier")
    unreplied_count: int = Field(default=0, ge=0, description="Number of reviews awaiting reply in this tier")
    response_rate: float = Field(default=0.0, ge=0.0, le=100.0, description="Response rate percentage for this tier")
    avg_response_hours: Optional[float] = Field(default=None, ge=0.0, description="Average response time in hours")


class ReplyPerformance(BaseModel):
    """Comprehensive review response and reply metrics."""
    model_config = ConfigDict(from_attributes=True)

    total_reviews: int = Field(default=0, ge=0, description="Total number of reviews")
    replied_count: int = Field(default=0, ge=0, description="Total reviews that have received a reply")
    unanswered_count: int = Field(default=0, ge=0, description="Total reviews awaiting a response")
    reply_coverage_percentage: float = Field(
        default=0.0,
        ge=0.0,
        le=100.0,
        description="Percentage of reviews replied to",
    )
    average_response_time_hours: Optional[float] = Field(
        default=None,
        ge=0.0,
        description="Average hours taken to respond to reviews",
    )
    ai_generated_replies_count: int = Field(
        default=0,
        ge=0,
        description="Total replies drafted or generated with AI assistance",
    )
    manual_replies_count: int = Field(
        default=0,
        ge=0,
        description="Total replies drafted manually without AI",
    )
    rating_tier_breakdown: List[ReplyRatingBreakdown] = Field(
        default_factory=list,
        description="Reply performance broken down by star rating tiers",
    )


class ReplyPerformanceResponse(ReplyPerformance):
    """Response schema for the reply performance endpoint."""
    business_id: int = Field(..., gt=0, description="The business ID")
    timeframe: Optional[str] = Field(default="30days", description="Selected timeframe")


# ============================================================================
# 7. AI-Generated Insights
# ============================================================================

class AIInsightItem(BaseModel):
    """Single actionable AI-generated insight from customer reviews."""
    model_config = ConfigDict(from_attributes=True)

    id: Optional[str] = Field(default=None, description="Unique identifier for the insight")
    category: str = Field(..., description="Category (e.g. 'Customer Service', 'Food Quality', 'Cleanliness')")
    insight_type: str = Field(
        ...,
        description="Type of insight: 'strength', 'weakness', 'opportunity', or 'alert'",
    )
    priority: str = Field(default="medium", description="Priority level: 'high', 'medium', or 'low'")
    title: str = Field(..., description="Short headline summarizing the insight")
    description: str = Field(..., description="Detailed explanation grounded in recent customer review evidence")
    actionable_recommendation: Optional[str] = Field(
        default=None,
        description="Concrete suggestion on how the business can address or capitalize on this insight",
    )
    supporting_review_ids: List[int] = Field(
        default_factory=list,
        description="IDs of reviews referenced or backing this insight",
    )


class AIInsights(BaseModel):
    """AI-synthesized business insights and strategic recommendations."""
    model_config = ConfigDict(from_attributes=True)

    executive_summary: str = Field(default="", description="High-level synthesis of customer feedback and brand health")
    key_strengths: List[str] = Field(default_factory=list, description="Top positive themes praised by customers")
    areas_for_improvement: List[str] = Field(default_factory=list, description="Top negative themes and friction points")
    recommended_actions: List[str] = Field(default_factory=list, description="Prioritized list of recommended action steps")
    insights: List[AIInsightItem] = Field(default_factory=list, description="Structured collection of granular insights")
    generated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        description="Timestamp when these AI insights were generated",
    )


class AIInsightsResponse(AIInsights):
    """Response schema containing AI-synthesized business insights and strategic recommendations."""
    business_id: int = Field(..., gt=0, description="The business ID")
    timeframe: Optional[str] = Field(default="30days", description="Selected analysis timeframe")


# ============================================================================
# 8. Consolidated Analytics Dashboard Response
# ============================================================================

class AnalyticsDashboardResponse(BaseModel):
    """Comprehensive analytics dashboard response aggregating all metrics, distributions, trends, and insights."""
    model_config = ConfigDict(from_attributes=True)

    business_id: int = Field(..., gt=0, description="The business ID these analytics belong to")
    timeframe: Optional[str] = Field(default="30days", description="Selected filter timeframe")
    overview: AnalyticsOverview = Field(default_factory=AnalyticsOverview, description="High-level summary metrics")
    rating_distribution: RatingDistribution = Field(default_factory=RatingDistribution, description="1 to 5 star rating distribution")
    sentiment_distribution: SentimentDistribution = Field(default_factory=SentimentDistribution, description="Sentiment breakdown")
    trends: ReviewTrends = Field(default_factory=ReviewTrends, description="Timeline trend datasets")
    topics: List[TopicMetric] = Field(default_factory=list, description="Top mentioned review topics")
    issues: List[IssueMetric] = Field(default_factory=list, description="Top customer issues and complaints")
    topics_and_issues: Optional[TopicsAndIssues] = Field(default=None, description="Grouped topics and issues")
    reply_performance: Optional[ReplyPerformance] = Field(default=None, description="Review reply and coverage metrics")
    ai_insights: Optional[AIInsights] = Field(default=None, description="AI-generated insights and recommendations")
