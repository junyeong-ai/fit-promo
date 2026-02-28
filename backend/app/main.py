import json
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlmodel import Session, select

from app.api.v1.router import v1_router
from app.config import settings
from app.database import create_db_and_tables, migrate_db, engine
from app.models.db import Product, Target
from app.prompts.products import BUILTIN_PRODUCTS
from app.prompts.targets import BUILTIN_TARGETS



def seed_targets():
    with Session(engine) as session:
        builtin_keys = {t["key"] for t in BUILTIN_TARGETS}

        # Remove old builtin targets that are no longer defined
        old_builtins = session.exec(
            select(Target).where(Target.is_builtin == True)
        ).all()
        for old in old_builtins:
            if old.key not in builtin_keys:
                session.delete(old)

        # Upsert current builtin targets
        for t in BUILTIN_TARGETS:
            existing = session.exec(
                select(Target).where(Target.key == t["key"])
            ).first()
            if existing:
                if existing.is_builtin:
                    existing.name = t["name"]
                    existing.target_age = t["target_age"]
                    existing.style_keywords = json.dumps(t["style_keywords"])
                    existing.prompt_template = t["prompt_template"]
                    session.add(existing)
            else:
                target = Target(
                    key=t["key"],
                    name=t["name"],
                    target_age=t["target_age"],
                    style_keywords=json.dumps(t["style_keywords"]),
                    prompt_template=t["prompt_template"],
                    is_builtin=True,
                )
                session.add(target)
        session.commit()


def seed_products():
    with Session(engine) as session:
        for p in BUILTIN_PRODUCTS:
            # Check if a product with the same name+brand already exists
            existing = session.exec(
                select(Product).where(
                    Product.name == p["name"],
                    Product.brand == p["brand"],
                )
            ).first()
            if existing:
                # Update existing record
                existing.category = p.get("category")
                existing.description = p.get("description")
                existing.key_features = json.dumps(p["key_features"]) if p.get("key_features") else None
                existing.image_url = p.get("image_url")
                session.add(existing)
            else:
                product = Product(
                    name=p["name"],
                    brand=p.get("brand"),
                    category=p.get("category"),
                    description=p.get("description"),
                    key_features=json.dumps(p["key_features"]) if p.get("key_features") else None,
                    image_url=p.get("image_url"),
                )
                session.add(product)
        session.commit()


@asynccontextmanager
async def lifespan(app: FastAPI):
    migrate_db()
    create_db_and_tables()
    seed_targets()
    seed_products()
    yield


app = FastAPI(title="Fit-Promo API", version="0.1.0", lifespan=lifespan)

origins = settings.ALLOWED_ORIGINS.strip()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if origins == "*" else [o.strip() for o in origins.split(",")],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

upload_dir = Path(settings.UPLOAD_DIR)
upload_dir.mkdir(parents=True, exist_ok=True)
app.mount("/files", StaticFiles(directory=str(upload_dir)), name="files")

app.include_router(v1_router)


@app.get("/health")
def health():
    return {"status": "ok"}
