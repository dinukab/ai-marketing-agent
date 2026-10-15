
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.review_analysis_service import analyze_review


router = APIRouter(
    prefix="/api/ai",
    tags=["AI Sentiment Analysis"],
)


class ReviewAnalysisRequest(BaseModel):
    review_text: str = Field(
        min_length=1,
        max_length=10000,
    )


@router.post("/analyze-review")
def analyze_review_endpoint(
    request: ReviewAnalysisRequest,
):
    try:
        result = analyze_review(request.review_text)
        return result.model_dump()

    except ValueError as error:
        raise HTTPException(
            status_code=422,
            detail=str(error),
        )

    except Exception:
        # Log the detailed exception on the server in production.
        raise HTTPException(
            status_code=502,
            detail="AI analysis failed. Please try again later.",
        )
