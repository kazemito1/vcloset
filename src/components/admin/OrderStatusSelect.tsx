"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const STATUS_OPTIONS = [
  { value: "PENDING", label: "Pendente" },
  { value: "PAID", label: "Pago" },
  { value: "FAILED", label: "Falhou" },
  { value: "CANCELED", label: "Cancelado" },
];

export function OrderStatusSelect({ orderId, currentStatus }: { orderId: string; currentStatus: string }) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleChange(newStatus: string) {
    setStatus(newStatus);
    setSaving(true);
    setError("");

    const res = await fetch(`/api/admin/pedidos/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });

    setSaving(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Erro ao atualizar status");
      setStatus(currentStatus);
      return;
    }

    router.refresh();
  }

  return (
    <div>
      <select
        value={status}
        onChange={(e) => handleChange(e.target.value)}
        disabled={saving}
        className="admin-input disabled:opacity-50"
      >
        {STATUS_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}
