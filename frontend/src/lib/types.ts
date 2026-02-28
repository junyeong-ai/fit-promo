export type DesignStyle =
  | "person_centered"
  | "product_centered"
  | "ingredient_focused"
  | "lifestyle"
  | "minimal_graphic";

export interface ImageFile {
  id: number;
  filename: string;
  stored_path: string;
  mime_type: string;
  size_bytes: number;
  created_at: string;
}

export interface Target {
  id: number;
  key: string;
  name: string;
  target_age: string;
  style_keywords: string;
  prompt_template: string;
  is_builtin: boolean;
}

export interface Product {
  id: number;
  name: string;
  brand: string | null;
  category: string | null;
  description: string | null;
  key_features: string | null;
  image_id: number | null;
  image_url: string | null;
  source_url: string | null;
  price: string | null;
  scraped_image_ids: string | null;
  created_at: string;
}

export interface GenerationResult {
  id: number;
  generation_id: number;
  target_id: number;
  status: "pending" | "generating" | "completed" | "failed";
  stored_path: string | null;
  prompt_used: string | null;
  rationale: string | null;
  adapted_text: string | null;
  error: string | null;
  created_at: string;
  target: Target | null;
}

export interface Generation {
  id: number;
  source_image_id: number | null;
  product_id: number | null;
  product_ids: string | null;
  promotion_prompt: string | null;
  design_style: string | null;
  mode: string;
  status: "pending" | "analyzing" | "generating" | "completed" | "failed";
  model: string;
  analysis_result: string | null;
  error: string | null;
  created_at: string;
  completed_at: string | null;
  results: GenerationResult[];
  source_image: ImageFile | null;
  product: Product | null;
}
