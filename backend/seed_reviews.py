from datetime import datetime, timedelta

from app.db.database import SessionLocal
from app.db.models import Business, User
from app.models.review import Review


db = SessionLocal()

try:
    # Ensure there is a Business with ID 1 to satisfy the foreign key constraint
    business = db.query(Business).filter(Business.id == 1).first()
    if not business:
        user = db.query(User).first()
        if not user:
            user = User(name="Test User", email="test@example.com", hashed_password="hashedpassword")
            db.add(user)
            db.commit()
            db.refresh(user)
            
        business = Business(id=1, name="Test Business", owner_id=user.id)
        db.add(business)
        db.commit()

    # Clear existing test reviews so we don't get duplicate key errors
    db.query(Review).filter(Review.source == "test").delete()
    db.commit()

    reviews = [
        Review(
            business_id=1,
            google_review_id="test_review_001",
            customer_name="Sarah M.",
            rating=5,
            review_text="Amazing service and very friendly staff. The food was delicious and arrived quickly.",
            review_date=datetime.now() - timedelta(days=1),
            sentiment="positive",
            sentiment_score=0.96,
            topics=["Customer Service", "Staff", "Food Quality"],
            ai_response=None,
            response_status="pending",
            source="test"
        ),

        Review(
            business_id=1,
            google_review_id="test_review_002",
            customer_name="John D.",
            rating=3,
            review_text="The food was good, but the delivery took much longer than expected.",
            review_date=datetime.now() - timedelta(days=2),
            sentiment="neutral",
            sentiment_score=0.55,
            topics=["Food Quality", "Delivery"],
            ai_response=None,
            response_status="pending",
            source="test"
        ),

        Review(
            business_id=1,
            google_review_id="test_review_003",
            customer_name="Michael R.",
            rating=5,
            review_text="Excellent experience! The staff were very helpful and the restaurant was clean.",
            review_date=datetime.now() - timedelta(days=3),
            sentiment="positive",
            sentiment_score=0.94,
            topics=["Customer Service", "Staff", "Location"],
            ai_response=None,
            response_status="pending",
            source="test"
        ),

        Review(
            business_id=1,
            google_review_id="test_review_004",
            customer_name="Emma W.",
            rating=2,
            review_text="The delivery was very late and the food was not as fresh as expected.",
            review_date=datetime.now() - timedelta(days=4),
            sentiment="negative",
            sentiment_score=0.91,
            topics=["Delivery", "Food Quality"],
            ai_response=None,
            response_status="pending",
            source="test"
        ),

        Review(
            business_id=1,
            google_review_id="test_review_005",
            customer_name="Daniel P.",
            rating=4,
            review_text="Good food and nice atmosphere. The prices are reasonable.",
            review_date=datetime.now() - timedelta(days=5),
            sentiment="positive",
            sentiment_score=0.82,
            topics=["Food Quality", "Price", "Location"],
            ai_response=None,
            response_status="pending",
            source="test"
        ),

        Review(
            business_id=1,
            google_review_id="test_review_006",
            customer_name="Sophia K.",
            rating=1,
            review_text="Very disappointing experience. My order arrived late and the staff did not help.",
            review_date=datetime.now() - timedelta(days=6),
            sentiment="negative",
            sentiment_score=0.97,
            topics=["Delivery", "Customer Service"],
            ai_response=None,
            response_status="pending",
            source="test"
        ),

        Review(
            business_id=1,
            google_review_id="test_review_007",
            customer_name="David T.",
            rating=5,
            review_text="Wonderful restaurant. The food was excellent and the staff were extremely friendly.",
            review_date=datetime.now() - timedelta(days=7),
            sentiment="positive",
            sentiment_score=0.98,
            topics=["Food Quality", "Staff", "Customer Service"],
            ai_response=None,
            response_status="approved",
            source="test"
        ),

        Review(
            business_id=1,
            google_review_id="test_review_008",
            customer_name="Olivia J.",
            rating=4,
            review_text="Really good experience overall. The food was tasty but the waiting time was a little long.",
            review_date=datetime.now() - timedelta(days=8),
            sentiment="positive",
            sentiment_score=0.76,
            topics=["Food Quality", "Service"],
            ai_response=None,
            response_status="pending",
            source="test"
        ),
    ]

    db.add_all(reviews)
    db.commit()

    print("Test reviews added successfully!")

except Exception as e:
    db.rollback()
    print("Error:", e)

finally:
    db.close()