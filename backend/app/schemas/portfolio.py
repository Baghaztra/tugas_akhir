from typing import Optional
from datetime import datetime
from pydantic import BaseModel


class PortfolioItemCreate(BaseModel):
    title: str
    category: str
    description: Optional[str] = ""


class PortfolioItemUpdate(BaseModel):
    title: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None


class PortfolioItemRead(BaseModel):
    id: int
    title: str
    category: str
    image: Optional[str]
    description: Optional[str]
    createdAt: Optional[datetime]

    class Config:
        from_attributes = True
