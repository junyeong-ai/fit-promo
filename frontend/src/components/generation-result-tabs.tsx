"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ImageCompare } from "@/components/image-compare";
import { getImageUrl } from "@/lib/api";
import type { GenerationResult, ImageFile } from "@/lib/types";

/* ── Witty loading messages ── */
const PHASE_MESSAGES: Record<string, string[]> = {
  preparing: [
    "AI 크루를 소집하는 중...",
    "크리에이티브 엔진 예열 중...",
    "프로모션 브리프를 읽는 중...",
  ],
  analyzing: [
    "이미지를 꼼꼼히 분석하는 중...",
    "브랜드 DNA를 해독하는 중...",
    "색감과 무드를 파악하는 중...",
    "최적의 구도를 설계하는 중...",
  ],
  generating: [
    "AI가 붓을 들었어요...",
    "색감을 조율하는 중...",
    "뷰티 감성을 불어넣는 중...",
    "완벽한 구도를 찾는 중...",
    "조명을 조절하고 있어요...",
    "최고의 한 컷을 고르는 중...",
    "배경을 다듬는 중...",
    "브랜드 무드를 입히는 중...",
    "마무리 터치 중...",
    "거의 다 왔어요, 조금만...",
  ],
};

function getPhaseMessages(status: string | undefined): string[] {
  if (!status) return PHASE_MESSAGES.preparing;
  if (status === "pending") return PHASE_MESSAGES.preparing;
  if (status === "analyzing") return PHASE_MESSAGES.analyzing;
  return PHASE_MESSAGES.generating;
}

/* ── Elapsed timer ── */
function ElapsedTimer({ startTime }: { startTime: number }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;

  return (
    <span className="font-mono text-xs tabular-nums text-muted-foreground/70">
      {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
    </span>
  );
}

/* ── In-tab loading panel ── */
function TabLoadingPanel({
  status,
  startTime,
  completedCount,
  totalCount,
}: {
  status: string | undefined;
  startTime: number;
  completedCount: number;
  totalCount: number;
}) {
  const messages = getPhaseMessages(status);
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    setMsgIndex(0);
  }, [status]);

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % messages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [messages]);

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
            key={`${status}-${msgIndex}`}
            className="text-sm font-medium text-foreground/80 text-center"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            {messages[msgIndex]}
          </motion.p>
        </AnimatePresence>

        {/* Timer + progress counter */}
        <div className="flex items-center gap-3">
          <ElapsedTimer startTime={startTime} />
          {totalCount > 1 && (
            <>
              <div className="h-3 w-px bg-border/40" />
              <span className="text-xs text-muted-foreground/70">
                {completedCount}/{totalCount} 완료
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Main component ── */
interface GenerationResultTabsProps {
  results: GenerationResult[];
  sourceImage: ImageFile | null;
  generationStatus?: string;
  mode?: string;
}

export function GenerationResultTabs({
  results,
  sourceImage,
  generationStatus,
  mode,
}: GenerationResultTabsProps) {
  const [activeTab, setActiveTab] = useState(0);
  const startTimeRef = useRef(Date.now());

  const isActive =
    generationStatus !== "completed" && generationStatus !== "failed";

  const completedCount = results.filter(
    (r) => r.status === "completed" || r.status === "failed"
  ).length;
  const totalCount = results.length;

  // Show loading panel when active and no results yet
  if (isActive && results.length === 0) {
    return (
      <TabLoadingPanel
        status={generationStatus}
        startTime={startTimeRef.current}
        completedCount={0}
        totalCount={0}
      />
    );
  }

  if (results.length === 0) return null;

  return (
    <div className="space-y-4">
      {/* Tab buttons */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
        {results.map((result, idx) => {
          const isTabActive = idx === activeTab;
          return (
            <button
              key={result.id}
              type="button"
              onClick={() => setActiveTab(idx)}
              className={`shrink-0 flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isTabActive
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/40 text-muted-foreground hover:bg-muted/60"
              }`}
            >
              <span
                className={`size-2 rounded-full shrink-0 ${
                  result.status === "completed"
                    ? "bg-green-500"
                    : result.status === "failed"
                    ? "bg-red-500"
                    : "bg-blue-500 animate-pulse"
                }`}
              />
              {result.target?.name ?? `Target ${result.target_id}`}
              {result.status === "completed" && (
                <svg
                  className="size-3.5 text-green-400"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab panels — all rendered, only active visible (preserves image DOM) */}
      {results.map((result, idx) => (
        <div
          key={result.id}
          className={idx !== activeTab ? "hidden" : undefined}
        >
          {result.status === "completed" && result.stored_path ? (
            <ImageCompare
              originalSrc={
                sourceImage ? getImageUrl(sourceImage.stored_path) : null
              }
              generatedSrc={getImageUrl(result.stored_path)}
              rationale={result.rationale}
              adaptedText={result.adapted_text}
            />
          ) : result.status === "failed" ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center">
              <p className="text-sm font-medium text-destructive mb-1">
                생성 실패
              </p>
              <p className="text-xs text-muted-foreground">
                {result.error || "알 수 없는 오류가 발생했습니다."}
              </p>
            </div>
          ) : (
            <TabLoadingPanel
              status={generationStatus}
              startTime={startTimeRef.current}
              completedCount={completedCount}
              totalCount={totalCount}
            />
          )}
        </div>
      ))}
    </div>
  );
}
