"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface ReferralFormValues {
  id?: string;
  code?: string;
  referrerName: string;
  referrerEmail: string;
  active: boolean;
  referredDiscountType: "PERCENT" | "FIXED";
  referredDiscountValue: number;
  rewardType: "PERCENT" | "FIXED";
  rewardValue: number;
}

interface Props {
  initial?: ReferralFormValues;
}

export function ReferralForm({ initial }: Props) {
  const router = useRouter();
  const isEditing = !!initial?.id;

  const [referrerName, setReferrerName] = useState(initial?.referrerName || "");
  const [referrerEmail, setReferrerEmail] = useState(initial?.referrerEmail || "");
  const [active, setActive] = useState(initial?.active ?? true);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [referredDiscountType, setReferredDiscountType] = useState<"PERCENT" | "FIXED">(
    initial?.referredDiscountType || "PERCENT"
  );
  const [referredDiscountValue, setReferredDiscountValue] = useState(
    String(initial?.referredDiscountValue ?? 10)
  );
  const [rewardType, setRewardType] = useState<"PERCENT" | "FIXED">(
    initial?.rewardType || "FIXED"
  );
  const [rewardValue, setRewardValue] = useState(
    initial
      ? initial.rewardType === "FIXED"
        ? (initial.rewardValue / 100).toFixed(2)
        : String(initial.rewardValue)
      : "20.00"
  );

  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!referrerName.trim() || !referrerEmail.trim()) {
      setError("Nome e e-mail do indicador são obrigatórios");
      return;
    }

    const parsedReferredValue =
      referredDiscountType === "FIXED"
        ? Math.round(parseFloat(referredDiscountValue.replace(",", ".")) * 100)
        : parseInt(referredDiscountValue, 10);
    const parsedRewardValue =
      rewardType === "FIXED"
        ? Math.round(parseFloat(rewardValue.replace(",", ".")) * 100)
        : parseInt(rewardValue, 10);

    if (isNaN(parsedReferredValue) || parsedReferredValue <= 0) {
      setError("Informe um desconto válido para o indicado");
      return;
    }
    if (isNaN(parsedRewardValue) || parsedRewardValue <= 0) {
      setError("Informe uma recompensa válida para o indicador");
      return;
    }

    const payload = {
      referrerName,
      referrerEmail,
      active,
      referredDiscountType,
      referredDiscountValue: parsedReferredValue,
      rewardType,
      rewardValue: parsedRewardValue,
    };

    setSaving(true);
    const url = isEditing ? `/api/admin/indicacoes/${initial!.id}` : "/api/admin/indicacoes";
    const method = isEditing ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setSaving(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Erro ao salvar indicação");
      return;
    }

    router.push("/admin/indicacoes");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 max-w-xl space-y-5">
      {initial?.code && (
        <div>
          <label className="admin-label">Código de indicação</label>
          <p className="admin-input mt-1 w-full font-mono text-gold-400">{initial.code}</p>
        </div>
      )}

      <div>
        <label className="admin-label">Nome do indicador</label>
        <input
          value={referrerName}
          onChange={(e) => setReferrerName(e.target.value)}
          placeholder="Ex: Maria Silva"
          className="admin-input mt-1 w-full"
          required
        />
      </div>

      <div>
        <label className="admin-label">E-mail do indicador</label>
        <input
          type="email"
          value={referrerEmail}
          onChange={(e) => setReferrerEmail(e.target.value)}
          placeholder="Ex: maria@email.com"
          className="admin-input mt-1 w-full"
          required
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-cream/70">
        <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
        Indicação ativa
      </label>

      <button
        type="button"
        onClick={() => setShowAdvanced((v) => !v)}
        className="text-sm text-gold-400 hover:underline"
      >
        {showAdvanced ? "Ocultar" : "Personalizar"} desconto e recompensa (opcional)
      </button>

      {showAdvanced && (
        <div className="space-y-4 border border-gold-400/15 p-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="admin-label">Desconto do indicado</label>
              <select
                value={referredDiscountType}
                onChange={(e) => setReferredDiscountType(e.target.value as "PERCENT" | "FIXED")}
                className="admin-input mt-1 w-full"
              >
                <option value="PERCENT">Percentual (%)</option>
                <option value="FIXED">Valor fixo (R$)</option>
              </select>
            </div>
            <div>
              <label className="admin-label">
                Valor {referredDiscountType === "PERCENT" ? "(%)" : "(R$)"}
              </label>
              <input
                value={referredDiscountValue}
                onChange={(e) => setReferredDiscountValue(e.target.value)}
                className="admin-input mt-1 w-full"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="admin-label">Recompensa do indicador</label>
              <select
                value={rewardType}
                onChange={(e) => setRewardType(e.target.value as "PERCENT" | "FIXED")}
                className="admin-input mt-1 w-full"
              >
                <option value="FIXED">Valor fixo (R$)</option>
                <option value="PERCENT">Percentual (%)</option>
              </select>
            </div>
            <div>
              <label className="admin-label">
                Valor {rewardType === "PERCENT" ? "(%)" : "(R$)"}
              </label>
              <input
                value={rewardValue}
                onChange={(e) => setRewardValue(e.target.value)}
                className="admin-input mt-1 w-full"
              />
            </div>
          </div>
        </div>
      )}

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="flex gap-3">
        <button type="submit" disabled={saving} className="admin-btn-primary">
          {saving ? "Salvando..." : isEditing ? "Salvar alterações" : "Criar indicação"}
        </button>
      </div>
    </form>
  );
}
