import json
import logging

from google import genai

from app.config import settings

logger = logging.getLogger(__name__)

RATIONALE_PROMPT = """당신은 한국 뷰티 마케팅 전문가입니다.
원본 프로모션 이미지 분석 결과와 타겟 정보를 바탕으로, 이 타겟에 맞는 이미지 변환이 왜 효과적인지 근거를 설명해주세요.

원본 이미지 분석:
{analysis_json}

타겟 정보:
- 이름: {target_name}
- 연령대: {target_age}
- 스타일 키워드: {style_keywords}

타겟 맞춤 텍스트 (이미지에 반영됨): {adapted_text}

적용된 비주얼 디렉션:
{prompt_used}

다음 관점에서 한국어 3-5문장으로 설명해주세요:
1. 이 세대의 한국 소비자가 어떤 비주얼에 반응하는지
2. 색상/조명/구도 변화가 타겟에게 왜 효과적인지
3. 텍스트가 변환된 경우, 해당 카피가 타겟에 왜 적합한지
4. 원본 대비 어떤 마케팅 효과 개선이 기대되는지

설명만 반환해주세요. 번호 매기기나 서식 없이 자연스러운 문장으로 작성합니다."""


async def generate_rationale(
    analysis_json: str,
    target_name: str,
    target_age: str,
    style_keywords: str,
    adapted_text: str | None,
    prompt_used: str,
) -> str | None:
    """Generate a rationale for the target transformation in Korean."""
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

    prompt = RATIONALE_PROMPT.format(
        analysis_json=analysis_json,
        target_name=target_name,
        target_age=target_age,
        style_keywords=kw_str,
        adapted_text=adapted_text or "(원본에 텍스트 없음)",
        prompt_used=prompt_used,
    )

    try:
        response = client.models.generate_content(
            model="gemini-3.1-pro-preview",
            contents=[prompt],
        )
        rationale = response.text.strip()
        logger.info(f"Generated rationale for {target_name}: {rationale[:100]}...")
        return rationale
    except Exception as e:
        logger.error(f"Rationale generation failed for {target_name}: {e}")
        return None
