"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function CreditAdjustForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [amountReais, setAmountReais] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const amountCents = Math.round(parseFloat(amountReais.replace(",", ".")) * 100);
    if (!email.includes("@") || !Number.isFinite(amountCents) || amountCents === 0) {
      setError("Informe um e-mail válido e um valor diferente de zero");
      return;
    }

    setSaving(true);
    const res = await fetch("/api/admin/creditos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, amountCents, description }),
    });
    setSaving(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Erro ao ajustar crédito");
      return;
    }

    setEmail("");
    setAmountReais("");
    setDescription("");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="admin-card grid grid-cols-1 gap-3 p-4 sm:grid-cols-4">
      <div>
        <label className="admin-label">E-mail do cliente</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="admin-input mt-1 w-full"
          placeholder="cliente@email.com"
          required
        />
      </div>
      <div>
        <label className="admin-label">Valor (R$, negativo para debitar)</label>
        <input
          value={amountReais}
          onChange={(e) => setAmountReais(e.target.value)}
          className="admin-input mt-1 w-full"
          placeholder="Ex: 20.00 ou -10.00"
          required
        />
      </div>
      <div>
        <label className="admin-label">Motivo (opcional)</label>
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="admin-input mt-1 w-full"
          placeholder="Ex: bônus de compensação"
        />
      </div>
      <div className="flex items-end">
        <button type="submit" disabled={saving} className="admin-btn-primary w-full">
          {saving ? "Salvando..." : "Aplicar ajuste"}
        </button>
      </div>
      {error && <p className="sm:col-span-4 text-sm text-red-400">{error}</p>}
    </form>
  );
}
