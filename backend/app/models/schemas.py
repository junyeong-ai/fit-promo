from datetime import datetime

from pydantic import BaseModel


# --- Image ---
class ImageRead(BaseModel):
    id: int
    filename: str
    stored_path: str
    mime_type: str
    size_bytes: int
    created_at: datetime


# --- Target ---
class TargetCreate(BaseModel):
    key: str
    name: str
    target_age: str
    style_keywords: list[str]
    prompt_template: str


class TargetUpdate(BaseModel):
    name: str | None = None
    target_age: str | None = None
    style_keywords: list[str] | None = None
    prompt_template: str | None = None


class TargetRead(BaseModel):
    id: int
    key: str
    name: str
    target_age: str
    style_keywords: str
    prompt_template: str
    is_builtin: bool
    created_at: datetime


# --- Product ---
class ProductCreate(BaseModel):
    name: str
    brand: str | None = None
    category: str | None = None
    description: str | None = None
    key_features: list[str] | None = None
    image_id: int | None = None
    image_url: str | None = None


class ProductUpdate(BaseModel):
    name: str | None = None
    brand: str | None = None
    category: str | None = None
    description: str | None = None
    key_features: list[str] | None = None
    image_id: int | None = None
    image_url: str | None = None


class ProductRead(BaseModel):
    id: int
    name: str
    brand: str | None = None
    category: str | None = None
    description: str | None = None
    key_features: str | None = None
    image_id: int | None = None
    image_url: str | None = None
    source_url: str | None = None
    price: str | None = None
    scraped_image_ids: str | None = None
    created_at: datetime


# --- Generation ---
class GenerationCreate(BaseModel):
    source_image_id: int | None = None
    target_ids: list[int]
    product_ids: list[int] | None = None
    promotion_prompt: str | None = None
    design_style: str | None = None


class GenerationResultRead(BaseModel):
    id: int
    generation_id: int
    target_id: int
    status: str
    stored_path: str | None = None
    prompt_used: str | None = None
    rationale: str | None = None
    adapted_text: str | None = None
    error: str | None = None
    created_at: datetime
    target: TargetRead | None = None


class GenerationRead(BaseModel):
    id: int
    source_image_id: int | None = None
    product_id: int | None = None
    product_ids: str | None = None
    promotion_prompt: str | None = None
    design_style: str | None = None
    mode: str = "derive"
    status: str
    model: str
    analysis_result: str | None = None
    error: str | None = None
    created_at: datetime
    completed_at: datetime | None = None
    results: list[GenerationResultRead] = []
    source_image: ImageRead | None = None
    product: ProductRead | None = None
