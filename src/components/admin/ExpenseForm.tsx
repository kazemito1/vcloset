"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const CATEGORIES = ["Aluguel", "Fornecedores", "Marketing", "Frete", "Salários", "Outros"];

export function ExpenseForm() {
  const router = useRouter();
  const [description, setDescription] = useState("");
  const [amountReais, setAmountReais] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const amountCents = Math.round(parseFloat(amountReais.replace(",", ".")) * 100);
    if (!description.trim() || isNaN(amountCents) || amountCents <= 0) {
      setError("Preencha a descrição e um valor válido");
      return;
    }

    setSaving(true);
    const res = await fetch("/api/admin/financeiro/despesas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description, amountCents, category, date }),
    });
    setSaving(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Erro ao cadastrar despesa");
      return;
    }

    setDescription("");
    setAmountReais("");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="admin-card grid grid-cols-1 gap-3 p-4 sm:grid-cols-5">
      <div className="sm:col-span-2">
        <label className="admin-label">Descrição</label>
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="admin-input mt-1 w-full"
          placeholder="Ex: Aluguel da loja"
          required
        />
      </div>
      <div>
        <label className="admin-label">Valor (R$)</label>
        <input
          value={amountReais}
          onChange={(e) => setAmountReais(e.target.value)}
          className="admin-input mt-1 w-full"
          placeholder="150.00"
          required
        />
      </div>
      <div>
        <label className="admin-label">Categoria</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="admin-input mt-1 w-full"
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="admin-label">Data</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="admin-input mt-1 w-full"
        />
      </div>

      {error && <p className="sm:col-span-5 text-sm text-red-400">{error}</p>}

      <div className="sm:col-span-5">
        <button type="submit" disabled={saving} className="admin-btn-primary">
          {saving ? "Salvando..." : "Adicionar despesa"}
        </button>
      </div>
    </form>
  );
}
