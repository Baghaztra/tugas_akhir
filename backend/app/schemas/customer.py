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
    total_orders: int = 0

    class Config:
        from_attributes = True


class CustomerOrderItem(BaseModel):
    id: int
    receipt_number: str
    total_price: float
    dp_amount: float
    payment_status: str
    status: str
    created_at: datetime


class CustomerDetail(BaseModel):
    customer: Customer
    orders: List[CustomerOrderItem] = []
    total_bon: float = 0