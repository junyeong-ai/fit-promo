"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Upload } from "lucide-react";

interface ImageUploadProps {
  onUpload: (file: File) => void;
  uploading?: boolean;
}

export function ImageUpload({ onUpload, uploading }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) return;
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreview(url);
      onUpload(file);
    },
    [onUpload]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (uploading) return;

      const target = e.target as HTMLElement;
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target.isContentEditable
      ) {
        return;
      }

      const items = e.clipboardData?.items;
      if (!items) return;

      for (const item of items) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file) {
            e.preventDefault();
            handleFile(file);
          }
          return;
        }
      }
    };

    document.addEventListener("paste", handlePaste);
    return () => document.removeEventListener("paste", handlePaste);
  }, [uploading, handleFile]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={() => !preview && inputRef.current?.click()}
      className={`
        relative w-full rounded-xl border border-dashed
        flex flex-col items-center justify-center cursor-pointer
        transition-all duration-200 min-h-[200px]
        ${dragOver
          ? "border-primary bg-primary/5 scale-[1.01]"
          : preview
            ? "border-border/40 bg-card/40"
            : "border-border/60 bg-card/30 hover:border-muted-foreground/40 hover:bg-card/50"
        }
        ${uploading ? "pointer-events-none" : ""}
      `}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleInputChange}
      />

      {preview ? (
        <div className="flex flex-col items-center gap-3 p-6">
          <img
            src={preview}
            alt="Preview"
            className="max-h-52 rounded-lg object-contain"
          />
          {selectedFile && (
            <p className="text-xs text-muted-foreground">
              {selectedFile.name} ({formatSize(selectedFile.size)})
            </p>
          )}
          {uploading && (
            <div className="flex items-center gap-2">
              <div className="relative w-4 h-4">
                <div className="absolute inset-0 border-2 border-muted rounded-full" />
                <div className="absolute inset-0 border-2 border-transparent border-t-primary rounded-full animate-spin" />
              </div>
              <p className="text-xs text-muted-foreground">업로드 중...</p>
            </div>
          )}
        </div>
      ) : (
        <motion.div
          className="flex flex-col items-center gap-3 py-10"
          animate={dragOver ? { y: -4 } : { y: 0 }}
          transition={{ duration: 0.15 }}
        >
          <Upload className="size-8 text-muted-foreground/50" />
          <div className="text-center">
            <p className="text-sm font-medium text-foreground/80">
              참고 이미지를 드래그하여 업로드 (선택사항)
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              또는 클릭 / 붙여넣기(Ctrl+V)
            </p>
            <p className="text-[10px] text-muted-foreground/60 mt-1.5">
              참고 이미지가 있으면 스타일을 분석하여 더 정확한 결과를 생성합니다
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
