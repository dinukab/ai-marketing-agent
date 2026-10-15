from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text, Float, JSON
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.db.database import Base

class Review(Base):
    __tablename__ = "reviews"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    business_id = Column(Integer, ForeignKey("businesses.id"), nullable=False)
    google_review_id = Column(String, unique=True, index=True, nullable=True)
    customer_name = Column(String, nullable=True)
    customer_avatar = Column(String, nullable=True)
    rating = Column(Integer, nullable=False)
    review_text = Column(Text, nullable=True)
    review_date = Column(DateTime, nullable=True)
    sentiment = Column(String, nullable=True)
    sentiment_score = Column(Float, nullable=True)
    topics = Column(JSON, nullable=True)
    ai_response = Column(Text, nullable=True)
    response_status = Column(String, nullable=True)
    source = Column(String, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationship
    business = relationship("Business", back_populates="reviews")

    analyses = relationship(
        "ReviewAnalysis",
        back_populates="review",
        cascade="all, delete-orphan",
    )

