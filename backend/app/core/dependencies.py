from fastapi import Depends, HTTPException, Request, status
from sqlalchemy.orm import Session
import jwt
from jwt.exceptions import PyJWTError

from app.core.security import SECRET_KEY, ALGORITHM
from app.db.database import get_db
from app.db import models


def get_current_user(
    request: Request,
    db: Session = Depends(get_db),
) -> models.User:
    token = request.cookies.get("access_token")

    # If cookie is not present, check Authorization header as fallback
    if not token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header[7:]

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # In case the cookie value was stored with "Bearer " prefix
    if token.startswith("Bearer "):
        token = token[7:]

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str | None = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
    except PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        user_id_int = int(user_id)
    except (ValueError, TypeError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid user identifier",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = db.query(models.User).filter(models.User.id == user_id_int).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user


def get_optional_current_user(
    request: Request,
    db: Session = Depends(get_db),
) -> models.User | None:
    try:
        return get_current_user(request, db)
    except HTTPException:
        return None
