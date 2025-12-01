// src/lib/api.ts
import axios, { AxiosHeaders } from "axios";
import { Platform } from "react-native";

/**
 * Defina uma dessas variáveis em tempo de build:
 * - EXPO_PUBLIC_API_URL (recomendado no Expo)
 * - API_URL (caso você já use esse nome)
 *
 * Para DEVICE FÍSICO: use o IP da sua máquina na mesma rede do celular.
 *   EX.:  http://192.168.0.10:3333
 */
const ENV_URL =
  (process.env as any).EXPO_PUBLIC_API_URL ||
  (process.env as any).API_URL ||
  undefined;

/**
 * Fallbacks locais:
 * - Android EMULADOR => 10.0.2.2
 * - iOS simulador / web => 127.0.0.1
 */
const FALLBACK_URL =
  Platform.OS === "android"
    ? "http://10.0.2.2:3333"
    : "http://127.0.0.1:3333";

export const API_BASE_URL = ENV_URL || FALLBACK_URL;

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    Accept: "application/json",
    "Accept-Language": "pt-BR",
  },
  /**
   * Mantém FormData intacto no React Native.
   * NÃO force "Content-Type: multipart/form-data" — deixe o axios/RN
   * definir o boundary automaticamente, senão o backend recebe body vazio.
   */
  transformRequest: [
    (data, headers) => {
      const isFormData =
        typeof FormData !== "undefined" && data instanceof FormData;

      if (!isFormData) return data;

      if (headers) {
        // Axios v1 (AxiosHeaders)
        if (headers instanceof AxiosHeaders) {
          headers.delete("Content-Type");
        } else {
          // fallback quando headers é objeto simples
          const h: any = headers;
          if (h["Content-Type"]) delete h["Content-Type"];
          if (h.common?.["Content-Type"]) delete h.common["Content-Type"];
        }
      }

      return data;
    },
  ],
});

/**
 * Injeta/Remove o token globalmente.
 * - login:  setAuthToken(token)
 * - logout: setAuthToken(null)
 */
export function setAuthToken(token: string | null) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
}

/**
 * Monta URL absoluta a partir do mesmo host/porta do API_BASE_URL.
 * Útil para abrir arquivos/links do backend.
 */
export function absoluteUrl(path: string) {
  if (!path) return API_BASE_URL;
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_BASE_URL.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;
}

/* Opcional: trate 401 globalmente (logout, etc.)
import type { AxiosError } from "axios";
export function onUnauthorized(cb: () => void) {
  api.interceptors.response.use(
    (res) => res,
    (err: AxiosError) => {
      if (err.response?.status === 401) cb?.();
      return Promise.reject(err);
    }
  );
}
*/

// DEBUG: veja no console do Expo a URL base efetiva
if (__DEV__) {
  // eslint-disable-next-line no-console
  console.log("[API] baseURL =", API_BASE_URL);
}
