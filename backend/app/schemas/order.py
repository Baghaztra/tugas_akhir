from pydantic import BaseModel
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


# ─── OrderLog ────────────────────────────────────────────────────────────────

class OrderLogBase(BaseModel):
    status: str
    note: Optional[str] = ""
    employeeName: Optional[str] = "Admin"


class OrderLogCreate(OrderLogBase):
    pass


class OrderLog(OrderLogBase):
    id: int
    order_id: int
    createdAt: datetime

    class Config:
        from_attributes = True


# ─── Order ───────────────────────────────────────────────────────────────────

class OrderBase(BaseModel):
    customerName: str
    customerPhone: Optional[str] = None
    garmentType: str
    description: Optional[str] = None
    measurements: Optional[Dict[str, Any]] = {}
    deadline: str
    totalPrice: Optional[float] = 0
    paidAmount: Optional[float] = 0
    paymentStatus: Optional[PaymentStatus] = PaymentStatus.UNPAID
    assignedTo: Optional[str] = None
    notes: Optional[str] = None


class OrderCreate(OrderBase):
    pass


class OrderUpdate(BaseModel):
    customerName: Optional[str] = None
    customerPhone: Optional[str] = None
    garmentType: Optional[str] = None
    description: Optional[str] = None
    measurements: Optional[Dict[str, Any]] = None
    deadline: Optional[str] = None
    status: Optional[OrderStatus] = None
    paymentStatus: Optional[PaymentStatus] = None
    totalPrice: Optional[float] = None
    paidAmount: Optional[float] = None
    assignedTo: Optional[str] = None
    notes: Optional[str] = None
    # Optional: add a log note when updating status
    logNote: Optional[str] = None
    logEmployeeName: Optional[str] = "Admin"


class Order(OrderBase):
    id: int
    receiptNumber: str
    status: OrderStatus
    createdAt: datetime
    updatedAt: Optional[datetime] = None
    log: List[OrderLog] = []

    class Config:
        from_attributes = True


class OrderTracking(BaseModel):
    """Simplified response for public tracking endpoint."""
    id: int
    receiptNumber: str
    customerName: str
    garmentType: str
    description: Optional[str] = None
    status: OrderStatus
    paymentStatus: PaymentStatus
    totalPrice: float
    paidAmount: float
    deadline: str
    createdAt: datetime
    log: List[OrderLog] = []

    class Config:
        from_attributes = True
