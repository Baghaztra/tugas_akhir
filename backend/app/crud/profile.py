from sqlalchemy.orm import Session
from ..models.profile import BusinessProfile
from ..schemas.profile import BusinessProfileUpdate


# Default values when no profile exists yet
_DEFAULT_PROFILE = dict(
    id=1,
    name="Penjahit Yan",
    slogan="Jahitan berkualitas, detail sempurna, hasil memukau",
    address="Jl. Kenanga, Kel. Napar, Payakumbuh Utara, Sumatera Barat",
    phone="0812-6731-094",
    email="yanpenjahit@gmail.com",
    hours="Senin–Sabtu, 08:00–17:00 WIB",
    instagram="@penjahit_yan",
    logo=None,
)


def get_profile(db: Session) -> BusinessProfile:
    """Ambil profil (id=1). Jika belum ada, buat dengan nilai default."""
    profile = db.query(BusinessProfile).filter(BusinessProfile.id == 1).first()
    if profile is None:
        profile = BusinessProfile(**_DEFAULT_PROFILE)
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile


def update_profile(db: Session, data: BusinessProfileUpdate) -> BusinessProfile:
    """Partial update pada profil (id=1). Field yang None tidak diubah."""
    profile = get_profile(db)
    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(profile, field, value)
    db.commit()
    db.refresh(profile)
    return profile
