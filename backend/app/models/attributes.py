from sqlalchemy import Column, Integer, String, Boolean
from ..database import Base

class Attribute(Base):
    __tablename__ = "attributes"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    is_deleted = Column(Boolean, default=False, nullable=False)
