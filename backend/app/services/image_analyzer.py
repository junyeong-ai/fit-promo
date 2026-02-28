import json

from PIL import Image as PILImage

from google import genai

from app.config import settings

ANALYSIS_PROMPT = """Analyze this beauty/cosmetic product promotional image in detail.
Return a JSON object with these fields:

- product_type: specific type of beauty product (e.g., "cushion foundation", "lip tint", "vitamin C serum")
- brand_elements: visible brand identity elements (logo style, packaging design, brand colors) - describe visually, not text content
- color_palette: list of dominant colors in the image (e.g., ["soft pink", "cream white", "rose gold"])
- composition: detailed description of image layout (e.g., "centered product on marble surface with botanical accents")
- target_demographic: apparent target audience based on visual style
- key_visual_elements: list of notable visual elements (e.g., ["product bottle", "water droplets", "flower petals", "gradient background"])
- mood: overall mood/feeling (e.g., "luxurious and serene", "playful and energetic")
- text_content: any text visible in the image, transcribed exactly as shown (Korean or English). If no text is visible, use empty string ""
- packaging_shape: description of product packaging form (e.g., "cylindrical tube", "square bottle with pump", "cushion compact")
- lighting_style: description of lighting (e.g., "soft diffused daylight", "studio strobe with rim light")

Return ONLY valid JSON, no markdown formatting or code blocks."""

ANALYSIS_WITH_PRODUCT_PROMPT = """Analyze this beauty/cosmetic product promotional image in detail.
A separate product image is also provided for accurate product identification.

Product information:
{product_info}

Using both the promotional image and the product reference image, return a JSON object with these fields:

- product_type: specific type of beauty product (use the product info provided)
- brand_elements: visible brand identity elements (logo style, packaging design, brand colors) - describe visually, not text content
- color_palette: list of dominant colors in the promotional image (e.g., ["soft pink", "cream white", "rose gold"])
- composition: detailed description of promotional image layout (e.g., "centered product on marble surface with botanical accents")
- target_demographic: apparent target audience based on visual style
- key_visual_elements: list of notable visual elements (e.g., ["product bottle", "water droplets", "flower petals", "gradient background"])
- mood: overall mood/feeling (e.g., "luxurious and serene", "playful and energetic")
- text_content: any text visible in the promotional image, transcribed exactly as shown (Korean or English). If no text is visible, use empty string ""
- packaging_shape: description of product packaging form based on the product image (e.g., "cylindrical tube", "square bottle with pump")
- lighting_style: description of lighting in the promotional image
- product_details: detailed visual description of the product from the reference image (shape, color, size, distinctive features)

Return ONLY valid JSON, no markdown formatting or code blocks."""


async def analyze_image(
    image_path: str,
    product_image_paths: list[str] | None = None,
    product_metadata: dict | None = None,
) -> str:
    client = genai.Client(
        vertexai=True,
        project=settings.GCP_PROJECT_ID,
        location=settings.GCP_LOCATION,
    )

    promo_img = PILImage.open(image_path)

    if product_image_paths or product_metadata:
        # Enhanced analysis with product context
        product_info_parts = []
        if product_metadata:
            if product_metadata.get("name"):
                product_info_parts.append(f"Product name: {product_metadata['name']}")
            if product_metadata.get("brand"):
                product_info_parts.append(f"Brand: {product_metadata['brand']}")
            if product_metadata.get("category"):
                product_info_parts.append(f"Category: {product_metadata['category']}")
            if product_metadata.get("description"):
                product_info_parts.append(f"Description: {product_metadata['description']}")
            if product_metadata.get("key_features"):
                features = product_metadata["key_features"]
                if isinstance(features, list):
                    product_info_parts.append(f"Key features: {', '.join(features)}")

        product_info = "\n".join(product_info_parts) if product_info_parts else "No metadata provided"
        prompt = ANALYSIS_WITH_PRODUCT_PROMPT.format(product_info=product_info)

        contents = [promo_img]
        if product_image_paths:
            for path in product_image_paths:
                contents.append(PILImage.open(path))
        contents.append(prompt)

        response = client.models.generate_content(
            model="gemini-3.1-pro-preview",
            contents=contents,
        )
    else:
        # Basic analysis with promotional image only
        response = client.models.generate_content(
            model="gemini-3.1-pro-preview",
            contents=[promo_img, ANALYSIS_PROMPT],
        )

    return response.text
