"use client";

import { motion } from "framer-motion";
import { User, Box, Leaf, Home, Hexagon } from "lucide-react";
import type { DesignStyle } from "@/lib/types";

interface DesignStyleSelectorProps {
  value: DesignStyle;
  onChange: (value: DesignStyle) => void;
}

const STYLES: {
  key: DesignStyle;
  label: string;
  description: string;
  icon: typeof User;
}[] = [
  {
    key: "person_centered",
    label: "AI 인물 중심",
    description: "모델이 상품을 사용하는 뷰티 화보 스타일",
    icon: User,
  },
  {
    key: "product_centered",
    label: "상품 중심",
    description: "제품이 히어로, 드라마틱 조명",
    icon: Box,
  },
  {
    key: "ingredient_focused",
    label: "성분 강조",
    description: "핵심 성분 오브제 배치",
    icon: Leaf,
  },
  {
    key: "lifestyle",
    label: "라이프스타일",
    description: "실생활 공간에 자연스럽게 배치",
    icon: Home,
  },
  {
    key: "minimal_graphic",
    label: "미니멀 그래픽",
    description: "플랫 레이, 기하학 포스터 스타일",
    icon: Hexagon,
  },
];

export function DesignStyleSelector({
  value,
  onChange,
}: DesignStyleSelectorProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
      {STYLES.map((style, i) => {
        const selected = value === style.key;
        const Icon = style.icon;
        return (
          <motion.button
            key={style.key}
            type="button"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04, duration: 0.2 }}
            onClick={() => onChange(style.key)}
            className={`
              relative flex flex-col items-center gap-1.5 rounded-xl border p-3 text-center
              transition-all duration-200 cursor-pointer
              ${
                selected
                  ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                  : "border-border/50 bg-card/30 hover:border-muted-foreground/40 hover:bg-card/50"
              }
            `}
          >
            <Icon
              className={`size-5 ${
                selected ? "text-primary" : "text-muted-foreground"
              }`}
            />
            <span
              className={`text-xs font-medium ${
                selected ? "text-foreground" : "text-foreground/80"
              }`}
            >
              {style.label}
            </span>
            <span className="text-[10px] text-muted-foreground leading-tight">
              {style.description}
            </span>
            {selected && (
              <motion.div
                layoutId="style-selected"
                className="absolute -top-px -right-px size-4 rounded-bl-lg rounded-tr-xl bg-primary flex items-center justify-center"
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
              >
                <svg
                  width="8"
                  height="8"
                  viewBox="0 0 12 12"
                  fill="none"
                  className="text-primary-foreground"
                >
                  <path
                    d="M2 6L5 9L10 3"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </motion.div>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
