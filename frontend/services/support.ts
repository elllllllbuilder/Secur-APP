// src/services/support.ts
import { api, API_BASE_URL } from '@/lib/api';
import * as FileSystem from 'expo-file-system';

export type SupportType = 'SAUDE' | 'PANE_MECANICA' | 'ACIDENTE' | 'ROUBO_FURTO';

type CreateInput = { type: SupportType; description?: string };
type UploadAttachmentInput = {
  code?: string;
  file: { uri: string; name?: string | null; type?: string | null };
};

// unwrap genérico
function unwrap<T>(x: any): T {
  let v = x && x.data && ('status' in x || 'headers' in x) ? x.data : x;
  while (v && typeof v === 'object' && 'data' in v && Object.keys(v).every(k => k === 'data' || k === 'success')) {
    v = v.data;
  }
  return v as T;
}

export async function listMySupport() {
  const res = await api.get('/support');
  return unwrap<any[]>(res);
}

export async function getSupportById(id: string) {
  const res = await api.get(`/support/${id}`);
  return unwrap<any>(res);
}

export async function createSupport(input: CreateInput) {
  const res = await api.post('/support', input, {
    headers: { 'Content-Type': 'application/json' },
  });
  return unwrap<any>(res);
}

export async function uploadSupportAttachment(
  supportId: string,
  input: UploadAttachmentInput
): Promise<any> {
  const name = input.file.name || `anexo_${Date.now()}.jpg`;
  const type = input.file.type || 'application/octet-stream';

  const fd = new FormData();
  if (input.code) fd.append('code', input.code);
  fd.append('file', { uri: input.file.uri, name, type } as any);

  // 1) tenta axios
  try {
    const res = await api.post(`/support/${supportId}/attachments`, fd);
    return unwrap(res);
  } catch (e: any) {
    console.log('[ATT][axios fail] ->', e?.message || e);
  }

  // 2) fallback fetch
  try {
    const url = `${API_BASE_URL.replace(/\/+$/, '')}/support/${supportId}/attachments`;
    const auth = (api.defaults.headers.common.Authorization as string) || '';

    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        // NÃO defina 'Content-Type' aqui — RN define o boundary automaticamente
        Authorization: auth,
        Accept: 'application/json',
      },
      body: fd,
    });

    let data: any = null;
    try { data = await resp.json(); } catch { /* ignore */ }

    if (!resp.ok) {
      const msg = (data && (data.message || data.error)) || `HTTP ${resp.status}`;
      throw new Error(String(msg));
    }
    return unwrap(data);
  } catch (e: any) {
    console.log('[ATT][fetch fail] ->', e?.message || e);
  }

  // 3) fallback definitivo: expo-file-system (o mais estável no Android)
  const url = `${API_BASE_URL.replace(/\/+$/, '')}/support/${supportId}/attachments`;
  const auth = (api.defaults.headers.common.Authorization as string) || '';

  const result = await FileSystem.uploadAsync(url, input.file.uri, {
    httpMethod: 'POST',
    headers: {
      Authorization: auth,
      Accept: 'application/json',
    },
    uploadType: FileSystem.FileSystemUploadType.MULTIPART,
    fieldName: 'file', // precisa bater com o @FileInterceptor('file')
    parameters: {
      code: input.code || 'ANEXO',
    },
  });

  if (result.status < 200 || result.status >= 300) {
    // tenta decodificar a resposta de erro
    let msg = `HTTP ${result.status}`;
    try {
      const j = JSON.parse(result.body);
      msg = j?.message || j?.error || msg;
    } catch {}
    throw new Error(msg);
  }

  try {
    const parsed = JSON.parse(result.body);
    return unwrap(parsed);
  } catch {
    // se vier sem JSON, retorna algo mínimo
    return { success: true, data: { status: result.status } };
  }
}
