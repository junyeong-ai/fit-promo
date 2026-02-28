"use client";

import { cn } from "@/lib/utils";

interface ModeButtonProps {
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}

export function ModeButton({ active, onClick, children, className }: ModeButtonProps) {
  return (
    <button
      type="button"
      onPointerDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={cn(
        "h-7 px-3 text-xs rounded-md transition-colors flex items-center gap-1.5 select-none",
        active
          ? "bg-background text-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground hover:bg-background/50",
        className
      )}
    >
      {children}
    </button>
  );
}
