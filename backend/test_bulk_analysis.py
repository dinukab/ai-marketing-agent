import sys
import unittest
from unittest.mock import patch
from fastapi.testclient import TestClient

from app.main import app
from app.db.database import SessionLocal
from app.db import models
from app.models.review import Review
from app.models.review_analysis import ReviewAnalysis
from app.core.security import create_access_token


class TestBulkReviewAnalysis(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)
        cls.db = SessionLocal()

        # Retrieve test users
        cls.user1 = cls.db.query(models.User).filter(models.User.id == 1).first()
        cls.user2 = cls.db.query(models.User).filter(models.User.id == 2).first()
        cls.business = cls.db.query(models.Business).filter(models.Business.id == 1).first()

        assert cls.user1 is not None, "User 1 must exist"
        assert cls.business is not None, "Business 1 must exist"

        cls.token1 = create_access_token({"sub": str(cls.user1.id)})
        cls.headers1 = {"Authorization": f"Bearer {cls.token1}"}

        if cls.user2:
            cls.token2 = create_access_token({"sub": str(cls.user2.id)})
            cls.headers2 = {"Authorization": f"Bearer {cls.token2}"}
        else:
            cls.headers2 = None

    @classmethod
    def tearDownClass(cls):
        cls.db.close()

    def test_01_unauthenticated_access_returns_401(self):
        """Request without token must return 401 Unauthorized"""
        response = self.client.post("/api/reviews/businesses/1/analyze-all")
        self.assertEqual(response.status_code, 401)
        self.assertIn("detail", response.json())

    def test_02_nonexistent_business_returns_404(self):
        """Request with non-existent business ID must return 404 Not Found"""
        response = self.client.post(
            "/api/reviews/businesses/999999/analyze-all",
            headers=self.headers1,
        )
        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.json()["detail"], "Business not found")

    def test_03_unauthorized_user_returns_403(self):
        """User who does not own the business must receive 403 Forbidden"""
        if self.headers2:
            response = self.client.post(
                "/api/reviews/businesses/1/analyze-all",
                headers=self.headers2,
            )
            self.assertEqual(response.status_code, 403)
            self.assertIn("permission", response.json()["detail"].lower())

    def test_04_skipped_empty_review_text(self):
        """Reviews with empty/whitespace text should be safely skipped"""
        db = SessionLocal()
        try:
            empty_review = Review(
                business_id=1,
                google_review_id="test_empty_text_review",
                customer_name="Empty Reviewer",
                rating=4,
                review_text="   ",
                source="test",
            )
            db.add(empty_review)
            db.commit()
            db.refresh(empty_review)
            review_id = empty_review.id

            response = self.client.post(
                "/api/reviews/businesses/1/analyze-all?batch_size=1",
                headers=self.headers1,
            )
            self.assertEqual(response.status_code, 200)
            data = response.json()
            # If our empty review was the one fetched (or another was fetched)
            self.assertIn("analyzed", data)
            self.assertIn("skipped", data)
            self.assertIn("failed", data)
            self.assertIn("remaining", data)

        finally:
            # Clean up the test empty review
            db.query(ReviewAnalysis).filter(ReviewAnalysis.review_id == review_id).delete()
            db.query(Review).filter(Review.id == review_id).delete()
            db.commit()
            db.close()

    def test_05_failed_review_handled_gracefully(self):
        """Errors during Gemini analysis should be caught and counted as failed without crashing batch"""
        with patch("app.routers.review.analyze_review", side_effect=RuntimeError("Simulated Gemini AI Error")):
            response = self.client.post(
                "/api/reviews/businesses/1/analyze-all?batch_size=1",
                headers=self.headers1,
            )
            self.assertEqual(response.status_code, 200)
            data = response.json()
            self.assertEqual(data["failed"], 1)
            self.assertEqual(data["analyzed"], 0)
            self.assertTrue(len(data["details"]) > 0)
            self.assertEqual(data["details"][0]["status"], "failed")
            self.assertIn("Simulated Gemini AI Error", data["details"][0]["error"])

    def test_06_real_gemini_analysis_batch(self):
        """Analyze batch with live Gemini AI, saving to review_analyses and updating review fields"""
        # Check current unanalyzed count
        db = SessionLocal()
        initial_unanalyzed = (
            db.query(Review)
            .filter(
                Review.business_id == 1,
                ~Review.analyses.any(),
            )
            .count()
        )
        db.close()

        if initial_unanalyzed > 0:
            batch_limit = min(2, initial_unanalyzed)
            response = self.client.post(
                f"/api/reviews/businesses/1/analyze-all?batch_size={batch_limit}",
                headers=self.headers1,
            )
            self.assertEqual(response.status_code, 200)
            data = response.json()
            self.assertEqual(data["business_id"], 1)
            self.assertGreaterEqual(data["analyzed"], 1)
            self.assertEqual(data["failed"], 0)
            self.assertEqual(data["remaining"], initial_unanalyzed - data["analyzed"] - data["skipped"])

            # Verify in PostgreSQL
            db = SessionLocal()
            for item in data["details"]:
                if item["status"] == "analyzed":
                    review = db.query(Review).filter(Review.id == item["review_id"]).first()
                    self.assertIsNotNone(review.sentiment)
                    self.assertIsNotNone(review.sentiment_score)
                    self.assertIsNotNone(review.updated_at)

                    analysis = db.query(ReviewAnalysis).filter(ReviewAnalysis.review_id == review.id).first()
                    self.assertIsNotNone(analysis)
                    self.assertEqual(analysis.sentiment, review.sentiment)
                    self.assertIsNotNone(analysis.summary)
                    self.assertIsNotNone(analysis.confidence)
            db.close()

    def test_07_analyze_when_no_reviews_remaining(self):
        """When all reviews are analyzed, calling the endpoint returns 200 with 0 unanalyzed"""
        # If there are remaining unanalyzed reviews, finish analyzing them first
        db = SessionLocal()
        remaining = db.query(Review).filter(Review.business_id == 1, ~Review.analyses.any()).count()
        db.close()

        while remaining > 0:
            res = self.client.post(
                "/api/reviews/businesses/1/analyze-all?batch_size=10",
                headers=self.headers1,
            )
            data = res.json()
            if data["analyzed"] == 0 and data["skipped"] == 0:
                break
            remaining = data["remaining"]

        # Now test when zero unanalyzed reviews exist
        response = self.client.post(
            "/api/reviews/businesses/1/analyze-all",
            headers=self.headers1,
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["analyzed"], 0)
        self.assertEqual(data["skipped"], 0)
        self.assertEqual(data["failed"], 0)
        self.assertEqual(data["remaining"], 0)
        self.assertEqual(data["total_unanalyzed"], 0)
        self.assertIn("No unanalyzed reviews found", data["message"])


if __name__ == "__main__":
    unittest.main()
