// src/api/index.ts

export type AdminDoc = {
  id: string;
  code: string;
  url: string;
  mime: string;
  originalName?: string | null;
  verified?: boolean;
  uploadedAt?: string;      // <- usado no Detail
  createdAt?: string;       // <- fallback se backend mandar createdAt
  user: {
    id: string;
    name?: string;
    email: string;
    phone?: string;
    category?: {
      id: string;
      title: string;        // <- "Taxista"
    };
    subscriptions?: Array<{
      plan?: {
        id: string;
        displayName: string; // <- "Plano Bronze"
      };
    }>;
  };
};

// Lista para a tabela principal
export async function getDocuments(): Promise<AdminDoc[]> {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/documents`, {
    credentials: "include",
    headers: { Accept: "application/json" },
  });
  return res.json();
}

// Busca 1 documento por ID (usado no Detail / Modal)
export async function getDocumentById(id: string): Promise<AdminDoc> {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/documents/${id}`, {
    credentials: "include",
    headers: { Accept: "application/json" },
  });
  return res.json();
}

// Atualiza verified (true/false/null) a partir da lista
export async function updateDocumentStatus(id: string, verified: boolean | null) {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/documents/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ verified }),
  });
  return res.json();
}
