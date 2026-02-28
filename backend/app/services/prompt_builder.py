import json


DESIGN_STYLE_DIRECTIVES = {
    "person_centered": (
        "CRITICAL STYLE OVERRIDE — PERSON-CENTERED COMPOSITION: "
        "This image MUST prominently feature a photorealistic person (model/human figure). "
        "The person should occupy 60-70% of the frame, shown from waist-up or as a beauty portrait. "
        "The model should be naturally interacting with or holding the product. "
        "Show realistic skin texture, natural expression, and aspirational beauty. "
        "Magazine-quality beauty editorial portrait photography. "
        "\n\n"
        "⚠️ ABSOLUTE RULE — HUMAN ANATOMY ACCURACY (ZERO TOLERANCE): "
        "The person in the image MUST have a normal human body: "
        "exactly 1 head, 1 torso, 2 arms, 2 hands, 2 legs. "
        "Each hand MUST have exactly 5 fingers (1 thumb + 4 fingers). "
        "NEVER generate 3 hands, 3 arms, extra limbs, or any body-part duplication. "
        "NEVER generate fused, merged, split, or extra fingers. "
        "NEVER generate a floating hand or arm that is not connected to a shoulder. "
        "If the person holds a product, use a SIMPLE natural pose — one hand holds one product, "
        "the other hand rests naturally or holds a second item. Keep hand poses simple and relaxed. "
        "Avoid complex multi-object gripping or overlapping hand poses, as they cause artifacts. "
        "The person should have exactly 2 visible arms maximum in the frame. "
        "Double-check: count all hands in the image — there must be exactly 2, no more. "
        "\n\n"
        "Do NOT create a product-only flat-lay or still-life — a human must be the primary subject. "
        "Do NOT place the person unnaturally or in an awkward pose that hides the product."
    ),
    "product_centered": (
        "CRITICAL STYLE OVERRIDE — PRODUCT-CENTERED COMPOSITION: "
        "The product is the SOLE hero of this image and must occupy 50-70% of the frame. "
        "Use dramatic studio lighting with deep shadows and specular highlights on the product surface. "
        "Show luxurious staging — reflections, premium material surfaces, gradient backdrops. "
        "Commercial product photography at its finest: sharp focus on the product, shallow depth of field. "
        "Do NOT include any people, hands, or human figures in the image. "
        "Do NOT add lifestyle elements or busy backgrounds — keep the focus entirely on the product. "
        "Do NOT make the product appear smaller than 50% of the frame."
    ),
    "ingredient_focused": (
        "CRITICAL STYLE OVERRIDE — INGREDIENT-FOCUSED COMPOSITION: "
        "Surround the product with its key ingredients as physical visual objects — "
        "fresh citrus slices, water droplets, botanical leaves, flower petals, mineral crystals, honey drips, etc. "
        "The product should occupy 30-40% of the frame, with ingredients filling 40-50%. "
        "Create an ingredient-story composition that visually communicates efficacy and freshness. "
        "Use macro-photography style with vivid textures and moisture on ingredient surfaces. "
        "Do NOT include any people, hands, or human figures in the image. "
        "Do NOT use abstract or illustrated ingredient representations — they must look real and tangible. "
        "Do NOT let ingredients obscure or cover the product packaging."
    ),
    "lifestyle": (
        "CRITICAL STYLE OVERRIDE — LIFESTYLE SCENE COMPOSITION: "
        "Place the product naturally in a real-life setting — a bathroom shelf, vanity table, "
        "morning routine scene, bedside table, or travel pouch. "
        "The product should occupy 25-35% of the frame within the scene context. "
        "Warm, lived-in atmosphere with soft natural light (golden hour or window light). "
        "The product should feel like part of everyday life, not posed or staged artificially. "
        "Do NOT include any people, hands, or human figures in the image. "
        "Do NOT use pure white or studio backgrounds — the scene must feel like a real environment. "
        "Do NOT overcrowd the scene with too many props — keep it curated and aspirational."
    ),
    "minimal_graphic": (
        "CRITICAL STYLE OVERRIDE — MINIMAL GRAPHIC COMPOSITION: "
        "Clean flat-lay or centered composition with geometric shapes, bold color blocks, "
        "and graphic design elements. The product should occupy 40-50% of the frame. "
        "Poster-style aesthetic with strong visual hierarchy and intentional negative space. "
        "Think modern graphic design meets product photography — crisp edges, vibrant color contrasts. "
        "Use complementary or analogous color palette for background elements. "
        "Do NOT include any people, hands, or human figures in the image. "
        "Do NOT use realistic or natural backgrounds — keep it graphic and design-forward. "
        "Do NOT add cluttered or organic elements that break the clean geometric aesthetic."
    ),
}


