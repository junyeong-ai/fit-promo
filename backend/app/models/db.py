from datetime import datetime

from sqlmodel import Field, SQLModel


class Image(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    filename: str
    stored_path: str
    mime_type: str
    size_bytes: int
    created_at: datetime = Field(default_factory=datetime.utcnow)


class Target(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    key: str = Field(unique=True)
    name: str
    target_age: str
    style_keywords: str
    prompt_template: str
    is_builtin: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)


class Product(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    name: str
    brand: str | None = None
    category: str | None = None
    description: str | None = None
    key_features: str | None = None  # JSON array
    image_id: int | None = Field(default=None, foreign_key="image.id")
    image_url: str | None = None
    source_url: str | None = None
    price: str | None = None
    scraped_image_ids: str | None = None  # JSON array of image IDs
    created_at: datetime = Field(default_factory=datetime.utcnow)


class Generation(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    source_image_id: int | None = Field(default=None, foreign_key="image.id")
    product_id: int | None = Field(default=None, foreign_key="product.id")
    product_ids: str | None = None  # JSON array e.g. "[1,2,3]"
    promotion_prompt: str | None = None
    design_style: str | None = None
    mode: str = "derive"  # "create" | "derive"
    status: str = "pending"
    model: str = "gemini-3.1-pro-preview"
    analysis_result: str | None = None
    error: str | None = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    completed_at: datetime | None = None


class GenerationResult(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    generation_id: int = Field(foreign_key="generation.id")
    target_id: int = Field(foreign_key="target.id")
    status: str = "pending"
    stored_path: str | None = None
    prompt_used: str | None = None
    rationale: str | None = None
    adapted_text: str | None = None
    error: str | None = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
