from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..crud import profile as crud_profile
from ..schemas.profile import BusinessProfileRead, BusinessProfileUpdate
from ..database import get_db
from ..auth import get_current_user
from ..models.user import User

router = APIRouter(
    prefix="/profile",
    tags=["profile"],
)


@router.get("/public", response_model=BusinessProfileRead)
def get_public_profile(db: Session = Depends(get_db)):
    """Endpoint publik — ambil profil bisnis."""
    return crud_profile.get_profile(db)


@router.put("/", response_model=BusinessProfileRead)
def update_profile(
    data: BusinessProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update profil bisnis (admin)."""
    return crud_profile.update_profile(db, data)
