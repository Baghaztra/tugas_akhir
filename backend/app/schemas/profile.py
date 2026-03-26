from typing import Optional
from pydantic import BaseModel


class BusinessProfileBase(BaseModel):
    name: Optional[str] = None
    slogan: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    hours: Optional[str] = None
    instagram: Optional[str] = None
    logo: Optional[str] = None


class BusinessProfileUpdate(BusinessProfileBase):
    """Semua field optional — partial update."""
    pass


class BusinessProfileRead(BaseModel):
    id: int
    name: str
    slogan: Optional[str]
    address: Optional[str]
    phone: Optional[str]
    email: Optional[str]
    hours: Optional[str]
    instagram: Optional[str]
    logo: Optional[str]

    class Config:
        from_attributes = True
