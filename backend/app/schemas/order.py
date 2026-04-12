from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum


class OrderStatus(str, Enum):
    RECEIVED = "received"
    CUTTING = "cutting"
    SEWING = "sewing"
    FINISHING = "finishing"
    DONE = "done"


class PaymentStatus(str, Enum):
    PAID = "paid"
    UNPAID = "unpaid"
    PARTIAL = "partial"


# OrderLog
class OrderLogBase(BaseModel):
    status: str
    note: Optional[str] = ""
    employeeName: Optional[str] = "Admin"

class OrderLogCreate(OrderLogBase):
    pass

class OrderLog(OrderLogBase):
    id: int
    order_item_id: int
    createdAt: datetime

    class Config:
        from_attributes = True


# OrderItem
class OrderItemBase(BaseModel):
    garmentType: str
    description: Optional[str] = None
    quantity: Optional[int] = 1
    measurements: Optional[Dict[str, Any]] = Field(default_factory=dict)
    attributes: Optional[Dict[str, Any]] = Field(default_factory=dict)

class OrderItemCreate(OrderItemBase):
    pass

class OrderItem(OrderItemBase):
    id: int
    status: OrderStatus
    logs: List[OrderLog] = []

    class Config:
        from_attributes = True


# Order
class OrderBase(BaseModel):
    customerName: str
    customerPhone: Optional[str] = None
    deadline: str
    totalPrice: Optional[float] = 0
    paidAmount: Optional[float] = 0
    paymentStatus: Optional[PaymentStatus] = PaymentStatus.UNPAID
    notes: Optional[str] = None

class OrderCreate(OrderBase):
    items: List[OrderItemCreate]

class OrderUpdate(BaseModel):
    customerName: Optional[str] = None
    customerPhone: Optional[str] = None
    deadline: Optional[str] = None
    paymentStatus: Optional[PaymentStatus] = None
    totalPrice: Optional[float] = None
    paidAmount: Optional[float] = None
    notes: Optional[str] = None

class Order(OrderBase):
    id: int
    receiptNumber: str
    createdAt: datetime
    updatedAt: Optional[datetime] = None
    items: List[OrderItem] = []

    class Config:
        from_attributes = True

# Tracking
class OrderTracking(BaseModel):
    id: int
    receiptNumber: str
    customerName: str
    paymentStatus: PaymentStatus
    totalPrice: float
    paidAmount: float
    deadline: str
    createdAt: datetime
    items: List[OrderItem] = []

    class Config:
        from_attributes = True
