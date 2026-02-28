import json

from PIL import Image as PILImage

from google import genai

from app.config import settings

BRIEF_PROMPT = """You are a creative director for Korean beauty advertising.
Based on the following inputs, generate a detailed creative brief for a promotional image.

{inputs}

Return a JSON object with these fields (matching the structure of an image analysis):
- product_type: type of product (infer from context, e.g., "vitamin C serum")
- brand_elements: suggested brand visual elements based on the product info (string)
- color_palette: list of 3-5 recommended colors (list of strings, e.g., ["soft pink", "cream white"])
- composition: detailed description of ideal image layout
- mood: overall mood/feeling for the image
- key_visual_elements: list of visual elements to include (list of strings)
- lighting_style: recommended lighting approach
- text_content: any promotional text to render in the image (from the promotion description). If no specific text, use empty string ""
- packaging_shape: product packaging description if known, otherwise best guess
- scene_description: detailed scene description for image generation
- product_placement: how the product should be positioned in the scene

Return ONLY valid JSON, no markdown formatting or code blocks."""


async def generate_creative_brief(
    promotion_prompt: str | None = None,
    product_context: dict | None = None,
    design_style: str | None = None,
    product_image_paths: list[str] | None = None,
) -> str:
    """Generate a creative brief JSON matching image_analyzer output structure."""
    input_parts = []

    if promotion_prompt:
        input_parts.append(f"Promotion description: {promotion_prompt}")

    if product_context:
        product_lines = []
        if product_context.get("name"):
            product_lines.append(f"Product name: {product_context['name']}")
        if product_context.get("brand"):
            product_lines.append(f"Brand: {product_context['brand']}")
        if product_context.get("category"):
            product_lines.append(f"Category: {product_context['category']}")
        if product_context.get("description"):
            product_lines.append(f"Description: {product_context['description']}")
        if product_context.get("key_features"):
            features = product_context["key_features"]
            if isinstance(features, list):
                product_lines.append(f"Key features: {', '.join(features)}")
        if product_lines:
            input_parts.append("Product information:\n" + "\n".join(product_lines))

    if design_style:
        from app.services.prompt_builder import DESIGN_STYLE_DIRECTIVES
        style_desc = DESIGN_STYLE_DIRECTIVES.get(design_style, "")
        if style_desc:
            input_parts.append(f"Design style direction: {style_desc}")

    inputs = "\n\n".join(input_parts) if input_parts else "Create a generic beauty product promotional image."

    prompt = BRIEF_PROMPT.format(inputs=inputs)

    client = genai.Client(
        vertexai=True,
        project=settings.GCP_PROJECT_ID,
        location=settings.GCP_LOCATION,
    )

    contents: list = []
    if product_image_paths:
        for path in product_image_paths:
            contents.append(PILImage.open(path))
    contents.append(prompt)

    response = client.models.generate_content(
        model="gemini-3.1-pro-preview",
        contents=contents,
    )

    raw = response.text.strip()
    # Strip markdown code fences if present
    if raw.startswith("```"):
        raw = raw.split("\n", 1)[1] if "\n" in raw else raw[3:]
    if raw.endswith("```"):
        raw = raw[:-3]
    raw = raw.strip()

    # Validate it's valid JSON
    json.loads(raw)

    return raw
