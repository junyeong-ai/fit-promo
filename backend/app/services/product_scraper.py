import json
import logging

import httpx
from google import genai

from app.config import settings

logger = logging.getLogger(__name__)

EXTRACTION_PROMPT = """You are an e-commerce product data extractor.
Analyze the following HTML content from a Korean beauty/cosmetic product page.

Extract the following information and return as a JSON object:
- name: product name (string)
- brand: brand name (string or null)
- description: product description (string or null)
- key_features: list of key product features (list of strings or null)
- price: price as displayed on page, including currency (string or null)
- image_urls: list of product image URLs found in the page (list of strings, max 5)
- category: product category (string or null)

Return ONLY valid JSON, no markdown formatting or code blocks.
If a field cannot be determined, use null.

HTML content:
{html_content}"""

MAX_HTML_LENGTH = 30000


async def scrape_product(url: str) -> dict:
    """Fetch a product URL and extract structured product data using Gemini."""
    async with httpx.AsyncClient(
        follow_redirects=True,
        timeout=15.0,
        headers={
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        },
    ) as http_client:
        response = await http_client.get(url)
        response.raise_for_status()
        html = response.text

    # Truncate HTML to avoid token limits
    if len(html) > MAX_HTML_LENGTH:
        html = html[:MAX_HTML_LENGTH]

    prompt = EXTRACTION_PROMPT.format(html_content=html)

    client = genai.Client(
        vertexai=True,
        project=settings.GCP_PROJECT_ID,
        location=settings.GCP_LOCATION,
    )

    gemini_response = client.models.generate_content(
        model="gemini-3.1-pro-preview",
        contents=[prompt],
    )

    raw = gemini_response.text.strip()
    # Strip markdown code fences if present
    if raw.startswith("```"):
        raw = raw.split("\n", 1)[1] if "\n" in raw else raw[3:]
    if raw.endswith("```"):
        raw = raw[:-3]
    raw = raw.strip()

    data = json.loads(raw)
    return data


async def download_image(url: str) -> bytes | None:
    """Download an image from a URL. Returns bytes or None on failure."""
    try:
        async with httpx.AsyncClient(
            follow_redirects=True,
            timeout=10.0,
            headers={
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
            },
        ) as http_client:
            response = await http_client.get(url)
            response.raise_for_status()
            content_type = response.headers.get("content-type", "")
            if "image" in content_type:
                return response.content
    except Exception as e:
        logger.warning(f"Failed to download image from {url}: {e}")
    return None
