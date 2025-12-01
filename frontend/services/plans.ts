import { api } from '@/lib/api';

export type Plan = {
  id: string;
  displayName: string;
  priceCents: number;
  tier?: string;
  active?: boolean;
};

function unwrap<T>(payload: any): T {
  return (payload?.data ?? payload) as T;
}

// Ajuste o path conforme seu backend: /public/plans (recomendado) ou /plans
export async function getPlans(): Promise<Plan[]> {
  const res = await api.get('/public/plans');
  return unwrap<Plan[]>(res.data);
}
