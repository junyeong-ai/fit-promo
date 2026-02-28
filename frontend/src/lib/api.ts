import type { ImageFile, Target, Product, Generation } from "./types";

const BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/v1`;

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, options);
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`API error ${res.status}: ${body}`);
  }
  return res.json();
}

export function getImageUrl(storedPath: string): string {
  return `${process.env.NEXT_PUBLIC_API_URL}/files/${storedPath}`;
}

// Images
export async function uploadImage(file: File): Promise<ImageFile> {
  const formData = new FormData();
  formData.append("file", file);
  return request<ImageFile>("/images/upload", {
    method: "POST",
    body: formData,
  });
}

// Targets
export async function getTargets(): Promise<Target[]> {
  return request<Target[]>("/targets");
}

export async function createTarget(data: {
  key: string;
  name: string;
  target_age: string;
  style_keywords: string[];
  prompt_template: string;
}): Promise<Target> {
  return request<Target>("/targets", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export async function updateTarget(
  id: number,
  data: {
    name?: string;
    target_age?: string;
    style_keywords?: string[];
    prompt_template?: string;
  }
): Promise<Target> {
  return request<Target>(`/targets/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export async function deleteTarget(id: number): Promise<void> {
  await request(`/targets/${id}`, { method: "DELETE" });
}

// Products
export async function getProducts(): Promise<Product[]> {
  return request<Product[]>("/products");
}

export async function createProduct(data: {
  name: string;
  brand?: string;
  category?: string;
  description?: string;
  key_features?: string[];
  image_id?: number;
  image_url?: string;
}): Promise<Product> {
  return request<Product>("/products", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export async function updateProduct(
  id: number,
  data: {
    name?: string;
    brand?: string;
    category?: string;
    description?: string;
    key_features?: string[];
    image_id?: number;
    image_url?: string;
  }
): Promise<Product> {
  return request<Product>(`/products/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export async function deleteProduct(id: number): Promise<void> {
  await request(`/products/${id}`, { method: "DELETE" });
}

// Generations
export async function createGeneration(data: {
  source_image_id?: number;
  target_ids: number[];
  product_ids?: number[];
  promotion_prompt?: string;
  design_style?: string;
}): Promise<Generation> {
  return request<Generation>("/generations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export async function getGeneration(id: number): Promise<Generation> {
  return request<Generation>(`/generations/${id}`);
}
