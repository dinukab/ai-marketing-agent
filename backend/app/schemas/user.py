from pydantic import BaseModel, EmailStr

# User kenek register weddi ena data format eka
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str

# API eken return karana data format eka (password eka yawanne na)
class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    
    class Config:
        from_attributes = True
