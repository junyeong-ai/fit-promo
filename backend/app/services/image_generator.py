import asyncio
import logging

from google import genai
from google.genai import types

from app.config import settings
from app.services.storage import save_bytes

logger = logging.getLogger(__name__)

MAX_RETRIES = 5
INITIAL_WAIT = 30  # seconds


async def generate_image(
    prompt: str,
    reference_images: list[str] | None = None,
) -> str | None:
    """Generate an image using Nano Banana 2 (Gemini 3.1 Flash Image).

    Uses generate_content with TEXT+IMAGE response modalities.
    Compared to Imagen 3.0:
    - Much faster generation (Flash-based)
    - Supports readable text rendering in images
    - Up to 4K resolution, flexible aspect ratios
    """
    from PIL import Image as PILImage

    client = genai.Client(
        vertexai=True,
        project=settings.GCP_PROJECT_ID,
        location="global",
    )

    contents: list = []
    if reference_images:
        for img_path in reference_images:
            contents.append(PILImage.open(img_path))
    contents.append(prompt)

    for attempt in range(MAX_RETRIES):
        try:
            response = client.models.generate_content(
                model="gemini-3.1-flash-image-preview",
                contents=contents,
                config=types.GenerateContentConfig(
                    response_modalities=["TEXT", "IMAGE"],
                    image_config=types.ImageConfig(
                        aspect_ratio="16:9",
                        image_size="2K",
                    ),
                ),
            )

            if not response.candidates:
                return None

            # Extract image from response parts
            for part in response.candidates[0].content.parts:
                if part.inline_data and part.inline_data.data:
                    image_bytes = part.inline_data.data
                    stored_path = save_bytes(
                        image_bytes, "generated.png", subdir="generated"
                    )
                    return stored_path

            return None

        except Exception as e:
            if "429" in str(e) or "RESOURCE_EXHAUSTED" in str(e):
                wait = INITIAL_WAIT * (attempt + 1)
                logger.warning(f"Rate limited, waiting {wait}s (attempt {attempt + 1}/{MAX_RETRIES})")
                await asyncio.sleep(wait)
            else:
                logger.error(f"Image generation failed (non-rate-limit): {e}")
                raise

    raise Exception("Max retries exceeded for image generation")
