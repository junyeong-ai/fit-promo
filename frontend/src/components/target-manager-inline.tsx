"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, Plus, Trash2, Pencil, X, Check, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { MarkdownPromptEditor } from "@/components/markdown-prompt-editor";
import {
  getTargets,
  createTarget,
  updateTarget,
  deleteTarget,
} from "@/lib/api";
import type { Target } from "@/lib/types";
import { toast } from "sonner";

interface TargetManagerInlineProps {
  onUpdated: () => void;
}

export function TargetManagerInline({ onUpdated }: TargetManagerInlineProps) {
  const [expanded, setExpanded] = useState(false);
  const [targets, setTargets] = useState<Target[]>([]);
  const [editing, setEditing] = useState<Target | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  const [newKey, setNewKey] = useState("");
  const [newName, setNewName] = useState("");
  const [newAge, setNewAge] = useState("");
  const [newKeywords, setNewKeywords] = useState("");
  const [newTemplate, setNewTemplate] = useState("");

  const [editName, setEditName] = useState("");
  const [editAge, setEditAge] = useState("");
  const [editKeywords, setEditKeywords] = useState("");
  const [editTemplate, setEditTemplate] = useState("");

  const load = async () => {
    try {
      const t = await getTargets();
      setTargets(t);
    } catch {
      toast.error("타겟 로드 실패");
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (expanded) load();
  }, [expanded]);

  const handleAdd = async () => {
    if (!newKey.trim() || !newName.trim() || !newTemplate.trim()) {
      toast.error("Key, 이름, 프롬프트 템플릿은 필수입니다");
      return;
    }
    try {
      await createTarget({
        key: newKey.trim(),
        name: newName.trim(),
        target_age: newAge.trim(),
        style_keywords: newKeywords.split(",").map((s) => s.trim()).filter(Boolean),
        prompt_template: newTemplate.trim(),
      });
      toast.success("타겟 추가됨");
      setShowAdd(false);
      setNewKey("");
      setNewName("");
      setNewAge("");
      setNewKeywords("");
      setNewTemplate("");
      await load();
      onUpdated();
    } catch {
      toast.error("타겟 추가 실패");
    }
  };

  const startEdit = (target: Target) => {
    setEditing(target);
    setEditName(target.name);
    setEditAge(target.target_age);
    try {
      setEditKeywords(JSON.parse(target.style_keywords).join(", "));
    } catch {
      setEditKeywords("");
    }
    setEditTemplate(target.prompt_template);
  };

  const handleUpdate = async () => {
    if (!editing) return;
    try {
      await updateTarget(editing.id, {
        name: editName.trim() || undefined,
        target_age: editAge.trim() || undefined,
        style_keywords: editKeywords.split(",").map((s) => s.trim()).filter(Boolean),
        prompt_template: editTemplate.trim() || undefined,
      });
      toast.success("타겟 수정됨");
      setEditing(null);
      await load();
      onUpdated();
    } catch {
      toast.error("타겟 수정 실패");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteTarget(id);
      toast.success("타겟 삭제됨");
      await load();
      onUpdated();
    } catch {
      toast.error("타겟 삭제 실패");
    }
  };

  return (
    <div className="rounded-xl border border-border/60 bg-card/60 overflow-hidden">
      {/* Header - always visible */}
      <button
        type="button"
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2.5">
          <Users className="size-4 text-muted-foreground" />
          <span className="text-sm font-medium">타겟 관리</span>
          <Badge variant="secondary" className="text-[11px] px-1.5 py-0 h-5">
            {targets.length}
          </Badge>
        </div>
        {expanded ? (
          <ChevronUp className="size-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="size-4 text-muted-foreground" />
        )}
      </button>

      {/* Expandable content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3 border-t border-border/40">
              {/* Add button */}
              <div className="flex justify-end pt-3">
                <Button
                  size="sm"
                  variant={showAdd ? "outline" : "default"}
                  onClick={() => setShowAdd(!showAdd)}
                  className="h-7 text-xs gap-1.5"
                >
                  {showAdd ? <X className="size-3" /> : <Plus className="size-3" />}
                  {showAdd ? "취소" : "새 타겟"}
                </Button>
              </div>

              {/* Add form */}
              <AnimatePresence>
                {showAdd && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="rounded-lg border border-dashed border-border/60 bg-muted/20 p-4 space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label className="text-xs">Key (고유 식별자)</Label>
                          <Input
                            value={newKey}
                            onChange={(e) => setNewKey(e.target.value)}
                            placeholder="custom_target"
                            className="h-8 text-sm bg-background"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs">이름</Label>
                          <Input
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            placeholder="커스텀 타겟"
                            className="h-8 text-sm bg-background"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label className="text-xs">타겟 연령</Label>
                          <Input
                            value={newAge}
                            onChange={(e) => setNewAge(e.target.value)}
                            placeholder="20-30"
                            className="h-8 text-sm bg-background"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs">스타일 키워드 (쉼표 구분)</Label>
                          <Input
                            value={newKeywords}
                            onChange={(e) => setNewKeywords(e.target.value)}
                            placeholder="modern, sleek, minimal"
                            className="h-8 text-sm bg-background"
                          />
                        </div>
                      </div>
                      <MarkdownPromptEditor
                        value={newTemplate}
                        onChange={setNewTemplate}
                        placeholder="Transform this beauty product image... {analysis_context} {text_instruction}"
                        minHeight="120px"
                        maxHeight="200px"
                        defaultMode="edit"
                      />
                      <Button onClick={handleAdd} className="w-full h-8 text-sm">
                        추가
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Target list */}
              <div className="space-y-2">
                {targets.map((target, index) => (
                  <motion.div
                    key={target.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04, duration: 0.2 }}
                  >
                    {editing?.id === target.id ? (
                      /* Edit form */
                      <div className="rounded-lg border border-primary/30 bg-muted/20 p-4 space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <Label className="text-xs">이름</Label>
                            <Input
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="h-8 text-sm bg-background"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-xs">타겟 연령</Label>
                            <Input
                              value={editAge}
                              onChange={(e) => setEditAge(e.target.value)}
                              className="h-8 text-sm bg-background"
                            />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs">스타일 키워드 (쉼표 구분)</Label>
                          <Input
                            value={editKeywords}
                            onChange={(e) => setEditKeywords(e.target.value)}
                            className="h-8 text-sm bg-background"
                          />
                        </div>
                        <MarkdownPromptEditor
                          value={editTemplate}
                          onChange={setEditTemplate}
                          minHeight="120px"
                          maxHeight="200px"
                          defaultMode="edit"
                        />
                        <div className="flex gap-2">
                          <Button onClick={handleUpdate} size="sm" className="h-7 text-xs gap-1">
                            <Check className="size-3" />
                            저장
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => setEditing(null)} className="h-7 text-xs gap-1">
                            <X className="size-3" />
                            취소
                          </Button>
                        </div>
                      </div>
                    ) : (
                      /* Display */
                      <div className="group rounded-lg border border-border/40 bg-card/40 px-3.5 py-2.5 flex items-start justify-between gap-3 hover:bg-muted/20 transition-colors">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium">{target.name}</span>
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 font-normal">
                              {target.target_age}
                            </Badge>
                            {target.is_builtin && (
                              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 font-normal">
                                내장
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {target.prompt_template}
                          </p>
                        </div>
                        <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          <button
                            onClick={() => startEdit(target)}
                            className="size-7 rounded-md flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                          >
                            <Pencil className="size-3" />
                          </button>
                          <button
                            onClick={() => handleDelete(target.id)}
                            className="size-7 rounded-md flex items-center justify-center hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="size-3" />
                          </button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
