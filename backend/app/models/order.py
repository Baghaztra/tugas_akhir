from sqlalchemy import Column, Integer, String, Enum, DateTime, Float, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from ..database import Base


class OrderStatus(str, enum.Enum):
    RECEIVED = "received"
    CUTTING = "cutting"
    SEWING = "sewing"
    FINISHING = "finishing"
    DONE = "done"


class PaymentStatus(str, enum.Enum):
    PAID = "paid"
    UNPAID = "unpaid"
    PARTIAL = "partial"


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    receiptNumber = Column(String(30), unique=True, index=True, nullable=False)
    customerName = Column(String(150), nullable=False)
    customerPhone = Column(String(20), nullable=True)
    garmentType = Column(String(100), nullable=False)
    description = Column(String(500), nullable=True)
    measurements = Column(JSON, nullable=True, default={})
    status = Column(Enum(OrderStatus), default=OrderStatus.RECEIVED, nullable=False)
    paymentStatus = Column(Enum(PaymentStatus), default=PaymentStatus.UNPAID, nullable=False)
    totalPrice = Column(Float, default=0)
    paidAmount = Column(Float, default=0)
    deadline = Column(String(20), nullable=False)   # stored as YYYY-MM-DD string
    assignedTo = Column(String(100), nullable=True)
    notes = Column(String(500), nullable=True)
    createdAt = Column(DateTime(timezone=True), server_default=func.now())
    updatedAt = Column(DateTime(timezone=True), onupdate=func.now())

    log = relationship("OrderLog", back_populates="order", cascade="all, delete-orphan", order_by="OrderLog.id")


class OrderLog(Base):
    __tablename__ = "order_logs"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    status = Column(String(30), nullable=False)
    note = Column(String(300), nullable=True, default="")
    employeeName = Column(String(100), nullable=True, default="Admin")
    createdAt = Column(DateTime(timezone=True), server_default=func.now())

    order = relationship("Order", back_populates="log")
