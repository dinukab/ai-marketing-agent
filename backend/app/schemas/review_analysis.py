
from typing import Literal
from pydantic import BaseModel, Field


class ReviewAnalysisResult(BaseModel):
    sentiment: Literal[
        "positive",
        "negative",
        "neutral",
        "mixed",
        "unclear",
    ]

    emotion: Literal[
        "happy",
        "satisfied",
        "excited",
        "grateful",
        "disappointed",
        "frustrated",
        "angry",
        "sad",
        "calm",
        "confused",
        "mixed",
        "neutral",
        "unclear",
    ]

    topics: list[str]
    issues: list[str]
    summary: str

    confidence: float = Field(ge=0.0, le=1.0)
