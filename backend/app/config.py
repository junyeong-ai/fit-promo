from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    GCP_PROJECT_ID: str = ""
    GCP_LOCATION: str = "us-central1"
    DATABASE_URL: str = "sqlite:///./fitpromo.db"
    UPLOAD_DIR: str = "./uploads"
    ALLOWED_ORIGINS: str = "http://localhost:3000"

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()
