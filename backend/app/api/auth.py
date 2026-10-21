
from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone
from app.db.database import get_db
from app.db import models
from app.models.review import Review
from app.schemas.auth import RegisterRequest, LoginRequest, TokenResponse, MessageResponse, ForgotPasswordRequest, ResetPasswordRequest
from app.schemas.user import UserResponse, UserMeResponse
from app.core.security import hash_password, verify_password, create_access_token, generate_password_reset_token, hash_token
from app.core.dependencies import get_current_user
from app.services.email_service import send_password_reset_email

router = APIRouter(prefix="/api/auth", tags=["auth"])

def seed_default_reviews_for_business(business_id: int, db: Session):
    existing = db.query(Review).filter(Review.business_id == business_id).first()
    if existing:
        return
    sample_reviews = [
        Review(
            business_id=business_id,
            google_review_id=f"g_rev_{business_id}_1",
            customer_name="Sarah M.",
            customer_avatar="SM",
            rating=5,
            review_text="The service was excellent. The staff were very friendly and the flat white was perfect. Definitely coming back for their weekend brunch pastries!",
            review_date=datetime.now(timezone.utc) - timedelta(days=1),
            sentiment="Positive",
            sentiment_score=0.96,
            topics=["Customer Service", "Staff", "Coffee Quality"],
            ai_response=None,
            response_status="Needs Response",
            source="Google Local Guide • Level 4"
        ),
        Review(
            business_id=business_id,
            google_review_id=f"g_rev_{business_id}_2",
            customer_name="John D.",
            customer_avatar="JD",
            rating=3,
            review_text="The food was good, but the delivery took much longer than expected. It arrived lukewarm.",
            review_date=datetime.now(timezone.utc) - timedelta(days=2),
            sentiment="Neutral",
            sentiment_score=0.45,
            topics=["Food Quality", "Delivery Delays"],
            ai_response=None,
            response_status="Needs Response",
            source="Google"
        ),
        Review(
            business_id=business_id,
            google_review_id=f"g_rev_{business_id}_3",
            customer_name="Sophia K.",
            customer_avatar="SK",
            rating=1,
            review_text="Very disappointing experience. The order was completely wrong and the cashier was rude when I pointed it out.",
            review_date=datetime.now(timezone.utc) - timedelta(days=3),
            sentiment="Negative",
            sentiment_score=0.15,
            topics=["Staff Attitude", "Order Accuracy"],
            ai_response=None,
            response_status="Needs Response",
            source="Google"
        ),
        Review(
            business_id=business_id,
            google_review_id=f"g_rev_{business_id}_4",
            customer_name="Michael R.",
            customer_avatar="MR",
            rating=5,
            review_text="Outstanding brunch spot! The truffle avocado toast and seasonal matcha latte are world-class.",
            review_date=datetime.now(timezone.utc) - timedelta(days=4),
            sentiment="Positive",
            sentiment_score=0.98,
            topics=["Atmosphere", "Food Quality", "Beverage Craft"],
            ai_response="Thank you Michael! We're thrilled you loved the truffle avocado toast and matcha latte. See you soon!",
            response_status="Draft",
            source="Google Local Guide • Level 6"
        )
    ]
    db.add_all(sample_reviews)
    db.commit()

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user: RegisterRequest, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    new_user = models.User(
        name=user.name, 
        email=user.email, 
        hashed_password=hash_password(user.password)
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Auto-create a default business for the user
    business_name = f"{new_user.name}'s Business" if new_user.name else "My Business"
    new_business = models.Business(
        name=business_name,
        ai_tone="Warm & Friendly",
        owner_id=new_user.id
    )
    db.add(new_business)
    db.commit()
    db.refresh(new_business)
    seed_default_reviews_for_business(new_business.id, db)

    return new_user

@router.post("/login", response_model=TokenResponse)
def login(response: Response, login_data: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == login_data.email).first()
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )

    access_token = create_access_token(data={"sub": str(user.id)})
    
    # Set HttpOnly cookie with path="/" for all API routes
    response.set_cookie(
        key="access_token",
        value=f"Bearer {access_token}",
        httponly=True,
        samesite="lax",
        secure=False, # Set to True in production with HTTPS
        path="/",
        max_age=86400
    )
    # Return token and user info in response body
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email
        }
    }

@router.get("/me", response_model=UserMeResponse)
def get_me(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Return the authenticated user profile and their businesses."""
    businesses = db.query(models.Business).filter(models.Business.owner_id == current_user.id).all()
    if not businesses:
        business_name = f"{current_user.name}'s Business" if current_user.name else "My Business"
        new_business = models.Business(
            name=business_name,
            ai_tone="Warm & Friendly",
            owner_id=current_user.id
        )
        db.add(new_business)
        db.commit()
        db.refresh(new_business)
        seed_default_reviews_for_business(new_business.id, db)
        businesses = [new_business]

    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "businesses": businesses
    }

@router.post("/logout", response_model=MessageResponse)
def logout(response: Response):
    response.delete_cookie(
        key="access_token",
        path="/",
        httponly=True,
        samesite="lax",
        secure=False
    )
    return {"message": "Successfully logged out"}


@router.post("/forgot-password", response_model=MessageResponse)
def forgot_password(request: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == request.email).first()
    if user:
        # Generate a secure token
        reset_token = generate_password_reset_token()
        hashed_token = hash_token(reset_token)
        
        # Save token to db, expires in 1 hour
        expires = datetime.now(timezone.utc) + timedelta(hours=1)
        db_token = models.PasswordResetToken(
            user_id=user.id,
            token_hash=hashed_token,
            expires_at=expires
        )
        db.add(db_token)
        db.commit()
        
        try:
            send_password_reset_email(to_email=user.email, reset_token=reset_token)
            print(f"DEBUG: Sent password reset email to {user.email}")
        except Exception as e:
            print(f"ERROR: Failed to send password reset email to {user.email}: {e}")
        
    return {"message": "If an account with that email exists, a password reset link has been sent."}


@router.post("/reset-password", response_model=MessageResponse)
def reset_password(request: ResetPasswordRequest, db: Session = Depends(get_db)):
    # Hash the incoming plain text token
    hashed_token = hash_token(request.token)
    
    # Find token in database
    db_token = db.query(models.PasswordResetToken).filter(
        models.PasswordResetToken.token_hash == hashed_token,
        models.PasswordResetToken.used_at.is_(None),
        models.PasswordResetToken.expires_at > datetime.now(timezone.utc)
    ).first()
    
    if not db_token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token"
        )
        
    # Find the associated user
    user = db.query(models.User).filter(models.User.id == db_token.user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
        
    # Update user password
    user.hashed_password = hash_password(request.new_password)
    
    # Mark token as used
    db_token.used_at = datetime.now(timezone.utc)
    
    db.commit()
    
    return {"message": "Password successfully reset"}