def build_prompt(
    target_template: str,
    analysis_json: str,
    adapted_text: str | None = None,
    product_context: dict | None = None,
    design_style: str | None = None,
    has_reference_images: bool = False,
) -> str:
    """Build the final prompt from target template + image analysis + product info.

    Key design decisions:
    - Nano Banana 2 (Gemini 3.1 Flash) supports readable text rendering, so we
      instruct precise text placement when adapted_text is provided.
    - When no text is needed, we allow natural product packaging text but forbid
      extraneous additions like watermarks or random copy.
    - Product context gives the model exact product identity for accurate representation.
    - Analysis context provides product/color/mood info to maintain brand coherence.
    - Design style adds a compositional directive to guide the overall visual approach.
    """
    try:
        analysis = json.loads(analysis_json)
        context_parts = []

        # Reference image awareness instruction
        if has_reference_images and product_context:
            context_parts.insert(0,
                "IMPORTANT: Reference product photo(s) are provided as input images. "
                "You MUST faithfully reproduce the exact product appearance — same packaging shape, "
                "colors, label design, and proportions as shown in the reference photo(s). "
                "Do NOT invent or alter the product's visual identity."
            )

        # Product identity from explicit metadata (highest priority)
        if product_context:
            if product_context.get("name"):
                product_desc = f"The product is '{product_context['name']}'"
                if product_context.get("brand"):
                    product_desc += f" by {product_context['brand']}"
                context_parts.append(product_desc)

            if product_context.get("category"):
                context_parts.append(f"Product category: {product_context['category']}")

            if product_context.get("description"):
                context_parts.append(f"Product description: {product_context['description']}")

            if product_context.get("key_features"):
                features = product_context["key_features"]
                if isinstance(features, list) and features:
                    context_parts.append(
                        f"Key product features: {', '.join(features)}"
                    )
        else:
            # Fallback to analysis-based product identification
            if analysis.get("product_type"):
                context_parts.append(f"The product is a {analysis['product_type']}")

        if analysis.get("packaging_shape"):
            context_parts.append(f"Product packaging: {analysis['packaging_shape']}")

        if analysis.get("brand_elements"):
            brand = analysis["brand_elements"]
            if isinstance(brand, str) and brand:
                context_parts.append(f"Brand visual identity: {brand}")

        # Visual characteristics for coherence
        if analysis.get("color_palette"):
            palette = analysis["color_palette"]
            if isinstance(palette, list) and palette:
                context_parts.append(
                    f"Incorporate these brand colors where appropriate: {', '.join(palette)}"
                )

        if analysis.get("key_visual_elements"):
            elements = analysis["key_visual_elements"]
            if isinstance(elements, list) and elements:
                # Keep all visual elements when reference images are provided
                # (the model should replicate what it sees, including text on packaging)
                if (adapted_text and adapted_text.strip()) or has_reference_images:
                    filtered = elements
                else:
                    filtered = [
                        e for e in elements
                        if not any(w in e.lower() for w in ["text", "letter", "word", "font", "typography"])
                    ]
                if filtered:
                    context_parts.append(f"Include these visual elements: {', '.join(filtered)}")

        if analysis.get("mood"):
            context_parts.append(f"Original mood reference: {analysis['mood']}")

        if analysis.get("lighting_style"):
            context_parts.append(f"Reference lighting: {analysis['lighting_style']}")

        if context_parts:
            analysis_context = " ".join(context_parts) + "."
        else:
            analysis_context = ""

    except (json.JSONDecodeError, TypeError):
        analysis_context = ""

    # Build style directive
    style_directive = ""
    if design_style and design_style in DESIGN_STYLE_DIRECTIVES:
        style_directive = DESIGN_STYLE_DIRECTIVES[design_style]

    # Build text instruction — Nano Banana 2 can render readable text in images.
    # When adapted_text exists, instruct precise text placement.
    # When no text is needed, preserve natural product packaging text
    # but forbid extraneous additions.
    if adapted_text and adapted_text.strip():
        text_instruction = (
            f"TEXT RENDERING INSTRUCTIONS — Follow these exactly:\n"
            f'1. Render this exact promotional text in the image: "{adapted_text}"\n'
            f"2. Use a clean, modern sans-serif font appropriate for premium beauty advertising.\n"
            f"3. Place the text in a visually balanced area that does NOT overlap the product.\n"
            f"4. Ensure the text is sharp, high-contrast, and fully legible at a glance.\n"
            f"5. Match the text color to complement the overall color palette.\n"
            f"6. Do NOT add any extra text, watermarks, or characters beyond the specified text.\n"
            f"7. Spell every character exactly as given — no substitutions or omissions."
        )
    else:
        text_instruction = (
            "TEXT INSTRUCTIONS: Do NOT add any extra promotional copy, watermarks, "
            "random words, or decorative text that is not part of the original product. "
            "However, preserve the product's natural packaging text — brand name, labels, "
            "logos, and any text visible on the product itself should remain intact and legible. "
            "Only forbid extraneous text elements that were not on the original product."
        )

    prompt = target_template.replace("{analysis_context}", analysis_context)

    # Handle {style_directive} placeholder — insert before {text_instruction} if missing
    if "{style_directive}" in prompt:
        prompt = prompt.replace("{style_directive}", style_directive)
    elif style_directive:
        prompt = prompt.replace("{text_instruction}", f"{style_directive} {text_instruction}")
    else:
        pass  # No style directive to insert

    prompt = prompt.replace("{text_instruction}", text_instruction)

    # Global anatomy safeguard: if the prompt mentions a person/human but we didn't
    # already inject the person_centered directive (which has detailed anatomy rules),
    # append a compact anatomy constraint to prevent extra-limb artifacts.
    person_keywords = ["person", "human", "model", "woman", "man", "portrait", "people"]
    mentions_person = any(kw in prompt.lower() for kw in person_keywords)
    already_has_anatomy_rule = "HUMAN ANATOMY ACCURACY" in prompt

    if mentions_person and not already_has_anatomy_rule:
        prompt += (
            "\n\n⚠️ HUMAN ANATOMY CONSTRAINT: Any person in this image MUST have "
            "exactly 2 arms, 2 hands (5 fingers each), and 2 legs. "
            "NEVER generate 3 hands, extra arms, extra fingers, fused digits, "
            "or any anatomical duplication. Keep hand poses simple to avoid artifacts."
        )

    return prompt
