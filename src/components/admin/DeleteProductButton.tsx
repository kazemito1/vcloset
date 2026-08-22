"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function DeleteProductButton({ id }: { id: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm("Excluir este produto? Esta ação não pode ser desfeita.")) return;
    setDeleting(true);
    setError("");

    const res = await fetch(`/api/admin/produtos/${id}`, { method: "DELETE" });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Erro ao excluir produto");
      setDeleting(false);
      return;
    }

    router.push("/admin/produtos");
    router.refresh();
  }

  return (
    <div className="mt-8 border-t border-gold-400/15 pt-6">
      <button
        onClick={handleDelete}
        disabled={deleting}
        className="admin-btn-danger"
      >
        {deleting ? "Excluindo..." : "Excluir produto"}
      </button>
      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
    </div>
  );
}
