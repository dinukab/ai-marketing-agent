
from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone
from app.db.database import get_db
from app.db import models
from app.schemas.auth import RegisterRequest, LoginRequest, TokenResponse, MessageResponse, ForgotPasswordRequest, ResetPasswordRequest
from app.schemas.user import UserResponse
from app.core.security import hash_password, verify_password, create_access_token, generate_password_reset_token, hash_token
from app.services.email_service import send_password_reset_email

router = APIRouter(prefix="/api/auth", tags=["auth"])

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
    
    # Set HttpOnly cookie
    response.set_cookie(
        key="access_token",
        value=f"Bearer {access_token}",
        httponly=True,
        samesite="lax",
        secure=False, # Set to True in production with HTTPS
        max_age=3600
    )
    
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/logout", response_model=MessageResponse)
def logout(response: Response):
    response.delete_cookie(
        key="access_token",
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
