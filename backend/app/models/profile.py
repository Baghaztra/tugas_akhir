from sqlalchemy import Column, Integer, String
from ..database import Base


class BusinessProfile(Base):
    """
    Single-row table untuk profil bisnis.
    Selalu disimpan dengan id=1 (upsert pattern).
    """
    __tablename__ = "business_profiles"

    id = Column(Integer, primary_key=True, index=True, default=1)
    name = Column(String(150), nullable=False, default="")
    slogan = Column(String(300), nullable=True, default="")
    address = Column(String(500), nullable=True, default="")
    phone = Column(String(30), nullable=True, default="")
    email = Column(String(150), nullable=True, default="")
    hours = Column(String(200), nullable=True, default="")
    instagram = Column(String(100), nullable=True, default="")
    logo = Column(String(500), nullable=True, default=None)
