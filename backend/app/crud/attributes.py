from sqlalchemy.orm import Session
from ..models.attributes import Attribute
from ..schemas.attributes import AttributeCreate

def get_attributes(db: Session, skip: int = 0, limit: int = 100):
    return (
        db.query(Attribute)
        .filter(Attribute.is_deleted == False)
        .offset(skip)
        .limit(limit)
        .all()
    )

def create_attribute(db: Session, attribute: AttributeCreate):
    db_attribute = Attribute(**attribute.dict())
    db.add(db_attribute)
    db.commit()
    db.refresh(db_attribute)
    return db_attribute

def delete_attribute(db: Session, attribute_id: int):
    db_attribute = db.query(Attribute).filter(Attribute.id == attribute_id).first()
    if db_attribute:
        db_attribute.is_deleted = True
        db.commit()
        db.refresh(db_attribute)
    return db_attribute
