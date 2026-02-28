"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import type { Target } from "@/lib/types";

interface TargetSelectorProps {
  targets: Target[];
  selected: number[];
  onToggle: (id: number) => void;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
};

export function TargetSelector({
  targets,
  selected,
  onToggle,
}: TargetSelectorProps) {
  return (
    <motion.div
      className="grid grid-cols-2 gap-3 md:grid-cols-4"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {targets.map((target) => {
        const isSelected = selected.includes(target.id);
        let keywords: string[] = [];
        try {
          keywords = JSON.parse(target.style_keywords);
        } catch {
          keywords = [];
        }

        return (
          <motion.button
            key={target.id}
            type="button"
            variants={item}
            onClick={() => onToggle(target.id)}
            className={`
              relative text-left rounded-xl border px-3.5 py-3
              transition-all duration-200 cursor-pointer
              ${isSelected
                ? "border-primary/60 bg-primary/5 ring-1 ring-primary/30"
                : "border-border/40 bg-card/40 hover:border-muted-foreground/30 hover:bg-card/60"
              }
            `}
          >
            {/* Check indicator */}
            {isSelected && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-2 right-2 size-5 rounded-full bg-primary flex items-center justify-center"
              >
                <Check className="size-3 text-primary-foreground" />
              </motion.div>
            )}

            <div className="space-y-2">
              <div>
                <p className="text-sm font-medium leading-tight">{target.name}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {target.target_age}
                </p>
              </div>
              <div className="flex flex-wrap gap-1">
                {keywords.slice(0, 3).map((kw, i) => (
                  <span
                    key={i}
                    className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground"
                  >
                    {kw}
                  </span>
                ))}
                {keywords.length > 3 && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                    +{keywords.length - 3}
                  </span>
                )}
              </div>
            </div>
          </motion.button>
        );
      })}
    </motion.div>
  );
}
