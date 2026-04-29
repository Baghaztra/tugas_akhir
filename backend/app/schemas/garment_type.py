from pydantic import BaseModel
from typing import Optional

class GarmentTypeBase(BaseModel):
    name: str

class GarmentTypeCreate(GarmentTypeBase):
    """
    # Contoh validasi

    name: str
    @field_validator("name")
    def name_required(cls, v):
        if not v:
            raise ValueError("Nama wajib diisi")
        return v
    """
    pass

class GarmentTypeUpdate(GarmentTypeBase):
    pass

class GarmentType(GarmentTypeBase):
    id: int
    is_deleted: bool = False

    class Config:
        from_attributes = True


class GarmentTypeName(BaseModel):
    """Lightweight schema — hanya nama, untuk embed di OrderItem."""
    name: str

    class Config:
        from_attributes = True
