
import time
from app.services.review_analysis_service import analyze_review


test_reviews = [
    "Amazing service! The staff were friendly and helpful.",

    "The delivery was late and the staff were very rude.",

    "The shop opens at 9 AM and closes at 6 PM.",

    "The food was delicious, but the service was terrible.",

    "Yeah, excellent service... I waited two hours!",

    "It was okay. Nothing special.",
]


for review in test_reviews:
    print("\n" + "=" * 60)
    print("REVIEW:", review)

    try:
        result = analyze_review(review)
        print(result.model_dump_json(indent=2))
    except Exception as error:
        print("Analysis failed:", type(error).__name__, "-", error)
        print("Check your API configuration, quota and network.")

    time.sleep(0.5)

