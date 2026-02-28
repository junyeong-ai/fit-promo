import asyncio
import json
import logging
from datetime import datetime

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from sqlmodel import Session, select

from app.database import engine, get_session
from app.models.db import Generation, GenerationResult, Image, Product, Target
from app.models.schemas import GenerationCreate, GenerationRead

from app.services.creative_brief_generator import generate_creative_brief
from app.services.image_analyzer import analyze_image
from app.services.image_generator import generate_image
from app.services.product_scraper import download_image
from app.services.prompt_builder import build_prompt
from app.services.text_adapter import adapt_text
from app.services.rationale_generator import generate_rationale
from app.services.storage import get_absolute_path, save_bytes

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/generations", tags=["generations"])


def _build_product_context(product: Product) -> dict:
    """Extract product metadata as a dict for prompt enrichment."""
    ctx = {"name": product.name}
    if product.brand:
        ctx["brand"] = product.brand
    if product.category:
        ctx["category"] = product.category
    if product.description:
        ctx["description"] = product.description
    if product.key_features:
        try:
            ctx["key_features"] = json.loads(product.key_features)
        except (json.JSONDecodeError, TypeError):
            ctx["key_features"] = product.key_features
    if product.image_url:
        ctx["image_url"] = product.image_url
    return ctx


def _build_multi_product_context(products: list[Product]) -> dict:
    """Merge multiple product metadata into a single context dict."""
    if len(products) == 1:
        return _build_product_context(products[0])

    names = []
    brands = []
    categories = []
    descriptions = []
    all_features = []
    image_urls = []

    for p in products:
        names.append(p.name)
        if p.brand:
            brands.append(p.brand)
        if p.category:
            categories.append(p.category)
        if p.description:
            descriptions.append(p.description)
        if p.key_features:
            try:
                feats = json.loads(p.key_features)
                if isinstance(feats, list):
                    all_features.extend(feats)
            except (json.JSONDecodeError, TypeError):
                all_features.append(p.key_features)
        if p.image_url:
            image_urls.append(p.image_url)

    ctx: dict = {"name": " + ".join(names)}
    if brands:
        ctx["brand"] = ", ".join(set(brands))
    if categories:
        ctx["category"] = ", ".join(set(categories))
    if descriptions:
        ctx["description"] = " | ".join(descriptions)
    if all_features:
        ctx["key_features"] = all_features
    if image_urls:
        ctx["image_urls"] = image_urls
        ctx["image_url"] = image_urls[0]
    return ctx


async def _resolve_product_image(product: Product, session: Session) -> str | None:
    """Resolve a product's image to a local file path.

    1. If product.image_id exists, look up the Image record and return its path.
    2. If product.image_url exists but image_id is None, download the image,
       save it locally, create an Image record, and update the product.
    3. If neither exists, return None.
    """
    if product.image_id:
        img = session.get(Image, product.image_id)
        if img:
            return get_absolute_path(img.stored_path)

    if product.image_url:
        image_bytes = await download_image(product.image_url)
        if image_bytes:
            stored_path = save_bytes(image_bytes, "product.png", subdir="products")
            img = Image(
                filename="product.png",
                stored_path=stored_path,
                mime_type="image/png",
                size_bytes=len(image_bytes),
            )
            session.add(img)
            session.commit()
            session.refresh(img)
            product.image_id = img.id
            session.add(product)
            session.commit()
            return get_absolute_path(stored_path)

    return None


async def run_pipeline(generation_id: int):
    with Session(engine) as session:
        generation = session.get(Generation, generation_id)
        if not generation:
            return

        try:
            generation.status = "analyzing"
            session.add(generation)
            session.commit()

            # Get product info if linked (supports multiple products)
            product_context = None
            product_image_paths: list[str] = []
            products: list[Product] = []

            if generation.product_ids:
                try:
                    pids = json.loads(generation.product_ids)
                    for pid in pids:
                        p = session.get(Product, pid)
                        if p:
                            products.append(p)
                except (json.JSONDecodeError, TypeError):
                    pass
            elif generation.product_id:
                p = session.get(Product, generation.product_id)
                if p:
                    products.append(p)

            if products:
                product_context = _build_multi_product_context(products)
                for p in products:
                    path = await _resolve_product_image(p, session)
                    if path:
                        product_image_paths.append(path)

            # Determine mode and get analysis/brief
            mode = generation.mode or "derive"

            if mode == "derive" and generation.source_image_id:
                # Existing flow: analyze the source image
                source_image = session.get(Image, generation.source_image_id)
                if not source_image:
                    raise ValueError("Source image not found")

                image_path = get_absolute_path(source_image.stored_path)

                analysis_json = await analyze_image(
                    image_path,
                    product_image_paths=product_image_paths or None,
                    product_metadata=product_context,
                )
            else:
                # New flow: generate creative brief from prompt
                analysis_json = await generate_creative_brief(
                    promotion_prompt=generation.promotion_prompt,
                    product_context=product_context,
                    design_style=generation.design_style,
                    product_image_paths=product_image_paths or None,
                )

            generation.analysis_result = analysis_json
            generation.status = "generating"
            session.add(generation)
            session.commit()

            # Extract text_content from analysis
            text_content = None
            try:
                analysis = json.loads(analysis_json)
                text_content = analysis.get("text_content")
            except (json.JSONDecodeError, TypeError):
                pass

            results = session.exec(
                select(GenerationResult).where(
                    GenerationResult.generation_id == generation_id
                )
            ).all()

            all_succeeded = True
            for i, result in enumerate(results):
                if i > 0:
                    await asyncio.sleep(5)
                try:
                    result.status = "generating"
                    session.add(result)
                    session.commit()

                    target = session.get(Target, result.target_id)
                    if not target:
                        raise ValueError(f"Target {result.target_id} not found")

                    # Step 1: Adapt text for target
                    adapted = None
                    if text_content and text_content.strip():
                        adapted = await adapt_text(
                            text_content=text_content,
                            target_name=target.name,
                            target_age=target.target_age,
                            style_keywords=target.style_keywords,
                        )
                    result.adapted_text = adapted

                    # Step 2: Build prompt with analysis + adapted text + product info + style
                    prompt = build_prompt(
                        target.prompt_template,
                        analysis_json,
                        adapted,
                        product_context,
                        design_style=generation.design_style,
                        has_reference_images=bool(product_image_paths),
                    )
                    result.prompt_used = prompt

                    # Step 3: Generate image
                    stored_path = await generate_image(
                        prompt, reference_images=product_image_paths or None
                    )
                    if stored_path:
                        result.stored_path = stored_path
                        result.status = "completed"
                    else:
                        result.status = "failed"
                        result.error = "No image returned from generator"
                        all_succeeded = False

                    # Step 4: Generate rationale
                    if result.status == "completed":
                        rationale_text = await generate_rationale(
                            analysis_json=analysis_json,
                            target_name=target.name,
                            target_age=target.target_age,
                            style_keywords=target.style_keywords,
                            adapted_text=adapted,
                            prompt_used=prompt,
                        )
                        result.rationale = rationale_text

                except Exception as e:
                    result.status = "failed"
                    result.error = str(e)
                    all_succeeded = False
                    logger.error(f"Pipeline failed for target {result.target_id}: {e}")

                session.add(result)
                session.commit()

            generation.status = "completed" if all_succeeded else "failed"
            generation.completed_at = datetime.utcnow()

        except Exception as e:
            generation.status = "failed"
            generation.error = str(e)
            generation.completed_at = datetime.utcnow()
            logger.error(f"Pipeline failed for generation {generation_id}: {e}")

        session.add(generation)
        session.commit()


