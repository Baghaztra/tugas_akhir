from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class CustomerBase(BaseModel):
    name: str
    phone: Optional[str] = None
    lingkar_badan: Optional[float] = None
    lingkar_pinggang: Optional[float] = None
    lingkar_panggul: Optional[float] = None
    panjang_bahu: Optional[float] = None
    panjang_tgn: Optional[float] = None
    panjang_baju: Optional[float] = None
    panjang_rok: Optional[float] = None


class CustomerUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    lingkar_badan: Optional[float] = None
    lingkar_pinggang: Optional[float] = None
    lingkar_panggul: Optional[float] = None
    panjang_bahu: Optional[float] = None
    panjang_tgn: Optional[float] = None
    panjang_baju: Optional[float] = None
    panjang_rok: Optional[float] = None


class CustomerBrief(BaseModel):
    id: int
    name: str
    phone: Optional[str] = None

    class Config:
        from_attributes = True


class Customer(CustomerBase):
    id: int
    createdAt: datetime
    updatedAt: Optional[datetime] = None

    class Config:
        from_attributes = True