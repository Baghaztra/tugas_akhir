from sqlalchemy import Column, Integer, String, Enum, DateTime, Float, ForeignKey, JSON, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from ..database import Base


class OrderStatus(str, enum.Enum):
    RECEIVED = "received"
    CUTTING = "cutting"
    CUTTED = "cutted"
    SEWING = "sewing"
    SEWED = "sewed"
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
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=True)
    customerName = Column(String(150), nullable=False)
    customerPhone = Column(String(20), nullable=True)

    paymentStatus = Column(Enum(PaymentStatus), default=PaymentStatus.UNPAID, nullable=False)
    totalPrice = Column(Float, default=0)
    dpAmount = Column(Float, default=0)

    deadline = Column(String(20), nullable=False)
    notes = Column(String(500), nullable=True)

    createdAt = Column(DateTime(timezone=True), server_default=func.now())
    updatedAt = Column(DateTime(timezone=True), onupdate=func.now())

    customer = relationship("Customer", back_populates="orders")
    items = relationship(
        "OrderItem",
        back_populates="order",
        cascade="all, delete-orphan"
    )

class GarmentType(Base):
    __tablename__ = "garment_types"

    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    is_deleted = Column(Boolean, default=False, nullable=False)

    order_items = relationship(
        "OrderItem",
        back_populates="garmentType"
    )

class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)

    garmentTypeId = Column(Integer, ForeignKey("garment_types.id"), nullable=True)
    description = Column(String(300), nullable=True)
    sketch = Column(String(200), nullable=True)

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

    garmentType = relationship(
        "GarmentType",
        back_populates="order_items",
        foreign_keys=[garmentTypeId]
    )

class OrderLog(Base):
    __tablename__ = "order_logs"

    id = Column(Integer, primary_key=True, index=True)

    order_item_id = Column(Integer, ForeignKey("order_items.id"), nullable=False)

    status = Column(String(30), nullable=False)
    note = Column(String(300), nullable=True, default="")
    employeeName = Column(String(100), nullable=True, default="Admin")
    worker_id = Column(Integer, ForeignKey("workers.id"), nullable=True)
    worker_name = Column(String(100), nullable=True)

    createdAt = Column(DateTime(timezone=True), server_default=func.now())

    item = relationship("OrderItem", back_populates="logs")
    worker = relationship("Worker", foreign_keys=[worker_id])
