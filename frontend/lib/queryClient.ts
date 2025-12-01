// lib/queryClient.ts
import { QueryClient, type QueryFunctionContext } from '@tanstack/react-query';
import { api } from '@/lib/api';

const defaultQueryFn = async ({ queryKey }: QueryFunctionContext) => {
  // queryKey esperado: ['path'] | ['path', string|number] | ['path', { params }]
  const [path, arg] = queryKey as [string, unknown?];

  if (!path || typeof path !== 'string') {
    throw new Error('defaultQueryFn: primeiro item da queryKey deve ser uma string (path).');
  }

  let url = `/${path}`;

  if (typeof arg === 'string' || typeof arg === 'number') {
    // Trate o segundo item como segmento de rota, ex.: ['public/categories', 'taxista']
    url += `/${encodeURIComponent(String(arg))}`;
  } else if (arg && typeof arg === 'object') {
    // Trate o segundo item como query params, ex.: ['public/categories', { page: 2 }]
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(arg as Record<string, unknown>)) {
      if (v !== undefined && v !== null) params.append(k, String(v));
    }
    const qs = params.toString();
    if (qs) url += `?${qs}`;
  }

  const { data } = await api.get(url);
  // Muitos backends respondem como { data: ... }; garanta retorno do payload
  return (data && (data as any).data !== undefined) ? (data as any).data : data;
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: defaultQueryFn,
      staleTime: 30_000,            // 30s "fresh"
      gcTime: 5 * 60_000,           // 5min no cache antes do GC
      refetchOnWindowFocus: false,  // RN não tem "window", mas mantemos por consistência
      refetchOnReconnect: true,
      retry: 1,
    },
    mutations: {
      retry: 0,
    },
  },
});
