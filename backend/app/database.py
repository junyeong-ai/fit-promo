import logging
from collections.abc import Generator

from sqlmodel import Session, SQLModel, create_engine, text

from app.config import settings

logger = logging.getLogger(__name__)

engine = create_engine(settings.DATABASE_URL, echo=False)


def create_db_and_tables():
    SQLModel.metadata.create_all(engine)


def migrate_db():
    """Handle schema migrations for existing databases."""
    with engine.connect() as conn:
        tables = conn.execute(text("SELECT name FROM sqlite_master WHERE type='table'"))
        table_names = {row[0] for row in tables.fetchall()}

        # Rename persona table → target
        if "persona" in table_names and "target" not in table_names:
            conn.execute(text("ALTER TABLE persona RENAME TO target"))
            logger.info("Renamed table 'persona' → 'target'")

        # Rename persona_id column → target_id in generationresult
        if "generationresult" in table_names:
            result = conn.execute(text("PRAGMA table_info(generationresult)"))
            cols = {row[1] for row in result.fetchall()}

            if "persona_id" in cols and "target_id" not in cols:
                conn.execute(
                    text("ALTER TABLE generationresult RENAME COLUMN persona_id TO target_id")
                )
                logger.info("Renamed column 'persona_id' → 'target_id' in generationresult")

            if "rationale" not in cols:
                conn.execute(text("ALTER TABLE generationresult ADD COLUMN rationale TEXT"))
                logger.info("Added 'rationale' column to generationresult")

            if "adapted_text" not in cols:
                conn.execute(text("ALTER TABLE generationresult ADD COLUMN adapted_text TEXT"))
                logger.info("Added 'adapted_text' column to generationresult")

        # Add product_id and new fields to generation table
        if "generation" in table_names:
            result = conn.execute(text("PRAGMA table_info(generation)"))
            cols = {row[1] for row in result.fetchall()}

            if "product_id" not in cols:
                conn.execute(text("ALTER TABLE generation ADD COLUMN product_id INTEGER"))
                logger.info("Added 'product_id' column to generation")

            if "promotion_prompt" not in cols:
                conn.execute(text("ALTER TABLE generation ADD COLUMN promotion_prompt TEXT"))
                logger.info("Added 'promotion_prompt' column to generation")

            if "design_style" not in cols:
                conn.execute(text("ALTER TABLE generation ADD COLUMN design_style TEXT"))
                logger.info("Added 'design_style' column to generation")

            if "mode" not in cols:
                conn.execute(text("ALTER TABLE generation ADD COLUMN mode TEXT DEFAULT 'derive'"))
                logger.info("Added 'mode' column to generation")

            if "product_ids" not in cols:
                conn.execute(text("ALTER TABLE generation ADD COLUMN product_ids TEXT"))
                logger.info("Added 'product_ids' column to generation")

            # Fix source_image_id NOT NULL → nullable (SQLite requires table rebuild)
            result2 = conn.execute(text(
                "SELECT sql FROM sqlite_master WHERE name='generation'"
            ))
            create_sql = result2.fetchone()[0]
            if "source_image_id INTEGER NOT NULL" in create_sql:
                conn.execute(text("""
                    CREATE TABLE generation_new (
                        id INTEGER NOT NULL PRIMARY KEY,
                        source_image_id INTEGER,
                        product_id INTEGER,
                        product_ids TEXT,
                        promotion_prompt TEXT,
                        design_style TEXT,
                        mode TEXT DEFAULT 'derive',
                        status VARCHAR NOT NULL,
                        model VARCHAR NOT NULL,
                        analysis_result VARCHAR,
                        error VARCHAR,
                        created_at DATETIME NOT NULL,
                        completed_at DATETIME,
                        FOREIGN KEY(source_image_id) REFERENCES image (id)
                    )
                """))
                conn.execute(text("""
                    INSERT INTO generation_new
                        (id, source_image_id, product_id, product_ids,
                         promotion_prompt, design_style, mode, status, model,
                         analysis_result, error, created_at, completed_at)
                    SELECT id, source_image_id, product_id, product_ids,
                           promotion_prompt, design_style, mode, status, model,
                           analysis_result, error, created_at, completed_at
                    FROM generation
                """))
                conn.execute(text("DROP TABLE generation"))
                conn.execute(text("ALTER TABLE generation_new RENAME TO generation"))
                logger.info("Rebuilt generation table: source_image_id now nullable")

        # Add new fields to product table
        if "product" in table_names:
            result = conn.execute(text("PRAGMA table_info(product)"))
            cols = {row[1] for row in result.fetchall()}

            if "source_url" not in cols:
                conn.execute(text("ALTER TABLE product ADD COLUMN source_url TEXT"))
                logger.info("Added 'source_url' column to product")

            if "price" not in cols:
                conn.execute(text("ALTER TABLE product ADD COLUMN price TEXT"))
                logger.info("Added 'price' column to product")

            if "scraped_image_ids" not in cols:
                conn.execute(text("ALTER TABLE product ADD COLUMN scraped_image_ids TEXT"))
                logger.info("Added 'scraped_image_ids' column to product")

            if "image_url" not in cols:
                conn.execute(text("ALTER TABLE product ADD COLUMN image_url TEXT"))
                logger.info("Added 'image_url' column to product")

        conn.commit()


def get_session() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session
