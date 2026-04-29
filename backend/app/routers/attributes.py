from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..crud import attributes as crud_attributes
from ..schemas import attributes as schema_attributes
from ..database import get_db

router = APIRouter(
    prefix="/attributes",
    tags=["attributes"],
    responses={404: {"description": "Not found"}},
)

@router.post("/", response_model=schema_attributes.Attribute)
def create_attribute(attribute: schema_attributes.AttributeCreate, db: Session = Depends(get_db)):
    return crud_attributes.create_attribute(db=db, attribute=attribute)

@router.get("/", response_model=List[schema_attributes.Attribute])
def read_attributes(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_attributes.get_attributes(db, skip=skip, limit=limit)

@router.delete("/{attribute_id}", response_model=schema_attributes.Attribute)
def delete_attribute(attribute_id: int, db: Session = Depends(get_db)):
    db_attribute = crud_attributes.delete_attribute(db, attribute_id=attribute_id)
    if db_attribute is None:
        raise HTTPException(status_code=404, detail="Attribute not found")
    return db_attribute
