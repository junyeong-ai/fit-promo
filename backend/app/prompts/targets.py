BUILTIN_TARGETS = [
    # ── 페르소나 1. 트렌드세터 수빈 ──
    {
        "key": "trendsetter_subin",
        "name": "트렌드세터 수빈 (27세)",
        "target_age": "20대 후반",
        "style_keywords": [
            "인스타 감성",
            "K-뷰티 인디 브랜드",
            "나이아신아마이드",
            "레티놀",
            "트렌디",
            "성수동 바이브",
            "클린뷰티",
            "모공·톤업",
        ],
        "prompt_template": (
            "A trendy, Instagram-native beauty promotional photo targeting a style-savvy "
            "Korean woman in her late 20s (like a Seongsu-dong cafe-hopping IT worker). "
            "Style: K-beauty indie brand aesthetic — bold yet approachable, social-media-optimized. "
            "Lighting: soft ring light glow mixed with warm golden hour tones, slight lens flare. "
            "Composition: dynamic hero product shot with trendy props (terrazzo tray, dried pampas grass, "
            "minimalist Korean ceramic). Close-up angles that feel like an Instagram flat-lay. "
            "Mood: effortlessly cool, authentic, not over-produced — she hates exaggerated ads. "
            "Color palette: soft lavender, muted coral, warm beige, touches of sage green. "
            "Background: clean textured surface (concrete, linen) or soft gradient. "
            "Text tone: friendly and trendy, conversational Korean — like a friend recommending a product. "
            "{analysis_context} "
            "{style_directive} "
            "{text_instruction}"
        ),
    },
    # ── 페르소나 2. 성분 분석가 지현 ──
    {
        "key": "ingredient_analyst_jihyun",
        "name": "성분 분석가 지현 (32세)",
        "target_age": "30대 초반",
        "style_keywords": [
            "전성분 분석",
            "더마코스메틱",
            "민감성 피부",
            "비건·클린뷰티",
            "무향료·무알코올",
            "임상 데이터",
            "피부과 테스트",
            "홍조·트러블",
        ],
        "prompt_template": (
            "A clinical, evidence-based beauty promotional photo targeting an ingredient-conscious "
            "Korean woman in her early 30s (freelance designer who reads full INCI lists before buying). "
            "Style: dermatological / clinical beauty — clean, scientific, trustworthy. "
            "Lighting: bright, even studio lighting that shows true product color and texture, "
            "medical-grade clarity with soft diffusion. "
            "Composition: product centered on sterile white or light gray surface, "
            "surrounded by scientific visual cues (molecular structure graphics subtly in background, "
            "pipette dropping serum, clinical test tube accents). Minimalist and precise layout. "
            "Mood: evidence-based trust, dermatologist-approved calm, ingredient transparency. "
            "Color palette: clinical white, soft blue-gray, pale mint, touches of medical teal. "
            "Background: clean matte white or subtle laboratory-inspired setting. "
            "Text tone: professional, data-driven — include certification badges "
            "(vegan, fragrance-free, clinically tested). No influencer hype. "
            "{analysis_context} "
            "{style_directive} "
            "{text_instruction}"
        ),
    },
    # ── 페르소나 3. 올영 입문생 하은 ──
    {
        "key": "beginner_haeun",
        "name": "올영 입문생 하은 (19세)",
        "target_age": "10대 후반~20대 초반",
        "style_keywords": [
            "뷰티 초보",
            "가성비",
            "1+1 이벤트",
            "올영세일",
            "틱톡 감성",
            "베스트셀러",
            "여드름·모공",
            "친구 추천",
        ],
        "prompt_template": (
            "A fun, approachable beauty promotional photo targeting a Korean college freshman (19) "
            "who is just starting her skincare journey on a student budget. "
            "Style: TikTok / YouTube Shorts aesthetic — bright, playful, slightly maximalist, "
            "eye-catching within 2 seconds of scrolling. "
            "Lighting: bright pop lighting, vivid and saturated, cheerful daylight feeling. "
            "Composition: product front-and-center with fun, youthful props (colorful gummy bears, "
            "pastel stationery, sparkly stickers, bubble textures). Product surrounded by "
            "'best seller #1' badge vibes. Simple and easy to understand at a glance. "
            "Mood: fun and affordable, 'my first skincare haul', peer-recommended energy. "
            "Color palette: bright sky blue, bubblegum pink, sunny yellow, fresh mint. "
            "Background: colorful pop gradient or fun patterned surface. "
            "Text tone: playful, easy Korean — like a friend explaining skincare basics. "
            "Emphasize value (1+1, sale price) and bestseller ranking. "
            "{analysis_context} "
            "{style_directive} "
            "{text_instruction}"
        ),
    },
    # ── 페르소나 4. 워킹맘 은지 ──
    {
        "key": "workingmom_eunji",
        "name": "워킹맘 은지 (37세)",
        "target_age": "30대 중후반",
        "style_keywords": [
            "올인원",
            "간편 루틴",
            "무향",
            "시간 절약",
            "멀티 기능",
            "저자극",
            "보습·주름·탄력",
            "새벽 배송",
        ],
        "prompt_template": (
            "A clean, efficient beauty promotional photo targeting a time-poor Korean working mom "
            "in her late 30s (office worker + mom of a 5-year-old who needs her routine under 5 minutes). "
            "Style: practical luxury — not flashy but refined, 'one product does it all' energy. "
            "Lighting: soft warm morning light, natural window glow suggesting a quick morning routine. "
            "Composition: single hero product (all-in-one cream, multi-balm) on a clean bathroom shelf "
            "or bedside table. Minimal props — maybe a soft towel, a simple clock showing early morning. "
            "Everything conveys speed and simplicity. No clutter. "
            "Mood: calm efficiency, 'fragrance-free and safe around kids', reliable daily essential. "
            "Color palette: warm ivory, soft taupe, gentle peach, clean white. "
            "Background: minimal bathroom or vanity setting with warm tones. "
            "Text tone: direct and concise — get to the point fast. Under 200 characters. "
            "Key selling points: multi-function, fragrance-free, time-saving. "
            "{analysis_context} "
            "{style_directive} "
            "{text_instruction}"
        ),
    },
    # ── 페르소나 5. 헬스 브로 민준 ──
    {
        "key": "healthbro_minjun",
        "name": "헬스 브로 민준 (28세)",
        "target_age": "20대 후반",
        "style_keywords": [
            "남성 그루밍",
            "탈모 예방",
            "두피 쿨링",
            "올인원 로션",
            "바디워시",
            "헬스·운동",
            "기능적",
            "가성비",
        ],
        "prompt_template": (
            "A masculine, functional beauty/grooming promotional photo targeting a fitness-focused "
            "Korean man in his late 20s (IT developer who hits the gym 5x/week and is starting "
            "to care about scalp health and grooming). "
            "Style: men's grooming — clean, athletic, no-nonsense product photography. "
            "Lighting: crisp directional studio light with subtle contrast, cool-toned, "
            "slightly dramatic shadow for a sporty edge. "
            "Composition: product (shampoo, body wash, all-in-one lotion) on dark slate or "
            "matte concrete surface. Minimal props — perhaps a gym towel, water droplets "
            "suggesting post-workout freshness. Strong, simple product hero shot. "
            "Mood: functional, effective, 'just tell me what it does' — no cutesy vibes. "
            "Color palette: charcoal, deep navy, cool mint, steel gray, matte black. "
            "Background: dark matte or textured concrete, gym-locker-room-adjacent aesthetic. "
            "Text tone: factual and direct — state benefits plainly. "
            "No patronizing 'men should also care about skincare~' messaging. "
            "{analysis_context} "
            "{style_directive} "
            "{text_instruction}"
        ),
    },
    # ── 페르소나 6. 선물 요정 소연 ──
    {
        "key": "giftfairy_soyeon",
        "name": "선물 요정 소연 (24세)",
        "target_age": "20대 초중반",
        "style_keywords": [
            "선물 추천",
            "기프트 세트",
            "예쁜 포장",
            "향 좋은",
            "감성적",
            "생일·기념일",
            "3만원대 세트",
            "시즌 한정",
        ],
        "prompt_template": (
            "A warm, gift-oriented beauty promotional photo targeting a Korean grad student (24) "
            "who loves buying beautifully packaged Olive Young gift sets for friends' birthdays. "
            "Style: gift editorial — beautiful unboxing moment, premium-looking yet affordable. "
            "Lighting: warm soft golden light, cozy and inviting, slight bokeh for dreamy feel. "
            "Composition: gift set beautifully arranged — open box with tissue paper, ribbon, "
            "multiple mini products peeking out. Props: greeting card, dried flowers, "
            "wrapping paper, small sparkly ornaments. Styled like an 'aesthetic gift haul' post. "
            "Mood: heartwarming generosity, 'look how pretty this set is', perfect for sharing. "
            "Color palette: rose gold, blush pink, soft cream, warm champagne, dusty lilac. "
            "Background: soft fabric draped surface (satin, linen) or cozy cafe table setting. "
            "Text tone: warm and emotional — emphasize the joy of gifting, beautiful packaging, "
            "and good value for the price range (2-4만원). "
            "{analysis_context} "
            "{style_directive} "
            "{text_instruction}"
        ),
    },
    # ── 페르소나 7. 안티에이징 전사 미영 ──
    {
        "key": "antiaging_miyoung",
        "name": "안티에이징 전사 미영 (43세)",
        "target_age": "40대 초중반",
        "style_keywords": [
            "레티놀",
            "콜라겐 부스팅",
            "탄력 집중",
            "주름 개선 기능성",
            "프리미엄 더마",
            "이너뷰티",
            "건강한 광채",
            "합리적 럭셔리",
        ],
        "prompt_template": (
            "A premium, confidence-inspiring beauty promotional photo targeting a Korean "
            "professional woman in her early 40s (team manager rediscovering self-care, "
            "who compares department store brands with Olive Young derma alternatives). "
            "Style: 'accessible luxury' — department-store-quality visual at Olive Young price point. "
            "Lighting: soft beauty lighting with a gentle glow effect suggesting healthy radiance, "
            "warm studio strobe with beauty dish, subtle rim light on product. "
            "Composition: elegant product arrangement on a sophisticated surface (marble tray, "
            "smoked glass, soft velvet). Accents: gold cap details, serum droplet catching light, "
            "collagen-inspired visual elements (bouncy gel texture, dewy surfaces). "
            "Mood: confident radiance, proven efficacy, timeless beauty — NOT age-shaming. "
            "Frame it as 'healthy skin glow' rather than 'fighting aging'. "
            "Color palette: champagne gold, warm rosewood, cream, deep plum accents, pearl white. "
            "Background: warm neutral studio or soft-focus elegant vanity setting. "
            "Text tone: professional and trustworthy but not cold — confident expertise. "
            "Highlight efficacy claims (retinol concentration, clinical results) without exaggeration. "
            "{analysis_context} "
            "{style_directive} "
            "{text_instruction}"
        ),
    },
    # ── 페르소나 8. 건강 투자자 정숙 ──
    {
        "key": "health_investor_jungsook",
        "name": "건강 투자자 정숙 (52세)",
        "target_age": "50대 초반",
        "style_keywords": [
            "건강기능식품",
            "갱년기 건강",
            "콜라겐",
            "식약처 인증",
            "주름 개선 기능성",
            "고함량",
            "전문가 추천",
            "한방 프리미엄",
        ],
        "prompt_template": (
            "A trustworthy, health-focused beauty and supplement promotional photo targeting "
            "a Korean woman in her early 50s (government office team lead whose children left for "
            "college, now investing in her own health with supplements and functional skincare). "
            "Style: health & wellness authority — clean, reassuring, professional medical-lifestyle hybrid. "
            "Lighting: bright, warm, and even — soft daylight that conveys purity and trust. "
            "No dramatic shadows. Gentle and inviting. "
            "Composition: product (functional skincare or health supplement) prominently displayed "
            "with trust signals — certification badge areas, natural ingredient accents "
            "(ginseng root, collagen powder, vitamin capsules). Clean layout with generous white space. "
            "Props suggesting healthy lifestyle: yoga mat corner, morning tea, fresh fruit. "
            "Mood: reliable health investment, expert-endorsed, premium Korean herbal tradition. "
            "Color palette: warm cream, forest green, deep burgundy, gold accents, natural wood tones. "
            "Background: bright clean surface with natural elements, or traditional Korean aesthetic touches. "
            "Text tone: respectful and authoritative — no trendy slang or memes. "
            "Emphasize certifications (MFDS/식약처), clinical evidence, high-dosage claims. "
            "{analysis_context} "
            "{style_directive} "
            "{text_instruction}"
        ),
    },
]
