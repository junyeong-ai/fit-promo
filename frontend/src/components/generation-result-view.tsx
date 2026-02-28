"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { GenerationResultTabs } from "@/components/generation-result-tabs";
import type { Generation, ImageFile, Target } from "@/lib/types";

/* ── Initial loading panel (before generation object arrives) ── */
const INIT_MESSAGES = [
  "AI 크루를 소집하는 중...",
  "크리에이티브 엔진 예열 중...",
  "프로모션 브리프를 읽는 중...",
];

function InitLoadingPanel() {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % INIT_MESSAGES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative rounded-xl border border-border/30 bg-muted/20 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent animate-shimmer" />

      <div className="relative flex flex-col items-center justify-center py-16 px-6 gap-4">
        {/* Bouncing dots */}
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="size-2 rounded-full bg-primary/70"
              animate={{ y: [0, -8, 0] }}
              transition={{
                duration: 0.9,
                repeat: Infinity,
                delay: i * 0.15,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>

        {/* Rotating message */}
        <AnimatePresence mode="wait">
          <motion.p
            key={msgIndex}
            className="text-sm font-medium text-foreground/80 text-center"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            {INIT_MESSAGES[msgIndex]}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ── Main component ── */
interface GenerationResultViewProps {
  generation: Generation | null;
  sourceImage: ImageFile | null;
  promptSummary: string;
  onBack: () => void;
  onNewGeneration: () => void;
  selectedTargets: Target[];
}

export function GenerationResultView({
  generation,
  sourceImage,
  promptSummary,
  onBack,
  onNewGeneration,
}: GenerationResultViewProps) {
  const isFinished =
    generation?.status === "completed" || generation?.status === "failed";

  return (
    <motion.div
      className="space-y-5"
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* Header: back + prompt summary */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="shrink-0 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
          돌아가기
        </button>
        <div className="h-4 w-px bg-border/60" />
        <p className="text-sm text-muted-foreground truncate max-w-md">
          {promptSummary}
        </p>
      </div>

      {/* Results tabs — single source of truth for target navigation + images + loading */}
      <motion.div
        className="rounded-xl border border-border/60 bg-card/60 p-5"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {generation ? (
          <GenerationResultTabs
            results={generation.results}
            sourceImage={sourceImage}
            generationStatus={generation.status}
            mode={generation.mode}
          />
        ) : (
          <InitLoadingPanel />
        )}
      </motion.div>

      {/* Footer actions */}
      {isFinished && (
        <motion.div
          className="flex justify-center pt-2 pb-4"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Button onClick={onNewGeneration} variant="outline" size="lg">
            새로 생성하기
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
}
