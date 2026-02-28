"use client";

import { motion } from "framer-motion";

interface PromotionPromptInputProps {
  value: string;
  onChange: (value: string) => void;
}

const EXAMPLE_CHIPS = [
  "봄 시즌 런칭 프로모션",
  "여름 세일 50% 할인",
  "성분 강조 신제품 소개",
  "홀리데이 기프트 세트",
];

export function PromotionPromptInput({
  value,
  onChange,
}: PromotionPromptInputProps) {
  return (
    <div className="space-y-3">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="프로모션 이미지에 대한 설명을 입력하세요. 예: '봄 시즌 비타민C 세럼 런칭 프로모션, 밝고 화사한 분위기'"
        className="w-full rounded-lg border border-border/60 bg-background px-3 py-2.5 text-sm resize-none h-24 focus:outline-none focus:ring-1 focus:ring-primary/40 placeholder:text-muted-foreground/50"
      />
      <div className="flex flex-wrap gap-1.5">
        {EXAMPLE_CHIPS.map((chip) => (
          <motion.button
            key={chip}
            type="button"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onChange(value ? `${value}, ${chip}` : chip)}
            className="rounded-full border border-border/50 bg-muted/30 px-2.5 py-1 text-[11px] text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-colors"
          >
            {chip}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
