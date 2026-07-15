import os
import tempfile
import uuid
import shutil
from pathlib import Path
from urllib.parse import urlparse

from fastapi import UploadFile


UPLOAD_ROOT = Path(__file__).parent.parent / "uploads"


def save_file(file: UploadFile, folder: str = "portfolio") -> str:
    dest_dir = UPLOAD_ROOT / folder
    dest_dir.mkdir(parents=True, exist_ok=True)

    ext = Path(file.filename or "image.jpg").suffix.lower()
    filename = f"{uuid.uuid4().hex}{ext}"
    dest_path = dest_dir / filename

    with open(dest_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    baseUrl = os.getenv("PUBLIC_BASE_URL", "http://localhost:8000")
    return f"{baseUrl}/uploads/{folder}/{filename}"


async def save_file_async(file: UploadFile, folder: str = "portfolio") -> str:
    content = await file.read()
    with tempfile.NamedTemporaryFile(delete=False) as tmp:
        tmp.write(content)
        tmp_path = tmp.name
    try:
        dest_dir = UPLOAD_ROOT / folder
        dest_dir.mkdir(parents=True, exist_ok=True)

        ext = Path(file.filename or "image.jpg").suffix.lower()
        filename = f"{uuid.uuid4().hex}{ext}"
        dest_path = dest_dir / filename

        shutil.move(tmp_path, dest_path)

        baseUrl = os.getenv("PUBLIC_BASE_URL", "http://localhost:8000")
        return f"{baseUrl}/uploads/{folder}/{filename}"
    except:
        if os.path.exists(tmp_path):
            os.unlink(tmp_path)
        raise


def delete_file(url: str) -> None:
    path = urlparse(url).path

    if not path.startswith("/uploads/"):
        return

    file_path = (UPLOAD_ROOT / path.removeprefix("/uploads/")).resolve()

    if not str(file_path).startswith(str(UPLOAD_ROOT.resolve())):
        return

    if file_path.is_file():
        file_path.unlink()
