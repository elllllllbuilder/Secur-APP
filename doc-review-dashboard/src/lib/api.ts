// src/lib/api.ts
import axios from "axios";

export const API_BASE_URL =
  (import.meta as any).env?.VITE_API_URL?.replace(/\/+$/, "") ||
  "http://127.0.0.1:3333";

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false,
});

// permite logar/deslogar ajustando o header global
export function setAuthToken(token: string | null) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
}

export function absoluteUrl(path: string) {
  if (!path) return API_BASE_URL;
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_BASE_URL}/${path.replace(/^\/+/, "")}`;
}

export function openFile(url: string) {
  const full = absoluteUrl(url);
  window.open(full, "_blank", "noopener,noreferrer");
}
