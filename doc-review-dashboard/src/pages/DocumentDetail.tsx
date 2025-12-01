// doc-review-dashboard/src/pages/DocumentDetail.tsx
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listDocuments, updateDocumentStatus, type AdminDoc } from "@/api";
import { useMemo } from "react";

const tierMap: Record<string, string> = {
  BRONZE: "Bronze",
  PRATA: "Prata",
  OURO: "Ouro",
};

export default function DocumentDetail() {
  const qc = useQueryClient();

  const { data: docs, isLoading } = useQuery({
    queryKey: ["admin-docs"],
    queryFn: () => listDocuments(),
  });

  // só para demonstrar, usa o primeiro documento
  const doc: AdminDoc | undefined = docs?.[0];

  const mut = useMutation({
    mutationFn: ({ id, verified }: { id: string; verified: boolean | null }) =>
      updateDocumentStatus(id, verified),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-docs"] }),
  });

  // ====== Acessos "seguros" (sem quebrar TS) ======
  // o backend retorna user.category.title e subscriptions[0].plan.{displayName,tier}
  const user: any = doc?.user ?? undefined;
  const categoryTitle: string = user?.category?.title ?? "—";

  const planName = useMemo(() => {
    const p = user?.subscriptions?.[0]?.plan;
    if (!p) return "—";
    return p.displayName ?? (p.tier ? tierMap[String(p.tier)] : "—");
  }, [user]);

  const uploadedAt =
    (doc as any)?.uploadedAt
      ? new Date((doc as any).uploadedAt).toLocaleString()
      : "—";

  const statusValue =
    doc?.verified === true
      ? "APPROVED"
      : doc?.verified === false
      ? "REJECTED"
      : "PENDING";

  if (isLoading) return <p>Carregando…</p>;
  if (!doc) return <p>Nenhum documento.</p>;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Detalhe do Documento</h2>

      <div className="text-sm space-y-1">
        <div><b>Código:</b> {doc.code}</div>
        <div><b>Enviado em:</b> {uploadedAt}</div>
        <div>
          <a
            className="text-blue-500 underline"
            href={doc.url}
            target="_blank"
            rel="noreferrer"
          >
            Abrir arquivo
          </a>
        </div>
      </div>

      <div className="mt-4 p-3 rounded-md border">
        <h3 className="font-semibold mb-2">Usuário</h3>
        <div className="space-y-1">
          <div><b>Nome:</b> {user?.name ?? "—"}</div>
          <div><b>Email:</b> {user?.email ?? "—"}</div>
          <div><b>Telefone:</b> {user?.phone ?? "—"}</div>
          <div><b>Categoria:</b> {categoryTitle}</div>
          <div><b>Plano:</b> {planName}</div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <label className="text-sm font-medium">Status:</label>
        <select
          className="border rounded p-1"
          value={statusValue}
          onChange={(e) => {
            const v = e.target.value;
            const verified =
              v === "APPROVED" ? true : v === "REJECTED" ? false : null;
            if (doc?.id) mut.mutate({ id: doc.id, verified });
          }}
          disabled={mut.isPending}
        >
          <option value="PENDING">Análise</option>
          <option value="APPROVED">Aprovado</option>
          <option value="REJECTED">Reprovado</option>
        </select>
      </div>
    </div>
  );
}
