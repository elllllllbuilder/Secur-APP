// src/services/profile.ts
import { api } from "@/lib/api";

export type Plan = {
  id: string;
  displayName?: string;
  name?: string;
  tier?: string;
  priceCents?: number;
  amountCents?: number;
};

export type MySubscription = {
  id: string;
  status: "active" | "canceled" | "past_due" | "inactive" | string;
  startedAt?: string;
  eligibleAt?: string | null;     // carência (alguns backends usam esse nome)
  graceEndsAt?: string | null;    // ou esse
  currentPeriodEnd?: string | null;
  plan?: Plan | null;
  planId?: string | null;
  provider?: string | null;       // mercadopago, stripe, etc
};

export type Me = {
  id: string;
  name?: string | null;
  email?: string | null;
  phone?: string | null;

  // Endereço (como no seu schema Prisma)
  street?: string | null;
  number?: string | null;
  city?: string | null;
  state?: string | null;
  zipCode?: string | null;

  categoryId?: string | null;
  categorySlug?: string | null;
};

export type UpdateMeDto = Partial<
  Pick<Me, "name" | "phone" | "street" | "number" | "city" | "state" | "zipCode">
>;

/**
 * Desembrulha respostas que vêm como AxiosResponse e/ou com múltiplos níveis
 * { success, data } → { success, data } → payload final.
 */
function unwrap<T>(payload: any): T {
  let v = payload;

  // Se veio um AxiosResponse, use .data
  if (v && typeof v === "object" && "data" in v && ("status" in v || "headers" in v)) {
    v = v.data;
  }

  // Desembrulha repetidamente objetos no formato { success?, data: ... }
  // enquanto as únicas chaves forem "data" e opcionalmente "success"
  while (
    v &&
    typeof v === "object" &&
    "data" in v &&
    Object.keys(v).every((k) => k === "data" || k === "success")
  ) {
    v = (v as any).data;
  }

  return v as T;
}

/** Normaliza plan (fallback de displayName e priceCents) */
function normalizePlan(p: any | null | undefined): Plan | null {
  if (!p) return null;
  return {
    id: String(p.id),
    displayName: p.displayName ?? p.name ?? p.tier ?? undefined,
    name: p.name,
    tier: p.tier,
    priceCents: p.priceCents ?? p.amountCents,
    amountCents: p.amountCents,
  };
}

/** Normaliza assinatura (status em minúsculas e plan normalizado) */
function normalizeSub(s: any | null | undefined): MySubscription | null {
  if (!s) return null;
  const status = (s.status ?? "").toString().toLowerCase();
  return {
    id: String(s.id),
    status,
    startedAt: s.startedAt ?? undefined,
    eligibleAt: s.eligibleAt ?? null,
    graceEndsAt: s.graceEndsAt ?? null,
    currentPeriodEnd: s.currentPeriodEnd ?? null,
    planId: s.planId ?? null,
    plan: normalizePlan(s.plan),
    provider: s.provider ?? null,
  };
}

export async function getMe(): Promise<Me> {
  const res = await api.get("/me");
  return unwrap<Me>(res);
}

export async function updateMe(dto: UpdateMeDto): Promise<Me> {
  const res = await api.patch("/me", dto);
  return unwrap<Me>(res);
}

export async function getMySubscription(): Promise<MySubscription | null> {
  const res = await api.get("/me/subscription");
  const raw = unwrap<any>(res);
  return normalizeSub(raw);
}

export async function getPlanById(id: string): Promise<Plan> {
  const res = await api.get(`/plans/${id}`);
  const raw = unwrap<any>(res);
  const plan = normalizePlan(raw);
  // Garantir um objeto Plan (se backend não retornar id, lança)
  if (!plan) throw new Error("Plano não encontrado");
  return plan;
}
