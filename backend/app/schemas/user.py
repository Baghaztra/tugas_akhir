from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class UserBase(BaseModel):
    name: str
    email: EmailStr


class UserCreate(UserBase):
    password: str
    is_owner: bool = False


class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    is_owner: Optional[bool] = None


class User(UserBase):
    id: int
    is_owner: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True