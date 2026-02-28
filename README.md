# Fit-Promo

타겟 페르소나별 AI 뷰티 프로모션 이미지 생성 시스템.

하나의 프로모션 기획(텍스트 설명 또는 참고 이미지)을 입력하면, 8종의 소비자 페르소나에 맞춰 각각 다른 비주얼·카피·톤의 프로모션 이미지를 자동 생성합니다.

## 기술 스택

| 영역 | 기술 |
|------|------|
| Backend | Python, FastAPI, SQLModel, SQLite |
| Frontend | Next.js 16, React 19, Tailwind CSS 4, Framer Motion |
| AI 모델 | Google Gemini 3.1 Pro (분석/텍스트), Gemini 3.1 Flash Image (이미지 생성) |
| 인프라 | Google Cloud Vertex AI |

## 생성 파이프라인

```
입력 (프로모션 설명 / 참고 이미지 / 제품 정보)
  │
  ├─ [참고 이미지 있음] → Gemini Pro가 이미지 분석 (색상, 구도, 무드, 텍스트 추출)
  ├─ [텍스트만 입력]   → Gemini Pro가 크리에이티브 브리프 생성
  │
  ▼
타겟별 병렬 처리 (타겟 N개 × 아래 3단계)
  │
  ├─ 1. 텍스트 어댑테이션 — 원본 카피를 타겟 세대 어투로 변환 (Gemini Pro)
  ├─ 2. 이미지 생성 — 타겟 프롬프트 + 디자인 스타일 + 분석 컨텍스트 조합 (Gemini Flash Image)
  └─ 3. 변환 근거 생성 — 왜 이 비주얼이 해당 타겟에 효과적인지 설명 (Gemini Pro)
  │
  ▼
결과: 타겟별 생성 이미지 + 맞춤 카피 + 마케팅 근거
```

## 타겟 페르소나 (8종 내장)

| 페르소나 | 연령대 | 핵심 키워드 |
|----------|--------|-------------|
| 트렌드세터 수빈 | 20대 후반 | K-뷰티 인디 브랜드, 인스타 감성, 클린뷰티 |
| 성분 분석가 지현 | 30대 초반 | 전성분 분석, 더마코스메틱, 임상 데이터 |
| 올영 입문생 하은 | 10대 후반~20대 초반 | 뷰티 초보, 가성비, 틱톡 감성 |
| 워킹맘 은지 | 30대 중후반 | 올인원, 간편 루틴, 시간 절약 |
| 헬스 브로 민준 | 20대 후반 | 남성 그루밍, 탈모 예방, 기능적 |
| 선물 요정 소연 | 20대 초중반 | 선물 추천, 기프트 세트, 예쁜 포장 |
| 안티에이징 전사 미영 | 40대 초중반 | 레티놀, 콜라겐 부스팅, 합리적 럭셔리 |
| 건강 투자자 정숙 | 50대 초반 | 건강기능식품, 식약처 인증, 한방 프리미엄 |

커스텀 타겟도 UI에서 추가/수정/삭제 가능.

## 디자인 스타일 (5종)

| 스타일 | 설명 |
|--------|------|
| `person_centered` | 모델이 제품을 들고 있는 뷰티 에디토리얼 |
| `product_centered` | 제품이 프레임 50~70%를 차지하는 스튜디오 촬영 |
| `ingredient_focused` | 제품 주변에 실제 원료 배치 (과일, 꽃잎, 물방울 등) |
| `lifestyle` | 욕실 선반, 화장대 등 일상 공간에 자연스럽게 배치 |
| `minimal_graphic` | 기하학적 도형과 볼드 컬러 블록의 포스터 스타일 |

## 주요 기능

- **이중 입력 모드**: 참고 이미지 기반(derive) 또는 텍스트 설명 기반(create) 생성
- **제품 연동**: 내장 제품 4종(이니스프리) 또는 직접 등록. 제품 이미지를 레퍼런스로 활용하여 패키지 정확도 향상
- **타겟별 카피 어댑테이션**: Z세대(신조어/반말) → 시니어(존댓말/안전성 강조)까지 세대별 어투 자동 변환
- **변환 근거(Rationale)**: 각 생성 결과에 대해 "왜 이 비주얼이 이 타겟에 효과적인지" 마케팅 근거 제공
- **Before/After 비교**: 슬라이더로 원본 vs 생성 이미지 비교
- **이미지 업로드**: 드래그앤드롭, 클릭, 클립보드 붙여넣기(Ctrl+V) 지원
- **실시간 진행 상태**: 생성 단계별 애니메이션 로딩 + 경과 시간 타이머

## API 엔드포인트

| Method | Path | 설명 |
|--------|------|------|
| `POST` | `/api/v1/images/upload` | 이미지 업로드 |
| `GET` | `/api/v1/images` | 업로드 이미지 목록 |
| `GET` | `/api/v1/targets` | 타겟 목록 |
| `POST` | `/api/v1/targets` | 커스텀 타겟 생성 |
| `PUT` | `/api/v1/targets/:id` | 타겟 수정 |
| `DELETE` | `/api/v1/targets/:id` | 타겟 삭제 |
| `GET` | `/api/v1/products` | 제품 목록 |
| `POST` | `/api/v1/products` | 제품 등록 |
| `GET` | `/api/v1/products/:id` | 제품 상세 |
| `PUT` | `/api/v1/products/:id` | 제품 수정 |
| `DELETE` | `/api/v1/products/:id` | 제품 삭제 |
| `POST` | `/api/v1/generations` | 이미지 생성 요청 (비동기) |
| `GET` | `/api/v1/generations/:id` | 생성 상태/결과 조회 |
| `GET` | `/health` | 헬스체크 |

