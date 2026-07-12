from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database import Base


class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False, index=True)
    phone = Column(String(20), nullable=True, index=True)

    lingkar_badan = Column(Float, nullable=True)
    lingkar_pinggang = Column(Float, nullable=True)
    lingkar_panggul = Column(Float, nullable=True)
    panjang_bahu = Column(Float, nullable=True)
    panjang_tgn = Column(Float, nullable=True)
    panjang_baju = Column(Float, nullable=True)
    panjang_rok = Column(Float, nullable=True)

    createdAt = Column(DateTime(timezone=True), server_default=func.now())
    updatedAt = Column(DateTime(timezone=True), onupdate=func.now())

    orders = relationship("Order", back_populates="customer")
