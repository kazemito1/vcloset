"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface CouponFormValues {
  id?: string;
  code: string;
  type: "PERCENT" | "FIXED";
  value: number;
  active: boolean;
  expiresAt?: string | null;
  maxUses?: number | null;
  minOrderValueCents?: number | null;
}

interface Props {
  initial?: CouponFormValues;
}

export function CouponForm({ initial }: Props) {
  const router = useRouter();
  const isEditing = !!initial?.id;

  const [code, setCode] = useState(initial?.code || "");
  const [type, setType] = useState<"PERCENT" | "FIXED">(initial?.type || "PERCENT");
  const [value, setValue] = useState(
    initial ? (type === "FIXED" ? (initial.value / 100).toFixed(2) : String(initial.value)) : ""
  );
  const [active, setActive] = useState(initial?.active ?? true);
  const [expiresAt, setExpiresAt] = useState(
    initial?.expiresAt ? initial.expiresAt.slice(0, 10) : ""
  );
  const [maxUses, setMaxUses] = useState(initial?.maxUses ? String(initial.maxUses) : "");
  const [minOrderReais, setMinOrderReais] = useState(
    initial?.minOrderValueCents ? (initial.minOrderValueCents / 100).toFixed(2) : ""
  );
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!code.trim()) {
      setError("Informe o código do cupom");
      return;
    }

    const parsedValue =
      type === "FIXED"
        ? Math.round(parseFloat(value.replace(",", ".")) * 100)
        : parseInt(value, 10);

    if (isNaN(parsedValue) || parsedValue <= 0) {
      setError("Informe um valor de desconto válido");
      return;
    }

    if (type === "PERCENT" && parsedValue > 100) {
      setError("Percentual não pode ser maior que 100");
      return;
    }

    const payload = {
      code,
      type,
      value: parsedValue,
      active,
      expiresAt: expiresAt || null,
      maxUses: maxUses ? parseInt(maxUses, 10) : null,
      minOrderValueCents: minOrderReais
        ? Math.round(parseFloat(minOrderReais.replace(",", ".")) * 100)
        : null,
    };

    setSaving(true);
    const url = isEditing ? `/api/admin/cupons/${initial!.id}` : "/api/admin/cupons";
    const method = isEditing ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setSaving(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Erro ao salvar cupom");
      return;
    }

    router.push("/admin/cupons");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 max-w-xl space-y-5">
      <div>
        <label className="admin-label">Código do cupom</label>
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="Ex: BEMVINDO10"
          className="admin-input mt-1 w-full uppercase"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="admin-label">Tipo de desconto</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as "PERCENT" | "FIXED")}
            className="admin-input mt-1 w-full"
          >
            <option value="PERCENT">Percentual (%)</option>
            <option value="FIXED">Valor fixo (R$)</option>
          </select>
        </div>
        <div>
          <label className="admin-label">
            Valor {type === "PERCENT" ? "(%)" : "(R$)"}
          </label>
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={type === "PERCENT" ? "Ex: 10" : "Ex: 20.00"}
            className="admin-input mt-1 w-full"
            required
          />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-cream/70">
        <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
        Cupom ativo
      </label>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="admin-label">Válido até (opcional)</label>
          <input
            type="date"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
            className="admin-input mt-1 w-full"
          />
        </div>
        <div>
          <label className="admin-label">Limite de usos (opcional)</label>
          <input
            type="number"
            value={maxUses}
            onChange={(e) => setMaxUses(e.target.value)}
            placeholder="Ilimitado"
            className="admin-input mt-1 w-full"
          />
        </div>
      </div>

      <div>
        <label className="admin-label">Pedido mínimo em R$ (opcional)</label>
        <input
          value={minOrderReais}
          onChange={(e) => setMinOrderReais(e.target.value)}
          placeholder="Sem mínimo"
          className="admin-input mt-1 w-full"
        />
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="flex gap-3">
        <button type="submit" disabled={saving} className="admin-btn-primary">
          {saving ? "Salvando..." : isEditing ? "Salvar alterações" : "Criar cupom"}
        </button>
      </div>
    </form>
  );
}