## 프로젝트 구조

```
fit-promo/
├── backend/
│   ├── app/
│   │   ├── main.py                  # FastAPI 앱, 시드 데이터, CORS
│   │   ├── config.py                # pydantic-settings 환경변수
│   │   ├── database.py              # SQLite 엔진, 마이그레이션
│   │   ├── api/v1/
│   │   │   ├── router.py            # v1 라우터 집합
│   │   │   ├── generations.py       # 생성 파이프라인 (백그라운드 태스크)
│   │   │   ├── images.py            # 이미지 업로드
│   │   │   ├── targets.py           # 타겟 CRUD
│   │   │   └── products.py          # 제품 CRUD
│   │   ├── models/
│   │   │   ├── db.py                # SQLModel 테이블 (Image, Target, Product, Generation, GenerationResult)
│   │   │   └── schemas.py           # Pydantic 요청/응답 스키마
│   │   ├── services/
│   │   │   ├── image_analyzer.py    # Gemini Pro 이미지 분석
│   │   │   ├── creative_brief_generator.py  # 텍스트→크리에이티브 브리프
│   │   │   ├── text_adapter.py      # 타겟별 카피 변환
│   │   │   ├── prompt_builder.py    # 최종 프롬프트 조립 (디자인 스타일 + 분석 + 텍스트)
│   │   │   ├── image_generator.py   # Gemini Flash Image 생성
│   │   │   ├── rationale_generator.py  # 변환 근거 생성
│   │   │   ├── product_scraper.py   # URL→제품 정보 추출, 이미지 다운로드
│   │   │   └── storage.py           # 파일 저장 유틸리티
│   │   └── prompts/
│   │       ├── targets.py           # 8종 내장 페르소나 프롬프트 템플릿
│   │       └── products.py          # 4종 내장 제품 데이터
│   └── requirements.txt
│
└── frontend/
    ├── src/
    │   ├── app/
    │   │   ├── layout.tsx           # 루트 레이아웃 (다크 테마, Inter 폰트)
    │   │   └── page.tsx             # 메인 페이지 (폼 ↔ 결과 뷰 전환)
    │   ├── components/
    │   │   ├── image-upload.tsx      # 드래그앤드롭 + 붙여넣기 이미지 업로드
    │   │   ├── promotion-prompt-input.tsx  # 프로모션 설명 입력
    │   │   ├── product-info-form.tsx # 제품 선택/등록
    │   │   ├── design-style-selector.tsx  # 디자인 스타일 5종 선택
    │   │   ├── target-selector.tsx   # 타겟 다중 선택
    │   │   ├── target-manager-inline.tsx  # 타겟 추가/수정/삭제 관리
    │   │   ├── generation-result-view.tsx  # 결과 화면 (로딩 → 완료)
    │   │   ├── generation-result-tabs.tsx  # 타겟별 탭 + 진행 상태
    │   │   └── image-compare.tsx     # Before/After 슬라이더 비교
    │   ├── hooks/
    │   │   └── use-polling.ts        # 생성 상태 폴링 훅
    │   └── lib/
    │       ├── api.ts               # API 클라이언트
    │       ├── types.ts             # TypeScript 타입 정의
    │       └── utils.ts             # cn() 유틸리티
    ├── package.json
    └── tsconfig.json
```

## 설치 및 실행

### 사전 요구사항

- Python 3.12+
- Node.js 20+
- Google Cloud 프로젝트 (Vertex AI API 활성화, `gcloud auth application-default login` 완료)

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

cp .env.example .env
# .env 파일에서 GCP_PROJECT_ID 설정

uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

서버 시작 시 SQLite DB 자동 생성, 8종 타겟 + 4종 제품 자동 시드.

### Frontend

```bash
cd frontend
npm install

cp .env.example .env.local
# .env.local에서 NEXT_PUBLIC_API_URL을 백엔드 주소로 설정

npm run dev
```

`http://localhost:3000` 접속.

## 환경 변수

### Backend (`backend/.env`)

| 변수 | 설명 | 기본값 |
|------|------|--------|
| `GCP_PROJECT_ID` | Google Cloud 프로젝트 ID | (필수) |
| `GCP_LOCATION` | Vertex AI 리전 | `global` |
| `DATABASE_URL` | SQLite DB 경로 | `sqlite:///./fitpromo.db` |
| `UPLOAD_DIR` | 파일 저장 디렉토리 | `./uploads` |
| `ALLOWED_ORIGINS` | CORS 허용 오리진 (쉼표 구분 또는 `*`) | `http://localhost:3000` |

### Frontend (`frontend/.env.local`)

| 변수 | 설명 | 기본값 |
|------|------|--------|
| `NEXT_PUBLIC_API_URL` | 백엔드 API URL | `http://localhost:8000` |

## 사용된 AI 모델

| 모델 | 용도 | 호출 위치 |
|------|------|-----------|
| `gemini-3.1-pro-preview` | 이미지 분석, 크리에이티브 브리프, 텍스트 어댑테이션, 변환 근거 | `image_analyzer.py`, `creative_brief_generator.py`, `text_adapter.py`, `rationale_generator.py`, `product_scraper.py` |
| `gemini-3.1-flash-image-preview` | 프로모션 이미지 생성 (TEXT+IMAGE 응답) | `image_generator.py` |

이미지 생성 설정: 16:9 비율, 2K 해상도. 레퍼런스 이미지(제품 사진) 입력 지원.
