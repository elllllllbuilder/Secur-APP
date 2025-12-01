export type PagarmeCustomer = {
  id: number;
  name: string;
  email?: string;
  document_number?: string;
};

export type CreateCustomerInput = {
  name: string;
  email?: string;
  document_number?: string; // CPF/CNPJ
};

export type CreateSubscriptionInput = {
  plan_id: string | number;
  customer: {
    id?: number;
    name?: string;
    email?: string;
    document_number?: string;
  };
  card_number: string;
  card_holder_name: string;
  card_expiration_date: string; // MMYY
  card_cvv: string;
  postback_url?: string;
  metadata?: Record<string, any>;
};

export type PagarmeSubscription = {
  id: number;
  current_period_start: string | number;
  current_period_end: string | number;
  plan: { id: number | string };
  status: 'trialing' | 'paid' | 'unpaid' | 'canceled';
};

export type WebhookEvent = {
  id: string;
  event: string; // e.g. "subscription_status_changed", "payment_paid", etc.
  payload?: any;
};
