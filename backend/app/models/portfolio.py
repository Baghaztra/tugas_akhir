from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from ..database import Base


class PortfolioItem(Base):
    __tablename__ = "portfolio_items"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    category = Column(String(100), nullable=False)
    image = Column(String(500), nullable=True, default=None)   # public URL
    description = Column(String(1000), nullable=True, default="")
    createdAt = Column(DateTime(timezone=True), server_default=func.now())
