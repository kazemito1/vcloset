"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function DeleteCouponButton({ id }: { id: string }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    if (!confirm("Tem certeza que deseja excluir este cupom?")) return;

    setDeleting(true);
    const res = await fetch(`/api/admin/cupons/${id}`, { method: "DELETE" });
    setDeleting(false);

    if (!res.ok) {
      setError("Erro ao excluir cupom");
      return;
    }

    router.push("/admin/cupons");
    router.refresh();
  }

  return (
    <div className="mt-8 border-t border-gold-400/15 pt-6">
      <button onClick={handleDelete} disabled={deleting} className="admin-btn-danger">
        {deleting ? "Excluindo..." : "Excluir cupom"}
      </button>
      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
    </div>
  );
}
