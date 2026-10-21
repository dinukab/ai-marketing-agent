from pydantic import BaseModel, EmailStr
from typing import Optional

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    business_category: Optional[str] = None

class UserResponse(BaseModel):
    id: int
    name: str
    email: str

    class Config:
        from_attributes = True

class BusinessSummary(BaseModel):
    id: int
    name: str
    location: Optional[str] = None
    ai_tone: Optional[str] = "Professional"

    class Config:
        from_attributes = True

class UserMeResponse(BaseModel):
    id: int
    name: str
    email: str
    businesses: list[BusinessSummary] = []

    class Config:
        from_attributes = True

class UserLogin(BaseModel):
    email: EmailStr
    password: str
