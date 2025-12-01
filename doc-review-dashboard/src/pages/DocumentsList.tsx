import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listDocuments, updateDocumentStatus, type AdminDoc } from "@/api";
import { useState } from "react";

export default function DocumentsList() {
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<"PENDING" | "APPROVED" | "REJECTED" | undefined>(undefined);
  const [selectedUser, setSelectedUser] = useState<AdminDoc["user"] & { category?: string; plan?: string } | null>(null);

  const { data: docs, isLoading } = useQuery({
    queryKey: ["admin-docs", statusFilter],
    queryFn: () => listDocuments({ status: statusFilter }),
  });

  const mut = useMutation({
    mutationFn: ({ id, verified }: { id: string; verified: boolean }) =>
      updateDocumentStatus(id, verified),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-docs"] }),
  });

  if (isLoading) return <p>Carregando...</p>;
  if (!docs?.length) return <p>Nenhum documento encontrado</p>;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Documentos</h2>

      <select
        value={statusFilter || ""}
        onChange={(e) =>
          setStatusFilter(e.target.value ? (e.target.value as any) : undefined)
        }
        className="border p-2 rounded"
      >
        <option value="">Todos</option>
        <option value="PENDING">Análise</option>
        <option value="APPROVED">Aprovado</option>
        <option value="REJECTED">Reprovado</option>
      </select>

      <table className="w-full border-collapse border border-slate-700">
        <thead>
          <tr className="bg-slate-800 text-white">
            <th className="p-2 border border-slate-700">Usuário</th>
            <th className="p-2 border border-slate-700">Documento</th>
            <th className="p-2 border border-slate-700">Status</th>
          </tr>
        </thead>
        <tbody>
          {docs.map((doc: AdminDoc) => (
            <tr key={doc.id} className="border border-slate-700">
              <td className="p-2 border border-slate-700">
                {doc.user ? (
                  <button
                    onClick={() =>
                      setSelectedUser({
                        ...doc.user,
                        category: (doc as any).categoryName,
                        plan: (doc as any).planName
                      })
                    }
                    className="text-blue-500 underline hover:text-blue-700"
                  >
                    {doc.user.name || doc.user.email}
                  </button>
                ) : (
                  "-"
                )}
              </td>
              <td className="p-2 border border-slate-700">
                <a
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 underline"
                >
                  Abrir
                </a>
              </td>
              <td className="p-2 border border-slate-700">
                <select
                  value={
                    doc.verified === true
                      ? "APPROVED"
                      : doc.verified === false
                      ? "REJECTED"
                      : "PENDING"
                  }
                  onChange={(e) => {
                    const val = e.target.value;
                    mut.mutate({
                      id: doc.id,
                      verified: val === "APPROVED" ? true : false
                    });
                  }}
                  className="border p-1 rounded"
                  disabled={mut.isPending}
                >
                  <option value="PENDING">Análise</option>
                  <option value="APPROVED">Aprovado</option>
                  <option value="REJECTED">Reprovado</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 shadow-lg">
            <h3 className="text-lg font-bold mb-4">Informações do Usuário</h3>
            <p><strong>Nome:</strong> {selectedUser.name || "—"}</p>
            <p><strong>Email:</strong> {selectedUser.email}</p>
            <p><strong>Telefone:</strong> {selectedUser.phone || "—"}</p>
            <p><strong>Categoria:</strong> {selectedUser.category || "—"}</p>
            <p><strong>Plano:</strong> {selectedUser.plan || "—"}</p>

            {selectedUser.phone && (
              <a
                href={`https://api.whatsapp.com/send?phone=55${selectedUser.phone}&text=Ola+${encodeURIComponent(selectedUser.name || "")}%2C+sou+da+equipe+de+atendimento+Asociaut+e+estou+revisando+seus+documentos.`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-block bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
              >
                Abrir WhatsApp
              </a>
            )}

            <div className="mt-4 text-right">
              <button
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
