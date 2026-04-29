from sqlalchemy.orm import Session
from sqlalchemy import func

from ..models.order import GarmentType, OrderItem
from ..schemas.garment_type import GarmentTypeCreate, GarmentTypeUpdate


def get_garment_type(db: Session, garment_type_id: int):
    """Ambil garment type yang belum dihapus berdasarkan id."""
    return (
        db.query(GarmentType)
        .filter(GarmentType.id == garment_type_id, GarmentType.is_deleted == False)
        .first()
    )


def get_garment_types(db: Session, skip: int = 0, limit: int = 100):
    """Ambil semua garment type yang belum dihapus (soft-delete filter)."""
    result = (
        db.query(GarmentType,func.count(OrderItem.id).label("item_count"))
        .outerjoin(OrderItem,OrderItem.garmentTypeId == GarmentType.id)
        .filter(GarmentType.is_deleted == False)
        .group_by(GarmentType.id)
        .offset(skip)
        .limit(limit)
        .all()
    )
    return [
        {
            "id": gt.id,
            "name": gt.name,
            "is_deleted": gt.is_deleted,
            "item_count": count
        } for gt, count in result
    ]


def create_garment_type(db: Session, garment_type: GarmentTypeCreate):
    db_garment_type = GarmentType(**garment_type.dict())
    db.add(db_garment_type)
    db.commit()
    db.refresh(db_garment_type)
    return db_garment_type


def update_garment_type(db: Session, garment_type_id: int, garment_type: GarmentTypeUpdate):
    db_garment_type = get_garment_type(db, garment_type_id)
    if not db_garment_type:
        return None
    update_data = garment_type.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_garment_type, key, value)
    db.add(db_garment_type)
    db.commit()
    db.refresh(db_garment_type)
    return db_garment_type


def delete_garment_type(db: Session, garment_type_id: int):
    """Soft-delete: tandai is_deleted=True agar histori order item tetap utuh."""
    db_garment_type = get_garment_type(db, garment_type_id)
    if not db_garment_type:
        return None
    db_garment_type.is_deleted = True
    db.commit()
    db.refresh(db_garment_type)
    return db_garment_type
