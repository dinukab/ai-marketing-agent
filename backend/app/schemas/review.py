from pydantic import BaseModel, Field
from typing import Optional, List, Any
from datetime import datetime

class ReviewBase(BaseModel):
    business_id: int = Field(..., gt=0, description="The ID of the business this review belongs to")
    google_review_id: Optional[str] = Field(None, description="Unique identifier from Google Reviews")
    customer_name: Optional[str] = Field(None, max_length=255)
    customer_avatar: Optional[str] = None
    rating: int = Field(..., ge=1, le=5, description="Rating from 1 to 5 stars")
    review_text: Optional[str] = None
    review_date: Optional[datetime] = None
    sentiment: Optional[str] = Field(None, max_length=50)
    sentiment_score: Optional[float] = Field(None, ge=-1.0, le=1.0)
    topics: Optional[Any] = None # JSON can be complex, Any or List[str] if always list of strings
    ai_response: Optional[str] = None
    response_status: Optional[str] = Field(None, max_length=50)
    source: Optional[str] = Field(None, max_length=100)

class ReviewCreate(ReviewBase):
    pass

class ReviewUpdate(BaseModel):
    ai_response: Optional[str] = Field(None, description="The AI generated or owner drafted response to the review")
    response_status: Optional[str] = Field(None, max_length=50, description="State of the response (e.g. Draft Pending, Published, Needs Response)")

class ReviewResponse(ReviewBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class PaginatedReviewResponse(BaseModel):
    items: List[ReviewResponse]
    total: int
    page: int
    limit: int
    total_pages: int

from typing import Dict

class ReviewStats(BaseModel):
    total_reviews: int
    positive_count: int
    neutral_count: int
    negative_count: int
    average_rating: float
    awaiting_response_count: int
    answered_count: int
    rating_distribution: Dict[int, int]

