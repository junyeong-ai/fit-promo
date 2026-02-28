"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Pencil, Eye, Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { MarkdownPreview } from "@/components/markdown-preview";
import { ModeButton } from "@/components/mode-button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface MarkdownPromptEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
  maxHeight?: string;
  label?: string;
  className?: string;
  defaultMode?: "edit" | "preview";
}

export function MarkdownPromptEditor({
  value,
  onChange,
  placeholder = "프롬프트 템플릿을 입력하세요...",
  minHeight = "160px",
  maxHeight = "320px",
  label,
  className,
  defaultMode = "preview",
}: MarkdownPromptEditorProps) {
  const [mode, setMode] = useState<"edit" | "preview">(defaultMode);
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedMode, setExpandedMode] = useState<"edit" | "preview" | "split">("split");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const expandedTextareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (mode === "edit" && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [mode]);

  useEffect(() => {
    if (isExpanded && (expandedMode === "edit" || expandedMode === "split")) {
      const timer = setTimeout(() => {
        expandedTextareaRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isExpanded, expandedMode]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChange(e.target.value);
    },
    [onChange]
  );

  const handlePreviewClick = () => setMode("edit");

  const handleBlur = () => {
    if (value.trim()) setMode("preview");
  };

  return (
    <>
      <div className={cn("space-y-2", className)}>
        {label && (
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{label}</span>
            <div className="flex items-center gap-1">
              <div className="flex items-center gap-0.5 bg-muted rounded-md p-0.5">
                <ModeButton
                  active={mode === "edit"}
                  onClick={() => setMode("edit")}
                  className="h-6 px-2"
                >
                  <Pencil className="size-3" />
                </ModeButton>
                <ModeButton
                  active={mode === "preview"}
                  onClick={() => setMode("preview")}
                  className="h-6 px-2"
                >
                  <Eye className="size-3" />
                </ModeButton>
              </div>
              <button
                type="button"
                onClick={() => setIsExpanded(true)}
                className="size-6 ml-1 rounded-md flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
              >
                <Maximize2 className="size-3.5" />
              </button>
            </div>
          </div>
        )}

        {!label && (
          <div className="flex items-center justify-end gap-1">
            <div className="flex items-center gap-0.5 bg-muted rounded-md p-0.5">
              <ModeButton
                active={mode === "edit"}
                onClick={() => setMode("edit")}
                className="h-6 px-2"
              >
                <Pencil className="size-3" />
                <span>편집</span>
              </ModeButton>
              <ModeButton
                active={mode === "preview"}
                onClick={() => setMode("preview")}
                className="h-6 px-2"
              >
                <Eye className="size-3" />
                <span>미리보기</span>
              </ModeButton>
            </div>
            <button
              type="button"
              onClick={() => setIsExpanded(true)}
              className="size-6 ml-1 rounded-md flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            >
              <Maximize2 className="size-3.5" />
            </button>
          </div>
        )}

        <div
          className="border rounded-lg overflow-hidden bg-card"
          style={{ minHeight, maxHeight }}
        >
          {mode === "edit" ? (
            <textarea
              ref={textareaRef}
              value={value}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder={placeholder}
              className="w-full h-full p-3 bg-transparent font-mono text-sm resize-none focus:outline-none caret-foreground text-foreground"
              style={{ minHeight, maxHeight }}
              spellCheck={false}
            />
          ) : (
            <div
              className="h-full overflow-y-auto p-3 text-sm cursor-text"
              style={{ minHeight, maxHeight }}
              onClick={handlePreviewClick}
            >
              <MarkdownPreview
                content={value}
                placeholder={placeholder}
              />
            </div>
          )}
        </div>

        <p className="text-[11px] text-muted-foreground">
          <code className="px-1 py-0.5 bg-muted rounded text-primary font-mono">
            {"{analysis_context}"}
          </code>{" "}
          이미지 분석 결과 ·{" "}
          <code className="px-1 py-0.5 bg-muted rounded text-primary font-mono">
            {"{text_instruction}"}
          </code>{" "}
          텍스트 처리 지시
        </p>
      </div>

      {/* Expanded editor dialog */}
      <Dialog open={isExpanded} onOpenChange={setIsExpanded}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-[calc(100%-4rem)] lg:max-w-5xl h-[calc(100vh-4rem)] md:h-[calc(100vh-6rem)] flex flex-col p-0 gap-0" showCloseButton={false}>
          <DialogHeader className="flex flex-row items-center justify-between px-4 py-3 border-b bg-muted/30 shrink-0 space-y-0">
            <DialogTitle className="font-medium text-sm">
              {label || "프롬프트 템플릿 편집"}
            </DialogTitle>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                <ModeButton active={expandedMode === "edit"} onClick={() => setExpandedMode("edit")}>
                  <Pencil className="size-3.5" />
                  편집
                </ModeButton>
                <ModeButton active={expandedMode === "split"} onClick={() => setExpandedMode("split")}>
                  <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="18" height="18" x="3" y="3" rx="2" />
                    <line x1="12" x2="12" y1="3" y2="21" />
                  </svg>
                  분할
                </ModeButton>
                <ModeButton active={expandedMode === "preview"} onClick={() => setExpandedMode("preview")}>
                  <Eye className="size-3.5" />
                  미리보기
                </ModeButton>
              </div>
              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                className="size-8 rounded-md flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
              >
                <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" x2="6" y1="6" y2="18" />
                  <line x1="6" x2="18" y1="6" y2="18" />
                </svg>
              </button>
            </div>
          </DialogHeader>

          <div
            className={cn(
              "flex-1 min-h-0",
              expandedMode === "split" ? "grid grid-cols-2" : ""
            )}
          >
            {(expandedMode === "edit" || expandedMode === "split") && (
              <div
                className={cn(
                  "h-full flex flex-col",
                  expandedMode === "split" && "border-r"
                )}
              >
                <textarea
                  ref={expandedTextareaRef}
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  placeholder={placeholder}
                  className="flex-1 w-full p-4 bg-transparent font-mono text-sm resize-none focus:outline-none caret-foreground text-foreground"
                  spellCheck={false}
                  autoFocus
                />
              </div>
            )}
            {(expandedMode === "preview" || expandedMode === "split") && (
              <div className="h-full overflow-y-auto p-4 cursor-default">
                <MarkdownPreview
                  content={value}
                  placeholder={placeholder}
                />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
