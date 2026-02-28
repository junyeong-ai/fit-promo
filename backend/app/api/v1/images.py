from fastapi import APIRouter, Depends, HTTPException, UploadFile
from sqlmodel import Session, select

from app.database import get_session
from app.models.db import Image
from app.models.schemas import ImageRead
from app.services.storage import save_upload

router = APIRouter(prefix="/images", tags=["images"])


@router.post("/upload", response_model=ImageRead)
async def upload_image(
    file: UploadFile,
    session: Session = Depends(get_session),
):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    stored_path, size_bytes = await save_upload(file, subdir="originals")

    image = Image(
        filename=file.filename or "unknown",
        stored_path=stored_path,
        mime_type=file.content_type,
        size_bytes=size_bytes,
    )
    session.add(image)
    session.commit()
    session.refresh(image)
    return image


@router.get("", response_model=list[ImageRead])
def list_images(session: Session = Depends(get_session)):
    return session.exec(select(Image).order_by(Image.created_at.desc())).all()