@router.post("", response_model=GenerationRead)
def create_generation(
    body: GenerationCreate,
    background_tasks: BackgroundTasks,
    session: Session = Depends(get_session),
):
    # Validate: need at least promotion_prompt or source_image_id
    if not body.source_image_id and not body.promotion_prompt:
        raise HTTPException(
            status_code=422,
            detail="프로모션 설명 또는 참고 이미지 중 하나는 필수입니다.",
        )

    # Validate source image if provided
    source_image = None
    if body.source_image_id:
        source_image = session.get(Image, body.source_image_id)
        if not source_image:
            raise HTTPException(status_code=404, detail="Source image not found")

    # Validate products if provided
    validated_products: list[Product] = []
    if body.product_ids:
        for pid in body.product_ids:
            product = session.get(Product, pid)
            if not product:
                raise HTTPException(status_code=404, detail=f"Product {pid} not found")
            validated_products.append(product)

    targets = []
    for tid in body.target_ids:
        target = session.get(Target, tid)
        if not target:
            raise HTTPException(status_code=404, detail=f"Target {tid} not found")
        targets.append(target)

    # Auto-determine mode
    mode = "derive" if body.source_image_id else "create"

    product_ids_json = json.dumps([p.id for p in validated_products]) if validated_products else None

    generation = Generation(
        source_image_id=body.source_image_id,
        product_id=validated_products[0].id if validated_products else None,
        product_ids=product_ids_json,
        promotion_prompt=body.promotion_prompt,
        design_style=body.design_style,
        mode=mode,
    )
    session.add(generation)
    session.commit()
    session.refresh(generation)

    results = []
    for target in targets:
        gen_result = GenerationResult(
            generation_id=generation.id,
            target_id=target.id,
        )
        session.add(gen_result)
        results.append(gen_result)

    session.commit()
    for r in results:
        session.refresh(r)

    background_tasks.add_task(run_pipeline, generation.id)

    # Refresh all objects after commit so model_dump() works
    session.refresh(generation)

    gen_dict = generation.model_dump()
    if source_image:
        session.refresh(source_image)
    gen_dict["source_image"] = source_image.model_dump() if source_image else None
    if validated_products:
        session.refresh(validated_products[0])
    gen_dict["product"] = validated_products[0].model_dump() if validated_products else None
    result_dicts = []
    for r in results:
        session.refresh(r)
        rd = r.model_dump()
        target = session.get(Target, r.target_id)
        rd["target"] = target.model_dump() if target else None
        result_dicts.append(rd)
    gen_dict["results"] = result_dicts
    return gen_dict


@router.get("/{generation_id}", response_model=GenerationRead)
def get_generation(generation_id: int, session: Session = Depends(get_session)):
    generation = session.get(Generation, generation_id)
    if not generation:
        raise HTTPException(status_code=404, detail="Generation not found")

    source_image = (
        session.get(Image, generation.source_image_id)
        if generation.source_image_id
        else None
    )
    product = session.get(Product, generation.product_id) if generation.product_id else None
    results = session.exec(
        select(GenerationResult).where(
            GenerationResult.generation_id == generation_id
        )
    ).all()

    gen_dict = generation.model_dump()
    gen_dict["source_image"] = source_image.model_dump() if source_image else None
    gen_dict["product"] = product.model_dump() if product else None
    result_dicts = []
    for r in results:
        rd = r.model_dump()
        t = session.get(Target, r.target_id)
        rd["target"] = t.model_dump() if t else None
        result_dicts.append(rd)
    gen_dict["results"] = result_dicts
    return gen_dict
