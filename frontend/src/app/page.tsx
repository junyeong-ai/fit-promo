"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ImageUpload } from "@/components/image-upload";
import { TargetSelector } from "@/components/target-selector";
import { GenerationResultView } from "@/components/generation-result-view";
import { TargetManagerInline } from "@/components/target-manager-inline";
import { ProductInfoForm } from "@/components/product-info-form";
import { PromotionPromptInput } from "@/components/promotion-prompt-input";
import { DesignStyleSelector } from "@/components/design-style-selector";
import { usePolling } from "@/hooks/use-polling";
import {
  uploadImage,
  getTargets,
  createGeneration,
  getGeneration,
  getImageUrl,
} from "@/lib/api";
import type {
  ImageFile,
  Target,
  Product,
  Generation,
  DesignStyle,
} from "@/lib/types";
import { toast } from "sonner";

type ViewMode = "form" | "result";

export default function HomePage() {
  const [view, setView] = useState<ViewMode>("form");
  const [promotionPrompt, setPromotionPrompt] = useState("");
  const [designStyle, setDesignStyle] = useState<DesignStyle>("product_centered");
  const [uploading, setUploading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<ImageFile | null>(null);
  const [targets, setTargets] = useState<Target[]>([]);
  const [selectedTargets, setSelectedTargets] = useState<number[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [generating, setGenerating] = useState(false);
  const [generation, setGeneration] = useState<Generation | null>(null);

  const isActive =
    generation &&
    generation.status !== "completed" &&
    generation.status !== "failed";

  const canGenerate =
    (promotionPrompt.trim() || uploadedImage) && selectedTargets.length > 0;

  const [targetsLoading, setTargetsLoading] = useState(true);

  const loadTargets = useCallback(async () => {
    setTargetsLoading(true);
    try {
      const t = await getTargets();
      setTargets(t);
    } catch (e) {
      console.error("Failed to load targets:", e);
      toast.error("타겟 로드 실패 — 새로고침해 주세요");
    } finally {
      setTargetsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTargets();
  }, [loadTargets]);

  // Browser back navigation support
  const switchToResult = useCallback(() => {
    setView("result");
    window.history.pushState({ view: "result" }, "");
  }, []);

  const switchToForm = useCallback(() => {
    setView("form");
  }, []);

  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      if (view === "result") {
        setView("form");
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [view]);

  const pollingFetcher = useCallback(async () => {
    if (!generation) return null;
    return getGeneration(generation.id);
  }, [generation]);

  const { data: polledGeneration } = usePolling<Generation | null>(
    pollingFetcher,
    3000,
    !!isActive
  );

  useEffect(() => {
    if (polledGeneration) setGeneration(polledGeneration);
  }, [polledGeneration]);

  const handleUpload = useCallback(async (file: File) => {
    setUploading(true);
    try {
      const img = await uploadImage(file);
      setUploadedImage(img);
      setGeneration(null);
      setSelectedTargets([]);
      toast.success("이미지 업로드 완료");
    } catch {
      toast.error("이미지 업로드 실패");
    } finally {
      setUploading(false);
    }
  }, []);

  const handleToggleTarget = (id: number) => {
    setSelectedTargets((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handleGenerate = async () => {
    if (!canGenerate) return;
    setGenerating(true);
    // Immediately switch to result view — don't wait for API
    switchToResult();
    try {
      const gen = await createGeneration({
        source_image_id: uploadedImage?.id,
        target_ids: selectedTargets,
        product_ids: selectedProducts.length > 0 ? selectedProducts.map((p) => p.id) : undefined,
        promotion_prompt: promotionPrompt.trim() || undefined,
        design_style: designStyle,
      });
      setGeneration(gen);
    } catch {
      toast.error("생성 실패");
      // Go back to form on failure
      setView("form");
    } finally {
      setGenerating(false);
    }
  };

  const handleReset = () => {
    setUploadedImage(null);
    setGeneration(null);
    setSelectedTargets([]);
    setSelectedProducts([]);
    setPromotionPrompt("");
    setDesignStyle("product_centered");
    setView("form");
  };

  const handleBackToForm = useCallback(() => {
    // Navigate back via history if we pushed state, otherwise just switch
    if (window.history.state?.view === "result") {
      window.history.back();
    } else {
      setView("form");
    }
  }, []);

  const promptSummary =
    promotionPrompt.trim() ||
    (uploadedImage ? `참고 이미지: ${uploadedImage.filename}` : "이미지 생성");

  // Result view — show even before generation data arrives (generating === true)
  if (view === "result") {
    return (
      <GenerationResultView
        generation={generation}
        sourceImage={uploadedImage}
        promptSummary={promptSummary}
        onBack={handleBackToForm}
        onNewGeneration={handleReset}
        selectedTargets={targets.filter((t) => selectedTargets.includes(t.id))}
      />
    );
  }

  // Form view
  return (
    <div className="space-y-6">
      {/* Target Manager */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <TargetManagerInline onUpdated={loadTargets} />
      </motion.div>

      {/* Step 1: Promotion Prompt */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.04 }}
      >
        <div className="rounded-xl border border-border/60 bg-card/60 p-5 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="text-[11px] text-muted-foreground font-medium tracking-wide uppercase">
              Step 1
            </div>
            <span className="text-sm font-medium">프로모션 설명</span>
            <span className="text-[10px] text-muted-foreground/60">
              참고 이미지가 없으면 필수
            </span>
          </div>
          <PromotionPromptInput
            value={promotionPrompt}
            onChange={setPromotionPrompt}
          />
        </div>
      </motion.div>

      {/* Step 2: Product Info (optional) */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.08 }}
      >
        <ProductInfoForm
          onProductsChanged={setSelectedProducts}
          onSkip={() => setSelectedProducts([])}
          selectedProducts={selectedProducts}
        />
      </motion.div>

      {/* Step 3: Design Style */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.12 }}
      >
        <div className="rounded-xl border border-border/60 bg-card/60 p-5 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="text-[11px] text-muted-foreground font-medium tracking-wide uppercase">
              Step 3
            </div>
            <span className="text-sm font-medium">디자인 스타일</span>
            <span className="text-[10px] text-muted-foreground/60">
              선택사항
            </span>
          </div>
          <DesignStyleSelector value={designStyle} onChange={setDesignStyle} />
        </div>
      </motion.div>

      {/* Step 4: Reference Image (optional) */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.16 }}
      >
        <div className="rounded-xl border border-border/60 bg-card/60 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="text-[11px] text-muted-foreground font-medium tracking-wide uppercase">
                Step 4
              </div>
              <span className="text-sm font-medium">
                참고 이미지 업로드
              </span>
              <span className="text-[10px] text-muted-foreground/60">
                선택사항
              </span>
            </div>
            {uploadedImage && (
              <button
                onClick={() => setUploadedImage(null)}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                제거
              </button>
            )}
          </div>

          <AnimatePresence mode="wait">
            {uploadedImage ? (
              <motion.div
                key="uploaded"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-4"
              >
                <img
                  src={getImageUrl(uploadedImage.stored_path)}
                  alt={uploadedImage.filename}
                  className="h-36 rounded-lg object-contain"
                />
                <div>
                  <p className="text-sm font-medium">{uploadedImage.filename}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {(uploadedImage.size_bytes / 1024).toFixed(0)} KB
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="upload"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <ImageUpload onUpload={handleUpload} uploading={uploading} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Step 5: Target Selection + Generate */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <div className="rounded-xl border border-border/60 bg-card/60 p-5 space-y-4">
          <div className="text-[11px] text-muted-foreground font-medium tracking-wide uppercase flex items-center gap-2.5">
            <span>Step 5</span>
            <span className="text-sm font-medium text-foreground normal-case tracking-normal">
              타겟 선택
            </span>
          </div>

          {targetsLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="size-4 border-2 border-muted border-t-primary rounded-full animate-spin" />
                <span className="text-sm">타겟 로딩 중...</span>
              </div>
            </div>
          ) : targets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 gap-3">
              <p className="text-sm text-muted-foreground">
                타겟을 불러올 수 없습니다.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={loadTargets}
                className="text-xs"
              >
                다시 시도
              </Button>
            </div>
          ) : (
            <TargetSelector
              targets={targets}
              selected={selectedTargets}
              onToggle={handleToggleTarget}
            />
          )}

          <Button
            onClick={handleGenerate}
            disabled={generating || !canGenerate || !!isActive}
            className="w-full h-10"
            size="lg"
          >
            {generating
              ? "생성 시작 중..."
              : isActive
              ? "생성 진행 중..."
              : !canGenerate
              ? "프로모션 설명 또는 참고 이미지와 타겟을 선택하세요"
              : `${selectedTargets.length}개 타겟으로 이미지 생성`}
          </Button>
        </div>
      </motion.div>

      {/* Reset button */}
      {(generation || uploadedImage || promotionPrompt) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex justify-center pb-4"
        >
          <button
            onClick={handleReset}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            처음부터 다시 시작
          </button>
        </motion.div>
      )}
    </div>
  );
}
