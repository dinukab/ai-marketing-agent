from pydantic import BaseModel, EmailStr
<<<<<<< HEAD
from typing import Optional

=======

# User kenek register weddi ena data format eka
>>>>>>> 62f3942b68ee77f09ed226535d84b0f9b4ce5ea5
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
<<<<<<< HEAD
    business_category: Optional[str] = None

=======

# API eken return karana data format eka (password eka yawanne na)
>>>>>>> 62f3942b68ee77f09ed226535d84b0f9b4ce5ea5
class UserResponse(BaseModel):
    id: int
    name: str
    email: str
<<<<<<< HEAD

    class Config:
        from_attributes = True

class UserLogin(BaseModel):
    email: EmailStr
    password: str

=======
    
    class Config:
        from_attributes = True
>>>>>>> 62f3942b68ee77f09ed226535d84b0f9b4ce5ea5
