// src/services/public.ts
import { api } from "@/lib/api";

export type RequiredDoc = {
  id: string;
  code: string;
  label: string;
  isOptional: boolean;
  // opcionais (o documents.tsx mostra essas infos se vierem do backend)
  mimetypes?: string[]; // ex.: ["image/*", "application/pdf"]
  maxSizeMb?: number;   // ex.: 10
};

export type PublicCategory = {
  id: string;
  slug: string;
  title: string;
  description?: string;
  requiredDocs: RequiredDoc[];
};

// Aceita backend que retorna { data: ... } ou já o payload direto
function unwrap<T>(payload: any): T {
  return (payload?.data ?? payload) as T;
}

export async function getPublicCategories(): Promise<PublicCategory[]> {
  const res = await api.get("/public/categories");
  return unwrap<PublicCategory[]>(res.data);
}

export async function getCategoryById(id: string): Promise<PublicCategory> {
  const res = await api.get(`/categories/${id}`);
  return unwrap<PublicCategory>(res.data);
}

// (Opcional) útil se você usar slug na UI
export async function getCategoryBySlug(slug: string): Promise<PublicCategory> {
  const res = await api.get(`/public/categories/${slug}`);
  return unwrap<PublicCategory>(res.data);
}
