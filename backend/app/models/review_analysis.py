
from datetime import datetime, timezone

from sqlalchemy import (
    Column,
    Integer,
    String,
    ForeignKey,
    DateTime,
    Text,
    Float,
    JSON,
)
from sqlalchemy.orm import relationship

from app.db.database import Base


class ReviewAnalysis(Base):
    __tablename__ = "review_analyses"

    id = Column(Integer, primary_key=True, index=True)

    review_id = Column(
        Integer,
        ForeignKey("reviews.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    sentiment = Column(String(20), nullable=False)
    emotion = Column(String(30), nullable=False)

    topics = Column(JSON, nullable=False, default=list)
    issues = Column(JSON, nullable=False, default=list)

    summary = Column(Text, nullable=False)
    confidence = Column(Float, nullable=False)

    model_name = Column(String(100), nullable=True)

    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    review = relationship(
        "Review",
        back_populates="analyses",
    )
