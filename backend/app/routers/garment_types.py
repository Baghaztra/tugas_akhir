from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List

from ..crud import garment_type as crud_garment_type
from ..schemas import garment_type as schema_garment_type
from ..database import get_db
from ..auth import get_current_user

router = APIRouter(
    prefix="/garment-types",
    tags=["garment-types"],
    responses={404: {"description": "Not found"}},
    dependencies=[Depends(get_current_user)],
)


@router.post("/", response_model=schema_garment_type.GarmentType)
def create_garment_type(garment_type: schema_garment_type.GarmentTypeBase, db: Session = Depends(get_db)):
    return crud_garment_type.create_garment_type(db=db, garment_type=garment_type)


@router.get("/", response_model=List[schema_garment_type.GarmentType])
def read_garment_types(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_garment_type.get_garment_types(db, skip=skip, limit=limit)


@router.get("/{garment_type_id}", response_model=schema_garment_type.GarmentType)
def read_garment_type(garment_type_id: int, db: Session = Depends(get_db)):
    db_garment_type = crud_garment_type.get_garment_type(db, garment_type_id=garment_type_id)
    if db_garment_type is None:
        raise HTTPException(status_code=404, detail="garment_type not found")
    return db_garment_type


@router.put("/{garment_type_id}", response_model=schema_garment_type.GarmentType)
def update_garment_type(garment_type_id: int, garment_type: schema_garment_type.GarmentTypeUpdate, db: Session = Depends(get_db)):
    db_garment_type = crud_garment_type.update_garment_type(db, garment_type_id=garment_type_id, garment_type=garment_type)
    if db_garment_type is None:
        raise HTTPException(status_code=404, detail="garment_type not found")
    return db_garment_type


@router.delete("/{garment_type_id}", response_model=schema_garment_type.GarmentType)
def delete_garment_type(garment_type_id: int, db: Session = Depends(get_db)):
    db_garment_type = crud_garment_type.delete_garment_type(db, garment_type_id=garment_type_id)
    if db_garment_type is None:
        raise HTTPException(status_code=404, detail="garment_type not found")
    return db_garment_type
