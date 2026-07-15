from pydantic import BaseModel
from typing import Optional

class AttributeBase(BaseModel):
    name: str

class Attribute(AttributeBase):
    id: int
    is_deleted: bool = False

    class Config:
        from_attributes = True
