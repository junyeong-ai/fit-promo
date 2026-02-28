from fastapi import APIRouter

from app.api.v1.generations import router as generations_router
from app.api.v1.images import router as images_router
from app.api.v1.targets import router as targets_router
from app.api.v1.products import router as products_router

v1_router = APIRouter(prefix="/api/v1")

v1_router.include_router(images_router)
v1_router.include_router(targets_router)
v1_router.include_router(products_router)
v1_router.include_router(generations_router)
