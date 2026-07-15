from pydantic import BaseModel
from typing import Optional

class GarmentTypeBase(BaseModel):
    name: str

class GarmentTypeUpdate(BaseModel):
    name: Optional[str] = None

class GarmentType(GarmentTypeBase):
    id: int
    is_deleted: bool = False
    item_count: Optional[int] = 0

    class Config:
        from_attributes = True


class GarmentTypeName(BaseModel):
    """Lightweight schema — hanya nama, untuk embed di OrderItem."""
    name: str

    class Config:
        from_attributes = True
