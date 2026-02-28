import json
import logging

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from app.database import get_session
from app.models.db import Image, Product
from app.models.schemas import ProductCreate, ProductRead, ProductUpdate

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/products", tags=["products"])


@router.get("", response_model=list[ProductRead])
def list_products(session: Session = Depends(get_session)):
    return session.exec(select(Product).order_by(Product.created_at.desc())).all()


@router.post("", response_model=ProductRead)
def create_product(body: ProductCreate, session: Session = Depends(get_session)):
    if body.image_id:
        img = session.get(Image, body.image_id)
        if not img:
            raise HTTPException(status_code=404, detail="Product image not found")

    product = Product(
        name=body.name,
        brand=body.brand,
        category=body.category,
        description=body.description,
        key_features=json.dumps(body.key_features) if body.key_features else None,
        image_id=body.image_id,
        image_url=body.image_url,
    )
    session.add(product)
    session.commit()
    session.refresh(product)
    return product


@router.get("/{product_id}", response_model=ProductRead)
def get_product(product_id: int, session: Session = Depends(get_session)):
    product = session.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.put("/{product_id}", response_model=ProductRead)
def update_product(
    product_id: int,
    body: ProductUpdate,
    session: Session = Depends(get_session),
):
    product = session.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    if body.name is not None:
        product.name = body.name
    if body.brand is not None:
        product.brand = body.brand
    if body.category is not None:
        product.category = body.category
    if body.description is not None:
        product.description = body.description
    if body.key_features is not None:
        product.key_features = json.dumps(body.key_features)
    if body.image_id is not None:
        img = session.get(Image, body.image_id)
        if not img:
            raise HTTPException(status_code=404, detail="Product image not found")
        product.image_id = body.image_id
    if body.image_url is not None:
        product.image_url = body.image_url

    session.add(product)
    session.commit()
    session.refresh(product)
    return product


@router.delete("/{product_id}")
def delete_product(product_id: int, session: Session = Depends(get_session)):
    product = session.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    session.delete(product)
    session.commit()
    return {"ok": True}
