// doc-review-dashboard/src/api.ts
import axios from "axios";

/** Base URL do backend (ajuste no .env: VITE_API_URL=http://SEU_IP:3333) */
const BASE_URL =
  (import.meta as any)?.env?.VITE_API_URL ||
  (typeof window !== "undefined" && (window as any).__API_URL__) ||
  "http://127.0.0.1:3333";

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    Accept: "application/json",
  },
});

/** Injeta/remove token nos headers do axios */
export function setAuthToken(token: string | null) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
    localStorage.setItem("admin_token", token); // salva pra manter logado
  } else {
    delete api.defaults.headers.common.Authorization;
    localStorage.removeItem("admin_token");
  }
}

// Ao iniciar o app, tenta restaurar o token salvo
const savedToken = localStorage.getItem("admin_token");
if (savedToken) {
  api.defaults.headers.common.Authorization = `Bearer ${savedToken}`;
}

/** Monta URL absoluta pra abrir arquivos do backend */
export function absoluteUrl(path: string) {
  if (!path) return BASE_URL;
  if (/^https?:\/\//i.test(path)) return path;
  return `${BASE_URL.replace(/\/+$/, "")}/${String(path).replace(/^\/+/, "")}`;
}

/** Helper pra desembrulhar { success, data } em qualquer profundidade */
function unwrap<T = any>(x: any): T {
  let v = x && x.data && ("status" in x || "headers" in x) ? x.data : x;
  while (v && typeof v === "object" && "data" in v && Object.keys(v).every((k) => k === "data" || k === "success")) {
    v = (v as any).data;
  }
  return v as T;
}

/** ===== Tipos ===== */
export type DocStatus = "PENDING" | "APPROVED" | "REJECTED";

export type AdminDoc = {
  id: string;
  code: string;
  originalName?: string | null;
  mime: string;
  url: string;
  createdAt: string;         
  verified?: boolean | null;
  reviewStatus?: DocStatus; 
  status?: DocStatus;        
  user?: {
    id: string;
    name?: string | null;
    email: string;
  } | null;
};

/** ===== API Admin ===== */
export async function listDocuments(params?: {
  status?: DocStatus;
  q?: string;
  userId?: string;
}): Promise<AdminDoc[]> {
  const res = await api.get("/admin/documents", { params });
  return unwrap<AdminDoc[]>(res);
}

export async function getDocumentById(id: string): Promise<AdminDoc> {
  const res = await api.get(`/admin/documents/${id}`);
  return unwrap<AdminDoc>(res);
}

export async function updateDocumentStatus(id: string, verified: boolean) {
  const res = await api.patch(`/admin/documents/${id}`, { verified });
  return unwrap(res);
}
