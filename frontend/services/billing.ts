// services/billing.ts
import { api } from '@/lib/api';

type CardCheckoutDTO = {
  categoryId?: string;
  card_number: string;
  card_holder_name: string;
  card_expiration_date: string; // MMYY
  card_cvv: string;
};

type BoletoCheckoutDTO = {
  categoryId?: string;
};

type PixCheckoutDTO = {
  categoryId?: string;
};

export async function checkoutCard(
  planId: string,
  dto: CardCheckoutDTO
): Promise<{ status: string; subscriptionId?: string; planId?: string }> {
  const { data } = await api.post('/billing/checkout/card', { planId, ...dto });
  return data?.data ?? data;
}

export async function checkoutBoleto(
  planId: string,
  dto: BoletoCheckoutDTO
): Promise<{ boleto?: { barcode?: string; url?: string } }> {
  const { data } = await api.post('/billing/checkout/boleto', { planId, ...dto });
  return data?.data ?? data;
}

export async function checkoutPix(
  planId: string,
  dto: PixCheckoutDTO
): Promise<{ pix?: { qrCodeText?: string; qrCode?: string } }> {
  const { data } = await api.post('/billing/checkout/pix', { planId, ...dto });
  return data?.data ?? data;
}
