from pydantic import BaseModel, Field, model_validator
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum
from .garment_type import GarmentTypeName
from .customer import CustomerBrief


class OrderStatus(str, Enum):
    RECEIVED = "received"
    CUTTING = "cutting"
    CUTTED = "cutted"
    SEWING = "sewing"
    SEWED = "sewed"
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
    worker_id: Optional[int] = None
    worker_name: Optional[str] = None

class OrderLog(OrderLogBase):
    id: int
    order_item_id: int
    createdAt: datetime

    class Config:
        from_attributes = True


# OrderItem
class OrderItemBase(BaseModel):
    garmentTypeId: int
    description: Optional[str] = None
    sketch: Optional[str] = None
    quantity: Optional[int] = 1
    measurements: Optional[Dict[str, Any]] = Field(default_factory=dict)
    attributes: Optional[Dict[str, Any]] = Field(default_factory=dict)

class OrderItemCreate(BaseModel):
    """
    Schema untuk membuat item baru.
    Field `sketch` TIDAK ada di sini — file sketsa dikirim lewat multipart
    dan URL-nya diinjeksi oleh CRUD setelah upload.
    """
    garmentTypeId: int
    description: Optional[str] = None
    quantity: Optional[int] = 1
    measurements: Optional[Dict[str, Any]] = Field(default_factory=dict)
    attributes: Optional[Dict[str, Any]] = Field(default_factory=dict)


class OrderCreateFormData(BaseModel):
    """
    Shape JSON yang dikirim sebagai string di field `data` pada form-data.
    Frontend mengirim:  data = JSON.stringify({ customerName, ..., items: [...] })
    """
    customer_id: Optional[int] = None
    customerName: str
    customerPhone: Optional[str] = None
    deadline: str
    totalPrice: Optional[float] = 0
    dpAmount: Optional[float] = 0
    paymentStatus: Optional[PaymentStatus] = PaymentStatus.UNPAID
    notes: Optional[str] = None
    items: List[OrderItemCreate] = []

    @model_validator(mode='after')
    def _validate_and_derive_payment(self):
        tp = self.totalPrice or 0
        dp = self.dpAmount or 0
        if tp < 0:
            raise ValueError('totalPrice tidak boleh negatif')
        if dp < 0:
            raise ValueError('dpAmount tidak boleh negatif')
        if dp > tp and tp > 0:
            raise ValueError('dpAmount tidak boleh melebihi totalPrice')
        # Derive paymentStatus from actual values
        if dp <= 0 or tp <= 0:
            self.paymentStatus = PaymentStatus.UNPAID
        elif dp >= tp:
            self.paymentStatus = PaymentStatus.PAID
        else:
            self.paymentStatus = PaymentStatus.PARTIAL
        return self

class OrderItem(OrderItemBase):
    id: int
    status: OrderStatus
    garmentType: Optional[GarmentTypeName] = None
    logs: List[OrderLog] = []

    class Config:
        from_attributes = True


# Order
class OrderBase(BaseModel):
    customerName: str
    customerPhone: Optional[str] = None
    deadline: str
    totalPrice: Optional[float] = 0
    dpAmount: Optional[float] = 0
    paymentStatus: Optional[PaymentStatus] = PaymentStatus.UNPAID
    notes: Optional[str] = None

class OrderCreate(OrderBase):
    customer_id: Optional[int] = None
    items: List[OrderItemCreate]

    @model_validator(mode='after')
    def _derive_payment_status(self):
        tp = self.totalPrice or 0
        dp = self.dpAmount or 0
        if tp < 0:
            raise ValueError('totalPrice tidak boleh negatif')
        if dp < 0:
            raise ValueError('dpAmount tidak boleh negatif')
        if dp > tp and tp > 0:
            raise ValueError('dpAmount tidak boleh melebihi totalPrice')
        if dp <= 0 or tp <= 0:
            self.paymentStatus = PaymentStatus.UNPAID
        elif dp >= tp:
            self.paymentStatus = PaymentStatus.PAID
        else:
            self.paymentStatus = PaymentStatus.PARTIAL
        return self

class OrderUpdate(BaseModel):
    customer_id: Optional[int] = None
    customerName: Optional[str] = None
    customerPhone: Optional[str] = None
    deadline: Optional[str] = None
    paymentStatus: Optional[PaymentStatus] = None
    totalPrice: Optional[float] = None
    dpAmount: Optional[float] = None
    notes: Optional[str] = None

class Order(OrderBase):
    id: int
    receiptNumber: str
    createdAt: datetime
    updatedAt: Optional[datetime] = None
    customer_id: Optional[int] = None
    customer: Optional[CustomerBrief] = None
    items: List[OrderItem] = []

    class Config:
        from_attributes = True

class CustomerHistoryItem(BaseModel):
    customerName: str
    customerPhone: Optional[str] = None
    orderDate: datetime
    garmentTypeName: Optional[str] = None
    measurements: Optional[Dict[str, Any]] = Field(default_factory=dict)


# Tracking
class OrderTracking(BaseModel):
    id: int
    receiptNumber: str
    customerName: str
    paymentStatus: PaymentStatus
    totalPrice: float
    dpAmount: float
    deadline: str
    createdAt: datetime
    notes: Optional[str] = None
    items: List[OrderItem] = []

    class Config:
        from_attributes = True
