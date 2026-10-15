import unittest
from unittest.mock import patch
from fastapi.testclient import TestClient

from app.main import app
from app.db.database import SessionLocal
from app.db import models
from app.models.review import Review
from app.core.security import create_access_token


class TestReviewReplyWorkflow(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)
        cls.db = SessionLocal()

        # Find owner of business 1
        cls.business = cls.db.query(models.Business).filter(models.Business.id == 1).first()
        assert cls.business is not None, "Business with ID 1 must exist for tests"

        cls.owner = cls.db.query(models.User).filter(models.User.id == cls.business.owner_id).first()
        assert cls.owner is not None, "Owner of business 1 must exist"

        cls.owner_token = create_access_token({"sub": str(cls.owner.id)})
        cls.owner_headers = {"Authorization": f"Bearer {cls.owner_token}"}

        # Find or create a non-owner user for unauthorized tests
        non_owner = cls.db.query(models.User).filter(models.User.id != cls.owner.id).first()
        if not non_owner:
            non_owner = models.User(
                name="Non Owner",
                email="nonowner@test.com",
                hashed_password="hashed_pw_test",
                is_verified=True,
            )
            cls.db.add(non_owner)
            cls.db.commit()
            cls.db.refresh(non_owner)

        cls.non_owner = non_owner
        cls.non_owner_token = create_access_token({"sub": str(cls.non_owner.id)})
        cls.non_owner_headers = {"Authorization": f"Bearer {cls.non_owner_token}"}

    @classmethod
    def tearDownClass(cls):
        cls.db.close()

    def setUp(self):
        # Create a clean test review for business 1
        self.test_review = Review(
            business_id=self.business.id,
            google_review_id="test_reply_rev_unique_1",
            customer_name="Alice Smith",
            customer_avatar="AS",
            rating=5,
            review_text="The coffee was exceptional and the staff were wonderful!",
            sentiment="Positive",
            sentiment_score=0.95,
            topics=["Coffee", "Staff"],
            ai_response=None,
            response_status="Needs Response",
            source="Google",
        )
        self.db.add(self.test_review)
        self.db.commit()
        self.db.refresh(self.test_review)

    def tearDown(self):
        # Clean up test review
        if self.test_review and self.test_review.id:
            review_in_db = self.db.query(Review).filter(Review.id == self.test_review.id).first()
            if review_in_db:
                self.db.delete(review_in_db)
                self.db.commit()

    def test_01_unauthenticated_request_returns_401(self):
        """Endpoints must reject unauthenticated requests with 401 Unauthorized"""
        res_gen = self.client.post(f"/api/reviews/{self.test_review.id}/generate-reply")
        self.assertEqual(res_gen.status_code, 401)

        res_edit = self.client.patch(
            f"/api/reviews/{self.test_review.id}/edit-reply",
            json={"reply": "My edited reply"},
        )
        self.assertEqual(res_edit.status_code, 401)

        res_appr = self.client.post(f"/api/reviews/{self.test_review.id}/approve-reply")
        self.assertEqual(res_appr.status_code, 401)

        res_rej = self.client.post(f"/api/reviews/{self.test_review.id}/reject-reply")
        self.assertEqual(res_rej.status_code, 401)

    def test_02_nonexistent_review_returns_404(self):
        """Endpoints must return 404 Not Found for non-existent review IDs"""
        res = self.client.post(
            "/api/reviews/99999999/generate-reply",
            headers=self.owner_headers,
        )
        self.assertEqual(res.status_code, 404)
        self.assertEqual(res.json()["detail"], "Review not found")

    def test_03_non_owner_access_returns_404(self):
        """Users who do not own the business must receive 404 Not Found (tenant isolation)"""
        res = self.client.post(
            f"/api/reviews/{self.test_review.id}/generate-reply",
            headers=self.non_owner_headers,
        )
        self.assertEqual(res.status_code, 404)
        self.assertEqual(res.json()["detail"], "Review not found")

    def test_04_empty_review_text_returns_422(self):
        """Cannot generate AI reply for reviews with empty or blank text"""
        empty_review = Review(
            business_id=self.business.id,
            google_review_id="test_empty_rev_reply",
            customer_name="Quiet Bob",
            rating=3,
            review_text="    ",
            source="Google",
        )
        self.db.add(empty_review)
        self.db.commit()
        self.db.refresh(empty_review)

        try:
            res = self.client.post(
                f"/api/reviews/{empty_review.id}/generate-reply",
                headers=self.owner_headers,
            )
            self.assertEqual(res.status_code, 422)
            self.assertIn("no text", res.json()["detail"].lower())
        finally:
            self.db.delete(empty_review)
            self.db.commit()

    def test_05_generate_reply_saves_draft(self):
        """Generating reply saves response as 'Draft' using ai_response and response_status"""
        mock_reply = "Thank you Alice! We're so glad you enjoyed our coffee and friendly staff."

        with patch("app.routers.review.generate_review_reply", return_value=mock_reply) as mock_gen:
            res = self.client.post(
                f"/api/reviews/{self.test_review.id}/generate-reply",
                headers=self.owner_headers,
                json={"tone": "Warm & Friendly"},
            )
            self.assertEqual(res.status_code, 200)
            data = res.json()
            self.assertEqual(data["review_id"], self.test_review.id)
            self.assertEqual(data["reply"], mock_reply)
            self.assertEqual(data["response_status"], "Draft")
            self.assertIn("successfully", data["message"].lower())

            # Verify mock received parameters including sentiment and tone
            mock_gen.assert_called_once_with(
                review_text=self.test_review.review_text,
                rating=self.test_review.rating,
                business_name=self.business.name,
                ai_tone="Warm & Friendly",
                custom_rules=self.business.custom_rules,
                sentiment="Positive",
            )

        # Verify database record
        self.db.refresh(self.test_review)
        self.assertEqual(self.test_review.ai_response, mock_reply)
        self.assertEqual(self.test_review.response_status, "Draft")
        self.assertIsNotNone(self.test_review.updated_at)

    def test_06_edit_reply_draft(self):
        """Draft replies can be edited, maintaining Draft status"""
        # First set initial draft
        self.test_review.ai_response = "Initial draft response"
        self.test_review.response_status = "Draft"
        self.db.commit()

        new_reply = "Customized personal response edited by business owner."
        res = self.client.patch(
            f"/api/reviews/{self.test_review.id}/edit-reply",
            headers=self.owner_headers,
            json={"reply": new_reply},
        )
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["reply"], new_reply)
        self.assertEqual(data["response_status"], "Draft")

        # Verify DB
        self.db.refresh(self.test_review)
        self.assertEqual(self.test_review.ai_response, new_reply)
        self.assertEqual(self.test_review.response_status, "Draft")

        # Test validation: empty reply returns 422
        res_empty = self.client.patch(
            f"/api/reviews/{self.test_review.id}/edit-reply",
            headers=self.owner_headers,
            json={"reply": "   "},
        )
        self.assertEqual(res_empty.status_code, 422)

    def test_07_approve_draft_never_publishes_automatically(self):
        """Approving draft marks it 'Approved' in database and never publishes externally"""
        # Approving without draft returns 400
        self.test_review.ai_response = None
        self.test_review.response_status = "Needs Response"
        self.db.commit()

        res_no_draft = self.client.post(
            f"/api/reviews/{self.test_review.id}/approve-reply",
            headers=self.owner_headers,
        )
        self.assertEqual(res_no_draft.status_code, 400)
        self.assertIn("no draft reply", res_no_draft.json()["detail"].lower())

        # Set draft and approve
        self.test_review.ai_response = "Ready to approve draft"
        self.test_review.response_status = "Draft"
        self.db.commit()

        res_approve = self.client.post(
            f"/api/reviews/{self.test_review.id}/approve-reply",
            headers=self.owner_headers,
        )
        self.assertEqual(res_approve.status_code, 200)
        data = res_approve.json()
        self.assertEqual(data["response_status"], "Approved")
        self.assertIn("not be published automatically", data["message"])

        # Verify DB
        self.db.refresh(self.test_review)
        self.assertEqual(self.test_review.response_status, "Approved")
        self.assertEqual(self.test_review.ai_response, "Ready to approve draft")

    def test_08_reject_draft(self):
        """Rejecting draft updates response status to 'Rejected'"""
        self.test_review.ai_response = "A draft that owner decides to reject"
        self.test_review.response_status = "Draft"
        self.db.commit()

        res = self.client.post(
            f"/api/reviews/{self.test_review.id}/reject-reply",
            headers=self.owner_headers,
        )
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["response_status"], "Rejected")

        # Verify DB
        self.db.refresh(self.test_review)
        self.assertEqual(self.test_review.response_status, "Rejected")

    def test_09_route_aliases_work(self):
        """Route aliases (/reply, /reply/approve, /reply/reject) function properly"""
        self.test_review.ai_response = "Draft for alias testing"
        self.test_review.response_status = "Draft"
        self.db.commit()

        # Edit via PATCH /api/reviews/{id}/reply
        res_edit = self.client.patch(
            f"/api/reviews/{self.test_review.id}/reply",
            headers=self.owner_headers,
            json={"reply": "Edited via alias route"},
        )
        self.assertEqual(res_edit.status_code, 200)
        self.assertEqual(res_edit.json()["reply"], "Edited via alias route")

        # Approve via POST /api/reviews/{id}/reply/approve
        res_appr = self.client.post(
            f"/api/reviews/{self.test_review.id}/reply/approve",
            headers=self.owner_headers,
        )
        self.assertEqual(res_appr.status_code, 200)
        self.assertEqual(res_appr.json()["response_status"], "Approved")

        # Reject via POST /api/reviews/{id}/reply/reject
        res_rej = self.client.post(
            f"/api/reviews/{self.test_review.id}/reply/reject",
            headers=self.owner_headers,
        )
        self.assertEqual(res_rej.status_code, 200)
        self.assertEqual(res_rej.json()["response_status"], "Rejected")

    def test_10_live_gemini_generation(self):
        """End-to-end test calling live Gemini API and verifying personalized draft in DB"""
        res = self.client.post(
            f"/api/reviews/{self.test_review.id}/generate-reply",
            headers=self.owner_headers,
        )
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["response_status"], "Draft")
        self.assertTrue(len(data["reply"]) > 10)

        # Check DB
        self.db.refresh(self.test_review)
        self.assertEqual(self.test_review.response_status, "Draft")
        self.assertEqual(self.test_review.ai_response, data["reply"])


if __name__ == "__main__":
    unittest.main()
