from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from ..auth import (
    create_access_token,
    get_current_user,
    get_password_hash,
    verify_password,
)
from ..database import get_db
from ..models.user import User

router = APIRouter(
    prefix="/auth",
    tags=["auth"],
)


class LoginRequest(BaseModel):
    email: str
    password: str


class LoginResponse(BaseModel):
    success: bool
    user: dict


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str


@router.post("/login", response_model=LoginResponse)
def login(
    body: LoginRequest,
    response: Response,
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.email == body.email).first()
    if not user or not verify_password(body.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email atau password salah",
        )

    token = create_access_token(data={"sub": str(user.id)})

    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        samesite="lax",
        max_age=86400,
        path="/",
    )

    return LoginResponse(
        success=True,
        user={
            "id": user.id,
            "email": user.email,
            "name": user.name,
        },
    )


@router.post("/logout")
def logout(response: Response, db: Session = Depends(get_db)):
    response.delete_cookie(key="access_token", path="/")
    return {"success": True}


@router.put("/password")
def change_password(
    body: ChangePasswordRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not verify_password(body.current_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password saat ini salah",
        )

    if len(body.new_password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password baru minimal 6 karakter",
        )

    current_user.password_hash = get_password_hash(body.new_password)
    db.commit()

    return {"success": True}
