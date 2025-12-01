// src/services/auth.ts
import { API_BASE_URL, setAuthToken } from '@/lib/api';
import * as SecureStore from 'expo-secure-store';

type RawLoginResponse =
  | { accessToken?: string; token?: string; success?: boolean; data?: any }
  | string
  | any;

/** Desembrulha { success, data } se vier embrulhado */
function unwrap<T = any>(x: any): T {
  let v = x;
  while (
    v &&
    typeof v === 'object' &&
    'data' in v &&
    Object.keys(v).every((k) => k === 'data' || k === 'success')
  ) {
    v = v.data;
  }
  return v as T;
}

/**
 * Login usando fetch + JSON.stringify para garantir body no device físico (Expo Go).
 * Se o backend envolver em { success, data }, o unwrap cuida.
 */
export async function signIn(email: string, password: string) {
  const payload = {
    email: String(email ?? '').trim().toLowerCase(),
    password: String(password ?? '').trim(),
  };

  if (!payload.email || !payload.password) {
    throw new Error('Preencha e-mail e senha.');
  }

  if (__DEV__) {
    console.log('[LOGIN] API_BASE_URL =', API_BASE_URL);
    console.log('[LOGIN] payload.len =', {
      email: payload.email.length,
      password: payload.password.length,
    });
  }

  const resp = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Accept-Language': 'pt-BR',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  let json: RawLoginResponse = {};
  try {
    json = await resp.json();
  } catch {
    // mantém {} se não houver JSON
  }

  if (!resp.ok) {
    const serverMsg = (json as any)?.message;
    const msg = Array.isArray(serverMsg)
      ? serverMsg.join('\n')
      : serverMsg || `Falha no login (HTTP ${resp.status})`;
    throw new Error(msg);
  }

  const raw = unwrap<any>(json);
  const token: string | undefined =
    raw?.accessToken ?? raw?.token ?? (typeof raw === 'string' ? raw : undefined);

  if (!token) {
    if (__DEV__) console.log('[LOGIN] resposta crua:', JSON.stringify(json));
    throw new Error('Token não retornado pelo backend.');
  }

  await SecureStore.setItemAsync('token', token);
  setAuthToken(token);
  return token;
}

/** Reidrata o token salvo (use no boot do app) */
export async function restoreAuth(): Promise<string | null> {
  const token = await SecureStore.getItemAsync('token');
  setAuthToken(token);
  return token;
}

/** Logout: limpa storage e header Authorization */
export async function signOut() {
  await SecureStore.deleteItemAsync('token');
  setAuthToken(null);
}
