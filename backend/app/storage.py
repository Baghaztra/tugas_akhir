"""
Modular storage layer for file uploads.

Saat ini menggunakan LocalStorage (simpan ke disk lokal).
Untuk beralih ke cloud (S3, GCS, dsb.), cukup:
  1. Buat class baru yang mengimplementasikan BaseStorage
     dan BaseStorage.save_async
  2. Set env var:  STORAGE_BACKEND=s3
  3. Tidak ada perubahan di router / CRUD sama sekali.
"""

import os
import uuid
import shutil
from abc import ABC, abstractmethod
from pathlib import Path

from fastapi import UploadFile


# ─── Abstract interface ────────────────────────────────────────────────────────

class BaseStorage(ABC):
    @abstractmethod
    def save(self, file: UploadFile, folder: str = "portfolio") -> str:
        """Simpan file (sync) dan kembalikan URL publik (string)."""
        ...

    async def save_async(self, file: UploadFile, folder: str = "portfolio") -> str:
        """
        Simpan file dalam konteks async dan kembalikan URL publik.
        Default: baca bytes dulu lalu delegasikan ke save() sync.
        Override di subclass bila backend mendukung IO async asli.
        """
        content = await file.read()
        # Tulis ulang ke file-like agar kompatibel dengan save() sync
        import io
        file.file = io.BytesIO(content)  # type: ignore[assignment]
        return self.save(file, folder)

    @abstractmethod
    def delete(self, url: str) -> None:
        """Hapus file berdasarkan URL publik-nya."""
        ...


# ─── Local storage implementation ─────────────────────────────────────────────

# Direktori root untuk file upload (relatif terhadap lokasi main.py)
UPLOAD_ROOT = Path(__file__).parent.parent / "uploads"


class LocalStorage(BaseStorage):
    """Simpan file ke folder `uploads/` di server lokal."""

    def save(self, file: UploadFile, folder: str = "portfolio") -> str:
        dest_dir = UPLOAD_ROOT / folder
        dest_dir.mkdir(parents=True, exist_ok=True)

        ext = Path(file.filename or "image.jpg").suffix.lower()
        filename = f"{uuid.uuid4().hex}{ext}"
        dest_path = dest_dir / filename

        with open(dest_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # URL publik — FastAPI StaticFiles mount di /uploads
        return f"/uploads/{folder}/{filename}"

    def delete(self, url: str) -> None:
        # url format: /uploads/portfolio/<filename>
        relative = url.lstrip("/")          # uploads/portfolio/xxx.jpg
        abs_path = UPLOAD_ROOT.parent / relative
        if abs_path.exists():
            abs_path.unlink()


# ─── Future: S3Storage (contoh kerangka) ──────────────────────────────────────
# class S3Storage(BaseStorage):
#     def save(self, file: UploadFile, folder: str = "portfolio") -> str:
#         # boto3.upload_fileobj(...)
#         return f"https://<bucket>.s3.amazonaws.com/{folder}/..."
#
#     def delete(self, url: str) -> None:
#         # boto3.delete_object(...)
#         pass


# ─── Factory ──────────────────────────────────────────────────────────────────

def get_storage() -> BaseStorage:
    backend = os.getenv("STORAGE_BACKEND", "local").lower()
    if backend == "local":
        return LocalStorage()
    # elif backend == "s3":
    #     return S3Storage()
    raise ValueError(f"Unknown STORAGE_BACKEND: {backend!r}")
