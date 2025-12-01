// src/types.ts

export type DocStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type AdminDoc = {
  id: string;
  userId?: string; // pode ser opcional em alguns endpoints
  code: string;
  originalName?: string | null;
  mime: string;
  url: string;
  uploadedAt?: string;   // usado no app
  createdAt?: string;    // usado no dashboard
  status?: DocStatus;    // status principal
  reviewStatus?: DocStatus; // status vindo de revisão
  notes?: string | null;
  user?: {
    id: string;
    name?: string | null;
    email?: string | null;
  } | null;
};
