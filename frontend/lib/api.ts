// src/lib/api.ts
import axios, { AxiosError } from "axios";
import { Platform } from "react-native";

/**
 * Defina EXPO_PUBLIC_API_URL (recomendado) ou API_URL.
 * Para device físico, use o IP da máquina, ex.: http://192.168.15.91:3333
 */
const ENV_URL =
  (process.env as any).EXPO_PUBLIC_API_URL ||
  (process.env as any).API_URL ||
  undefined;

/** Fallbacks locais (emuladores/simuladores) */
const FALLBACK_URL =
  Platform.OS === "android" ? "http://10.0.2.2:3333" : "http://127.0.0.1:3333";

export const API_BASE_URL = ENV_URL || FALLBACK_URL;

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 segundos (aumentado para uploads)
  headers: {
    Accept: "application/json",
    "Accept-Language": "pt-BR",
  },
});

/** Utilitário p/ logs bonitos do corpo */
function summarizeBody(body: any) {
  const isFD = typeof FormData !== "undefined" && body instanceof FormData;
  if (isFD) {
    const parts = (body as any)?._parts;
    if (Array.isArray(parts)) {
      const obj: Record<string, any> = {};
      parts.forEach(([k, v]: any[]) => {
        if (v && typeof v === "object" && "uri" in v) {
          obj[k] = { uri: v.uri, name: v.name, type: v.type };
        } else {
          obj[k] = v;
        }
      });
      return { __formData: obj };
    }
    return "[FormData]";
  }
  try {
    return typeof body === "string" ? body : JSON.stringify(body);
  } catch {
    return "[unserializable body]";
  }
}

/**
 * Interceptor de request:
 * - Se for FormData, REMOVA Content-Type para o RN/axios setar o boundary automaticamente.
 * - Mantém o transformRequest padrão do Axios para JSON (serializa automaticamente).
 */
api.interceptors.request.use((cfg) => {
  const isFormData =
    typeof FormData !== "undefined" && cfg.data instanceof FormData;

  if (isFormData) {
    const h: Record<string, any> = (cfg.headers as any) || {};
    delete h["Content-Type"];
    delete h["content-type"];
    cfg.headers = h;
  }

  if (__DEV__) {
    const fullUrl = cfg.baseURL
      ? `${cfg.baseURL.replace(/\/+$/, "")}/${String(cfg.url).replace(/^\/+/, "")}`
      : String(cfg.url || "");
    const h: any = cfg.headers || {};
    const ct = h["Content-Type"] || h["content-type"];
    // Logs de request
    console.log("[RQ]", (cfg.method || "GET").toUpperCase(), fullUrl, "CT=", ct || "(none)");
    console.log("[RQ] data =", summarizeBody(cfg.data));
    if (h?.Authorization) console.log("[RQ] auth =", h.Authorization);
  }

  return cfg;
});

/** Interceptor de response (logs) */
api.interceptors.response.use(
  (res) => {
    if (__DEV__) {
      const fullUrl = res.config?.baseURL
        ? `${String(res.config.baseURL).replace(/\/+$/, "")}/${String(res.config.url || "").replace(/^\/+/, "")}`
        : String(res.config?.url || "");
      console.log("[RS]", res.status, res.config?.method?.toUpperCase(), fullUrl);
    }
    return res;
  },
  (err: AxiosError<any>) => {
    if (__DEV__) {
      const fullUrl = err.config?.baseURL
        ? `${String(err.config.baseURL).replace(/\/+$/, "")}/${String(err.config.url || "").replace(/^\/+/, "")}`
        : String(err.config?.url || "");
      const status = err.response?.status;
      const serverMsg = (err.response?.data as any)?.message || err.message || "error";
      console.log("[RS][ERR]", status, fullUrl, serverMsg);
      if (err.response?.data) {
        try {
          console.log("[RS][ERR] data =", JSON.stringify(err.response.data));
        } catch {
          console.log("[RS][ERR] data =", err.response.data);
        }
      }
    }
    return Promise.reject(err);
  }
);

/** Injeta/Remove token no header Authorization */
export function setAuthToken(token: string | null) {
  if (token) api.defaults.headers.common.Authorization = `Bearer ${token}`;
  else delete api.defaults.headers.common.Authorization;
}

/** Monta URL absoluta reaproveitando host/porta do API_BASE_URL */
export function absoluteUrl(path: string) {
  if (!path) return API_BASE_URL;
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_BASE_URL.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;
}

// DEBUG: mostra baseURL efetiva
if (__DEV__) {
  console.log("[API] baseURL =", API_BASE_URL);
}
