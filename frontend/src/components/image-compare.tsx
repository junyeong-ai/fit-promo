"use client";

import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";

interface ImageCompareProps {
  originalSrc: string | null;
  generatedSrc: string;
  rationale?: string | null;
  adaptedText?: string | null;
}

export function ImageCompare({
  originalSrc,
  generatedSrc,
  rationale,
  adaptedText,
}: ImageCompareProps) {
  const [position, setPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const updatePosition = useCallback((clientX: number) => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const x = clientX - rect.left;
    const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setPosition(pct);
  }, []);

  const handleMouseDown = useCallback(() => {
    dragging.current = true;
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!dragging.current) return;
      updatePosition(e.clientX);
    },
    [updatePosition]
  );

  const handleMouseUp = useCallback(() => {
    dragging.current = false;
  }, []);

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      updatePosition(e.touches[0].clientX);
    },
    [updatePosition]
  );

  const showSlider = !!originalSrc;

  return (
    <div className="space-y-4">
      {showSlider ? (
        /* Slider comparison mode */
        <div
          ref={containerRef}
          className="relative w-full overflow-hidden rounded-xl select-none aspect-video bg-muted"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchMove={handleTouchMove}
        >
          <img
            src={generatedSrc}
            alt="Generated"
            className="absolute inset-0 h-full w-full object-cover"
            draggable={false}
          />
          <div
            className="absolute inset-0 overflow-hidden"
            style={{ width: `${position}%` }}
          >
            <img
              src={originalSrc}
              alt="Original"
              className="h-full object-cover"
              style={{ width: containerRef.current?.offsetWidth || "100%" }}
              draggable={false}
            />
          </div>

          {/* Handle */}
          <div
            className="absolute top-0 bottom-0 w-0.5 cursor-col-resize bg-white/80"
            style={{ left: `${position}%`, transform: "translateX(-50%)" }}
            onMouseDown={handleMouseDown}
            onTouchStart={handleMouseDown}
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-8 rounded-full bg-white/90 shadow-lg flex items-center justify-center backdrop-blur-sm">
              <svg
                width="14"
                height="14"
                viewBox="0 0 16 16"
                fill="none"
                className="text-zinc-700"
              >
                <path
                  d="M4 8H12M4 8L6 6M4 8L6 10M12 8L10 6M12 8L10 10"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>

          {/* Labels */}
          <div className="absolute top-2.5 left-2.5 rounded-md bg-black/50 backdrop-blur-sm px-2 py-1 text-[11px] text-white font-medium">
            Original
          </div>
          <div className="absolute top-2.5 right-2.5 rounded-md bg-black/50 backdrop-blur-sm px-2 py-1 text-[11px] text-white font-medium">
            Generated
          </div>
        </div>
      ) : (
        /* Single image mode — no original */
        <div className="relative w-full overflow-hidden rounded-xl aspect-video bg-muted">
          <img
            src={generatedSrc}
            alt="Generated"
            className="h-full w-full object-cover"
          />
          <div className="absolute top-2.5 right-2.5 rounded-md bg-black/50 backdrop-blur-sm px-2 py-1 text-[11px] text-white font-medium">
            Generated
          </div>
        </div>
      )}

      {/* Adapted text — target-specific copy rendered in the image */}
      {adaptedText && (
        <div className="px-3.5 py-2.5 rounded-lg bg-muted/40 border border-border/30">
          <div className="text-[11px] text-muted-foreground font-medium tracking-wide mb-1">
            타겟 맞춤 텍스트
          </div>
          <p className="text-sm leading-relaxed">{adaptedText}</p>
          <p className="text-[10px] text-muted-foreground mt-1.5">
            * 원본 이미지의 텍스트를 타겟에 맞게 변환하여 이미지에 반영했습니다.
          </p>
        </div>
      )}

      {/* Rationale */}
      {rationale && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className="px-3.5 py-3 rounded-lg bg-muted/40 border border-border/30"
        >
          <div className="text-[11px] text-muted-foreground font-medium tracking-wide mb-1.5">
            변환 근거
          </div>
          <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">
            {rationale}
          </p>
        </motion.div>
      )}
    </div>
  );
}
