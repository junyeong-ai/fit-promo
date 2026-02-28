import os
import uuid
from pathlib import Path

from fastapi import UploadFile

from app.config import settings


async def save_upload(file: UploadFile, subdir: str = "originals") -> tuple[str, int]:
    upload_dir = Path(settings.UPLOAD_DIR) / subdir
    upload_dir.mkdir(parents=True, exist_ok=True)

    ext = Path(file.filename).suffix if file.filename else ".bin"
    unique_name = f"{uuid.uuid4().hex}{ext}"
    dest = upload_dir / unique_name

    content = await file.read()
    dest.write_bytes(content)

    stored_path = f"{subdir}/{unique_name}"
    return stored_path, len(content)


def save_bytes(data: bytes, filename: str, subdir: str = "generated") -> str:
    upload_dir = Path(settings.UPLOAD_DIR) / subdir
    upload_dir.mkdir(parents=True, exist_ok=True)

    unique_name = f"{uuid.uuid4().hex}_{filename}"
    dest = upload_dir / unique_name
    dest.write_bytes(data)

    return f"{subdir}/{unique_name}"


def get_absolute_path(stored_path: str) -> str:
    return os.path.join(settings.UPLOAD_DIR, stored_path)
