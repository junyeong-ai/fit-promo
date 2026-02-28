"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  Check,
  ChevronDown,
  ChevronUp,
  ImageIcon,
  Plus,
  ArrowLeft,
  Pencil,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "@/lib/api";
import type { Product } from "@/lib/types";
import { toast } from "sonner";

interface ProductInfoFormProps {
  onProductsChanged: (products: Product[]) => void;
  onSkip: () => void;
  selectedProducts: Product[];
}

type ViewMode = "list" | "create" | "edit";

export function ProductInfoForm({
  onProductsChanged,
  onSkip,
  selectedProducts,
}: ProductInfoFormProps) {
  const [expanded, setExpanded] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  // Form state (shared by create & edit)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [keyFeatures, setKeyFeatures] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [saving, setSaving] = useState(false);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const list = await getProducts();
      setProducts(list);
    } catch {
      console.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (expanded && products.length === 0) {
      loadProducts();
    }
  }, [expanded, products.length, loadProducts]);

  const resetForm = () => {
    setName("");
    setBrand("");
    setCategory("");
    setDescription("");
    setKeyFeatures("");
    setImageUrl("");
    setEditingProduct(null);
  };

  const handleSelect = (product: Product) => {
    const isAlreadySelected = selectedProducts.some((p) => p.id === product.id);
    if (isAlreadySelected) {
      onProductsChanged(selectedProducts.filter((p) => p.id !== product.id));
    } else {
      onProductsChanged([...selectedProducts, product]);
    }
  };

  const handleStartEdit = (product: Product) => {
    setEditingProduct(product);
    setName(product.name);
    setBrand(product.brand || "");
    setCategory(product.category || "");
    setDescription(product.description || "");
    setImageUrl(product.image_url || "");
    const features = parseFeatures(product.key_features);
    setKeyFeatures(features.join(", "));
    setViewMode("edit");
  };

  const handleDelete = async (product: Product) => {
    try {
      await deleteProduct(product.id);
      toast.success("상품 삭제 완료");
      onProductsChanged(selectedProducts.filter((p) => p.id !== product.id));
      loadProducts();
    } catch {
      toast.error("상품 삭제 실패");
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("상품명은 필수입니다");
      return;
    }
    setSaving(true);

    const data = {
      name: name.trim(),
      brand: brand.trim() || undefined,
      category: category.trim() || undefined,
      description: description.trim() || undefined,
      key_features: keyFeatures
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      image_url: imageUrl.trim() || undefined,
    };

    try {
      if (viewMode === "edit" && editingProduct) {
        const updated = await updateProduct(editingProduct.id, data);
        toast.success("상품 수정 완료");
        // Update in selected products if it was selected
        onProductsChanged(
          selectedProducts.map((p) => (p.id === updated.id ? updated : p))
        );
      } else {
        const product = await createProduct(data);
        toast.success("상품 등록 완료");
        onProductsChanged([...selectedProducts, product]);
      }
      setViewMode("list");
      resetForm();
      loadProducts();
    } catch {
      toast.error(viewMode === "edit" ? "상품 수정 실패" : "상품 등록 실패");
    } finally {
      setSaving(false);
    }
  };

  const parseFeatures = (raw: string | null): string[] => {
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  };

  const formTitle = viewMode === "edit" ? "상품 수정" : "새 상품 등록";
  const formButton = viewMode === "edit" ? "상품 수정" : "상품 등록";

  return (
    <div className="rounded-xl border border-border/60 bg-card/60 overflow-hidden">
      <button
        type="button"
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2.5">
          <Package className="size-4 text-muted-foreground" />
          <span className="text-sm font-medium">상품 정보</span>
          {selectedProducts.length > 0 ? (
            <span className="text-xs text-muted-foreground">
              {selectedProducts.length === 1
                ? `${selectedProducts[0].name}${selectedProducts[0].brand ? ` · ${selectedProducts[0].brand}` : ""}`
                : `${selectedProducts.length}개 상품 선택됨`}
            </span>
          ) : (
            <span className="text-[10px] text-muted-foreground/60">
              선택사항
            </span>
          )}
        </div>
        {expanded ? (
          <ChevronUp className="size-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="size-4 text-muted-foreground" />
        )}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 border-t border-border/40 pt-4">
              <AnimatePresence mode="wait">
                {viewMode === "list" ? (
                  <motion.div
                    key="list"
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    transition={{ duration: 0.15 }}
                    className="space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">
                        등록된 상품을 선택하거나 새로 추가하세요.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          resetForm();
                          setViewMode("create");
                        }}
                        className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
                      >
                        <Plus className="size-3" />
                        직접 등록
                      </button>
                    </div>

                    {loading ? (
                      <div className="flex items-center justify-center py-6">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <div className="size-4 border-2 border-muted border-t-primary rounded-full animate-spin" />
                          <span className="text-xs">로딩 중...</span>
                        </div>
                      </div>
                    ) : products.length === 0 ? (
                      <div className="text-center py-6">
                        <p className="text-xs text-muted-foreground mb-2">
                          등록된 상품이 없습니다.
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            resetForm();
                            setViewMode("create");
                          }}
                          className="text-xs h-7"
                        >
                          <Plus className="size-3 mr-1" />
                          상품 등록하기
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-1.5 max-h-64 overflow-y-auto">
                        {products.map((product) => {
                          const isSelected = selectedProducts.some(
                            (p) => p.id === product.id
                          );
                          const features = parseFeatures(product.key_features);
                          return (
                            <div
                              key={product.id}
                              className={`flex items-start gap-3 rounded-lg p-2.5 transition-colors ${
                                isSelected
                                  ? "bg-primary/8 border border-primary/30"
                                  : "hover:bg-muted/30 border border-transparent"
                              }`}
                            >
                              {/* Clickable area for selection */}
                              <button
                                type="button"
                                onClick={() => handleSelect(product)}
                                className="flex items-start gap-3 flex-1 min-w-0 text-left"
                              >
                                {product.image_url ? (
                                  <img
                                    src={product.image_url}
                                    alt={product.name}
                                    className="size-12 rounded-lg object-cover border border-border/30 shrink-0"
                                    onError={(e) => {
                                      (
                                        e.target as HTMLImageElement
                                      ).style.display = "none";
                                    }}
                                  />
                                ) : (
                                  <div className="size-12 rounded-lg bg-muted/40 border border-border/30 flex items-center justify-center shrink-0">
                                    <Package className="size-5 text-muted-foreground/40" />
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-sm font-medium truncate">
                                      {product.name}
                                    </span>
                                    {isSelected && (
                                      <Check className="size-3.5 text-primary shrink-0" />
                                    )}
                                  </div>
                                  {product.brand && (
                                    <span className="text-[11px] text-muted-foreground">
                                      {product.brand}
                                      {product.category &&
                                        ` · ${product.category}`}
                                    </span>
                                  )}
                                  {features.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {features.slice(0, 3).map((f, i) => (
                                        <span
                                          key={i}
                                          className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted/50 text-muted-foreground"
                                        >
                                          {f}
                                        </span>
                                      ))}
                                      {features.length > 3 && (
                                        <span className="text-[10px] text-muted-foreground/60">
                                          +{features.length - 3}
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </button>

                              {/* Edit / Delete buttons */}
                              <div className="flex gap-1 shrink-0 pt-1">
                                <button
                                  type="button"
                                  onClick={() => handleStartEdit(product)}
                                  className="p-1 rounded text-muted-foreground/50 hover:text-foreground hover:bg-muted/50 transition-colors"
                                  title="수정"
                                >
                                  <Pencil className="size-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDelete(product)}
                                  className="p-1 rounded text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10 transition-colors"
                                  title="삭제"
                                >
                                  <Trash2 className="size-3.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    <Button
                      variant="ghost"
                      onClick={() => {
                        onSkip();
                        setExpanded(false);
                      }}
                      className="w-full h-7 text-xs text-muted-foreground"
                    >
                      상품 없이 진행
                    </Button>
                  </motion.div>
                ) : (
                  /* Create / Edit form */
                  <motion.div
                    key="form"
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 8 }}
                    transition={{ duration: 0.15 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setViewMode("list");
                          resetForm();
                        }}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <ArrowLeft className="size-4" />
                      </button>
                      <span className="text-xs font-medium">{formTitle}</span>
                    </div>

                    {/* Product image URL */}
                    <div className="space-y-1.5">
                      <Label className="text-xs flex items-center gap-1.5">
                        <ImageIcon className="size-3 text-muted-foreground" />
                        상품 이미지 URL
                      </Label>
                      <Input
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        placeholder="https://example.com/product-image.jpg"
                        className="h-8 text-sm bg-background"
                        type="url"
                      />
                      {imageUrl.trim() && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="pt-1"
                        >
                          <img
                            src={imageUrl.trim()}
                            alt="상품 미리보기"
                            className="h-20 w-20 rounded-lg object-cover border border-border/40"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display =
                                "none";
                            }}
                            onLoad={(e) => {
                              (e.target as HTMLImageElement).style.display =
                                "block";
                            }}
                          />
                        </motion.div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs">
                          상품명 <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="비타민C 세럼"
                          className="h-8 text-sm bg-background"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">브랜드</Label>
                        <Input
                          value={brand}
                          onChange={(e) => setBrand(e.target.value)}
                          placeholder="브랜드명"
                          className="h-8 text-sm bg-background"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs">카테고리</Label>
                        <Input
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          placeholder="세럼, 크림, 마스크팩 등"
                          className="h-8 text-sm bg-background"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">
                          핵심 특징 (쉼표 구분)
                        </Label>
                        <Input
                          value={keyFeatures}
                          onChange={(e) => setKeyFeatures(e.target.value)}
                          placeholder="비타민C 20%, 미백, 주름개선"
                          className="h-8 text-sm bg-background"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs">상품 설명</Label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="상품에 대한 간략한 설명 (선택사항)"
                        className="w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-sm resize-none h-16 focus:outline-none focus:ring-1 focus:ring-primary/40"
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={handleSave}
                        disabled={saving || !name.trim()}
                        className="flex-1 h-8 text-sm gap-1"
                      >
                        <Check className="size-3" />
                        {saving ? "저장 중..." : formButton}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setViewMode("list");
                          resetForm();
                        }}
                        className="h-8 text-sm"
                      >
                        취소
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
