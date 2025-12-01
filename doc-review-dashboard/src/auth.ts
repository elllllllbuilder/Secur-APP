// doc-review-dashboard/src/auth.ts
import { api, setAuthToken } from "@/api";

// helper mínimo só para este arquivo
function unwrap<T = any>(x: any): T {
  let v = x && x.data && ("status" in x || "headers" in x) ? x.data : x;
  while (v && typeof v === "object" && "data" in v && Object.keys(v).every(k => k === "data" || k === "success")) {
    v = (v as any).data;
  }
  return v as T;
}

export async function login(email: string, password: string) {
  const res = await api.post("/auth/login", { email, password }, {
    headers: { "Content-Type": "application/json" },
  });
  const body = unwrap<any>(res);
  const token = body?.accessToken || body?.data?.accessToken;
  if (!token) throw new Error("Credenciais inválidas");
  localStorage.setItem("adm:token", token);
  setAuthToken(token);
  return token;
}

export function loadTokenFromStorage() {
  const t = localStorage.getItem("adm:token");
  if (t) setAuthToken(t);
  return t;
}

export function logout() {
  localStorage.removeItem("adm:token");
  setAuthToken(null);
}
