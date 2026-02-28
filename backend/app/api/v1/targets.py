import json

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from app.database import get_session
from app.models.db import Target
from app.models.schemas import TargetCreate, TargetRead, TargetUpdate

router = APIRouter(prefix="/targets", tags=["targets"])


@router.get("", response_model=list[TargetRead])
def list_targets(session: Session = Depends(get_session)):
    return session.exec(select(Target).order_by(Target.id)).all()


@router.post("", response_model=TargetRead)
def create_target(body: TargetCreate, session: Session = Depends(get_session)):
    existing = session.exec(select(Target).where(Target.key == body.key)).first()
    if existing:
        raise HTTPException(status_code=409, detail=f"Target key '{body.key}' already exists")

    target = Target(
        key=body.key,
        name=body.name,
        target_age=body.target_age,
        style_keywords=json.dumps(body.style_keywords),
        prompt_template=body.prompt_template,
        is_builtin=False,
    )
    session.add(target)
    session.commit()
    session.refresh(target)
    return target


@router.put("/{target_id}", response_model=TargetRead)
def update_target(
    target_id: int,
    body: TargetUpdate,
    session: Session = Depends(get_session),
):
    target = session.get(Target, target_id)
    if not target:
        raise HTTPException(status_code=404, detail="Target not found")

    if body.name is not None:
        target.name = body.name
    if body.target_age is not None:
        target.target_age = body.target_age
    if body.style_keywords is not None:
        target.style_keywords = json.dumps(body.style_keywords)
    if body.prompt_template is not None:
        target.prompt_template = body.prompt_template

    session.add(target)
    session.commit()
    session.refresh(target)
    return target


@router.delete("/{target_id}")
def delete_target(target_id: int, session: Session = Depends(get_session)):
    target = session.get(Target, target_id)
    if not target:
        raise HTTPException(status_code=404, detail="Target not found")

    session.delete(target)
    session.commit()
    return {"ok": True}
