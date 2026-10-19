"use client";

import { useEffect, useState } from "react";

interface AdminReview {
  id: string;
  productId: string;
  name: string;
  rating: number;
  comment: string;
  approved: boolean;
  createdAt: string;
  product: { name: string; slug: string };
}

function Stars({ value }: { value: number }) {
  return (
    <div className="flex text-gold-400">
      {Array.from({ length: 5 }, (_, i) => (
        <svg
          key={i}
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill={i < value ? "currentColor" : "none"}
          stroke="currentColor"
        >
          <path
            d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
            strokeWidth="1"
            strokeLinejoin="round"
          />
        </svg>
      ))}
    </div>
  );
}

export default function AdminAvaliacoesPage() {
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"PENDENTE" | "APROVADA" | "TODAS">("PENDENTE");

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/avaliacoes");
      if (res.ok) setReviews(await res.json());
    } catch {
      setError("Erro ao carregar avaliações");
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function setApproved(id: string, approved: boolean) {
    setError("");
    const res = await fetch(`/api/admin/avaliacoes/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ approved }),
    });
    if (!res.ok) {
      setError("Erro ao atualizar avaliação");
      return;
    }
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Excluir esta avaliação?")) return;
    setError("");
    const res = await fetch(`/api/admin/avaliacoes/${id}`, { method: "DELETE" });
    if (!res.ok) {
      setError("Erro ao excluir avaliação");
      return;
    }
    load();
  }

  const filtered = reviews.filter((r) => {
    if (filter === "PENDENTE") return !r.approved;
    if (filter === "APROVADA") return r.approved;
    return true;
  });
  const pendingCount = reviews.filter((r) => !r.approved).length;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="admin-title">Avaliações</h1>
          <p className="admin-subtitle">
            {pendingCount > 0
              ? `${pendingCount} avaliação(ões) aguardando aprovação`
              : "Nenhuma avaliação pendente"}
          </p>
        </div>
        <div className="flex gap-2">
          {(["PENDENTE", "APROVADA", "TODAS"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                filter === f
                  ? "bg-gold-400 text-ink"
                  : "bg-cream/5 text-cream/60 hover:bg-cream/10"
              }`}
            >
              {f === "PENDENTE" ? "Pendentes" : f === "APROVADA" ? "Aprovadas" : "Todas"}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

      <div className="admin-table-wrap mt-6">
        <table className="w-full text-sm">
          <thead className="admin-table-th">
            <tr>
              <th className="px-4 py-3">Produto</th>
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">Nota</th>
              <th className="px-4 py-3">Comentário</th>
              <th className="px-4 py-3">Data</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-cream/30">
                  Carregando...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-cream/30">
                  Nenhuma avaliação neste filtro
                </td>
              </tr>
            ) : (
              filtered.map((r) => (
                <tr key={r.id} className="admin-table-row align-top">
                  <td className="px-4 py-3 text-cream/70">{r.product?.name || "—"}</td>
                  <td className="px-4 py-3 font-medium text-cream">{r.name}</td>
                  <td className="px-4 py-3">
                    <Stars value={r.rating} />
                  </td>
                  <td className="max-w-xs px-4 py-3 text-cream/70">
                    <span className="line-clamp-3">{r.comment}</span>
                  </td>
                  <td className="px-4 py-3 text-cream/50">
                    {new Date(r.createdAt).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="px-4 py-3">
                    {r.approved ? (
                      <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs text-emerald-400">
                        Aprovada
                      </span>
                    ) : (
                      <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-xs text-amber-400">
                        Pendente
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {r.approved ? (
                      <button
                        onClick={() => setApproved(r.id, false)}
                        className="mr-3 text-cream/50 hover:underline"
                      >
                        Desaprovar
                      </button>
                    ) : (
                      <button
                        onClick={() => setApproved(r.id, true)}
                        className="mr-3 text-emerald-400 hover:underline"
                      >
                        Aprovar
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(r.id)}
                      className="text-red-400 hover:underline"
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
