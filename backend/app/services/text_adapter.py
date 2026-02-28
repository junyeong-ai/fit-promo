import json
import logging

from google import genai

from app.config import settings

logger = logging.getLogger(__name__)

ADAPT_PROMPT = """당신은 한국 뷰티 시장 전문 카피라이터입니다.
원본 프로모션 이미지에서 추출된 텍스트를 특정 타겟에 맞게 재작성해주세요.
이 텍스트는 AI 이미지 생성 모델이 이미지 안에 직접 렌더링합니다.

원본 텍스트:
{text_content}

타겟 정보:
- 타겟: {target_name}
- 연령대: {target_age}
- 스타일 키워드: {style_keywords}

규칙:
1. 핵심 제품 정보와 메시지는 유지
2. 타겟 세대의 어투, 용어, 감성에 맞게 변환
3. 가능한 한 짧고 임팩트 있게 작성 (이미지 안에 렌더링되므로 긴 텍스트는 비효과적)
4. 최대 15자 이내의 핵심 카피 1줄 권장 (보조 카피가 필요하면 최대 2줄)
5. 한국어 텍스트는 한국어로, 영어 텍스트는 영어로 유지
6. 변환된 텍스트만 반환 (따옴표, 설명 없이)

세대별 카피 가이드:
- Z세대: 줄임말/신조어 OK, 친근한 반말체, 감성적 표현 ("찐템", "갓성비", "~해버렸다")
- 밀레니얼: 세련된 해요체, 성분/효능 강조, 라이프스타일 연결 ("데일리 루틴에 딱")
- X세대: 정중한 존댓말, 효능/결과 중심, 전문적 신뢰감 ("임상 테스트 완료", "피부과학")
- 시니어: 쉬운 표현, 안전성 강조, 따뜻한 톤 ("순하게 케어", "피부과 전문의 추천")"""


async def adapt_text(
    text_content: str,
    target_name: str,
    target_age: str,
    style_keywords: str,
) -> str | None:
    """Adapt original image text for a specific target using Gemini.

    The adapted text is included in the Imagen prompt so the model
    attempts to render it in the generated image. It is also stored
    in the DB for display in the UI alongside the generated image.
    """
    if not text_content or not text_content.strip():
        return None

    client = genai.Client(
        vertexai=True,
        project=settings.GCP_PROJECT_ID,
        location=settings.GCP_LOCATION,
    )

    try:
        kw_list = json.loads(style_keywords)
        kw_str = ", ".join(kw_list)
    except (json.JSONDecodeError, TypeError):
        kw_str = style_keywords

    prompt = ADAPT_PROMPT.format(
        text_content=text_content,
        target_name=target_name,
        target_age=target_age,
        style_keywords=kw_str,
    )

    try:
        response = client.models.generate_content(
            model="gemini-3.1-pro-preview",
            contents=[prompt],
        )
        adapted = response.text.strip()
        # Remove surrounding quotes if Gemini added them
        if (adapted.startswith('"') and adapted.endswith('"')) or \
           (adapted.startswith("'") and adapted.endswith("'")):
            adapted = adapted[1:-1]
        logger.info(f"Adapted text for {target_name}: {adapted[:100]}...")
        return adapted
    except Exception as e:
        logger.error(f"Text adaptation failed for {target_name}: {e}")
        return None
