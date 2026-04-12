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

    paymentStatus = Column(Enum(PaymentStatus), default=PaymentStatus.UNPAID, nullable=False)
    totalPrice = Column(Float, default=0)
    paidAmount = Column(Float, default=0)

    deadline = Column(String(20), nullable=False)
    notes = Column(String(500), nullable=True)

    createdAt = Column(DateTime(timezone=True), server_default=func.now())
    updatedAt = Column(DateTime(timezone=True), onupdate=func.now())

    items = relationship(
        "OrderItem",
        back_populates="order",
        cascade="all, delete-orphan"
    )


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)

    garmentType = Column(String(100), nullable=False)
    description = Column(String(300), nullable=True)

    quantity = Column(Integer, default=1)
    measurements = Column(JSON, nullable=True, default=dict)
    attributes = Column(JSON, nullable=True, default=dict)

    status = Column(Enum(OrderStatus), default=OrderStatus.RECEIVED, nullable=False)

    order = relationship("Order", back_populates="items")

    logs = relationship(
        "OrderLog",
        back_populates="item",
        cascade="all, delete-orphan",
        order_by="OrderLog.id"
    )


class OrderLog(Base):
    __tablename__ = "order_logs"

    id = Column(Integer, primary_key=True, index=True)

    order_item_id = Column(Integer, ForeignKey("order_items.id"), nullable=False)

    status = Column(String(30), nullable=False)
    note = Column(String(300), nullable=True, default="")
    employeeName = Column(String(100), nullable=True, default="Admin")

    createdAt = Column(DateTime(timezone=True), server_default=func.now())

    item = relationship("OrderItem", back_populates="logs")
