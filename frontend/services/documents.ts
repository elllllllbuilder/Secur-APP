// src/services/documents.ts
import { api, API_BASE_URL } from '@/lib/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ===== Tipos =====
export type MyDoc = {
  id: string;
  code: string;
  originalName?: string | null;
  mime: string;
  url: string;
  verified: boolean;
};

type UploadInput = {
  code: string;
  file: {
    uri: string;
    name?: string | null;
    type?: string | null;     // alguns pickers usam 'type'
    mimeType?: string | null; // outros usam 'mimeType'
  };
};

// ===== Helpers =====
function unwrap<T>(x: any): T {
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

function extFromName(name?: string | null) {
  const m = (name || '').match(/\.([a-zA-Z0-9]+)$/);
  return m?.[1]?.toLowerCase() || '';
}

function guessMime(name?: string | null, fallback = 'application/octet-stream') {
  const ext = extFromName(name);
  switch (ext) {
    case 'pdf': return 'application/pdf';
    case 'jpg':
    case 'jpeg': return 'image/jpeg';
    case 'png': return 'image/png';
    case 'heic': return 'image/heic';
    case 'webp': return 'image/webp';
    default: return fallback;
  }
}

// ===== API =====
export async function listMyDocuments(): Promise<MyDoc[]> {
  const res = await api.get('/me/documents');
  // axios já vem como AxiosResponse; unwrap trata {success,data}
  const payload = (res as any)?.data ?? res;
  return unwrap<MyDoc[]>(payload);
}

export async function deleteMyDocument(id: string): Promise<{ ok: true }> {
  const res = await api.delete(`/me/documents/${id}`);
  const payload = (res as any)?.data ?? res;
  return unwrap<{ ok: true }>(payload);
}

/**
 * Upload usando axios (mais confiável para FormData).
 */
export async function uploadMyDocument(input: UploadInput): Promise<MyDoc> {
  const { code, file } = input;
  
  // Validações iniciais
  if (!file?.uri) {
    console.log('[UPLOAD] ❌ Arquivo inválido - sem URI');
    throw new Error('Arquivo inválido.');
  }

  // nome + tipo com fallbacks
  const name =
    (file.name && String(file.name)) ||
    `document_${Date.now()}.${(file.mimeType || file.type || 'bin').split('/').pop()}`;
  const type =
    (file.mimeType as string) ||
    (file.type as string) ||
    guessMime(name, 'application/octet-stream');

  // pega userId e token do AsyncStorage (authContext)
  const userStr = await AsyncStorage.getItem('auth:user');
  const token = await AsyncStorage.getItem('auth:access');
  
  if (!userStr || !token) {
    console.log('[UPLOAD] ❌ Usuário ou token não encontrado');
    throw new Error('Sessão expirada. Faça login novamente.');
  }
  
  const user = JSON.parse(userStr);
  const userId = user?.id;
  
  if (!userId) {
    console.log('[UPLOAD] ❌ UserId não encontrado no objeto user');
    throw new Error('Sessão inválida. Faça login novamente.');
  }
  
  console.log('[UPLOAD] 📤 Iniciando upload...');
  console.log('[UPLOAD] userId:', userId);
  console.log('[UPLOAD] code:', code);
  console.log('[UPLOAD] arquivo:', name);
  console.log('[UPLOAD] tipo:', type);
  console.log('[UPLOAD] uri:', file.uri.substring(0, 50) + '...');

  // monta FormData usando fetch (mais compatível com RN)
  const fd = new FormData();
  fd.append('code', String(code));
  fd.append('file', {
    uri: file.uri,
    name: name,
    type: type,
  } as any);

  try {
    console.log('[UPLOAD] Enviando requisição via fetch...');
    const startTime = Date.now();
    
    // Usa fetch nativo do RN para FormData (mais confiável)
    const response = await fetch(`${API_BASE_URL}/me/documents`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        // NÃO definir Content-Type, deixa o fetch definir com boundary
      },
      body: fd,
    });
    
    const duration = Date.now() - startTime;
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.log('[UPLOAD] ❌ Erro HTTP:', response.status);
      console.log('[UPLOAD] Erro data:', JSON.stringify(errorData, null, 2));
      
      if (response.status === 401) {
        throw new Error('🔒 Não autorizado. Faça login novamente.');
      }
      if (response.status === 413) {
        throw new Error('📦 Arquivo muito grande. O limite é 20 MB.');
      }
      if (response.status === 400) {
        const msg = errorData?.message;
        throw new Error(Array.isArray(msg) ? msg.join('\n') : msg || 'Dados inválidos');
      }
      if (response.status === 500) {
        throw new Error('⚠️ Erro no servidor. Tente novamente em alguns instantes.');
      }
      
      throw new Error(errorData?.message || `Erro HTTP ${response.status}`);
    }
    
    const data = await response.json();
    
    console.log('[UPLOAD] ✅ Sucesso em', duration, 'ms');
    console.log('[UPLOAD] Resposta:', JSON.stringify(data, null, 2));
    
    return unwrap<MyDoc>(data);
  } catch (e: any) {
    console.log('[UPLOAD] ❌ Erro catch:', e?.message);
    
    // Erros de rede
    if (e?.message?.includes('Network request failed') || e?.message?.includes('Failed to fetch')) {
      throw new Error('🌐 Erro de rede. Verifique se o backend está rodando e se o IP está correto.');
    }
    
    // Se já é um erro tratado, repassa
    if (e?.message?.startsWith('🔒') || e?.message?.startsWith('📦') || e?.message?.startsWith('⚠️')) {
      throw e;
    }
    
    throw new Error(e?.message || 'Falha no upload');
  }
}
