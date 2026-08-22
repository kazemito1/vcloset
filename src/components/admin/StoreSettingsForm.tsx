"use client";

import { useEffect, useState } from "react";

interface Settings {
  storeName: string;
  storeSlogan: string | null;
  freeShippingCents: number;
  whatsappNumber: string;
  instagramUrl: string | null;
  facebookUrl: string | null;
  tiktokUrl: string | null;
  referralCreditCents: number;
}

export function StoreSettingsForm() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [freeShippingReais, setFreeShippingReais] = useState("");
  const [referralCreditReais, setReferralCreditReais] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/configuracoes")
      .then((res) => res.json())
      .then((data: Settings) => {
        setSettings(data);
        setFreeShippingReais((data.freeShippingCents / 100).toFixed(2));
        setReferralCreditReais((data.referralCreditCents / 100).toFixed(2));
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);
    setError("");
    setMessage("");

    const freeShippingCents = Math.round(parseFloat(freeShippingReais.replace(",", ".")) * 100);
    const referralCreditCents = Math.round(
      parseFloat(referralCreditReais.replace(",", ".")) * 100
    );

    try {
      const res = await fetch("/api/admin/configuracoes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...settings, freeShippingCents, referralCreditCents }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erro ao salvar configurações");
        return;
      }
      setSettings(data);
      setMessage("Configurações salvas com sucesso.");
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setSaving(false);
    }
  }

  if (loading || !settings) {
    return <p className="text-cream/50">Carregando configurações...</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="admin-card max-w-2xl space-y-5 p-6">
      <div>
        <label className="admin-label">Nome da loja</label>
        <input
          className="admin-input mt-1 w-full"
          value={settings.storeName}
          onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
        />
      </div>

      <div>
        <label className="admin-label">Slogan</label>
        <input
          className="admin-input mt-1 w-full"
          value={settings.storeSlogan || ""}
          onChange={(e) => setSettings({ ...settings, storeSlogan: e.target.value })}
          placeholder="Ex: Joias atemporais para momentos únicos"
        />
      </div>

      <div>
        <label className="admin-label">Valor mínimo para frete grátis (R$)</label>
        <input
          className="admin-input mt-1 w-full"
          type="text"
          inputMode="decimal"
          value={freeShippingReais}
          onChange={(e) => setFreeShippingReais(e.target.value)}
          placeholder="299.00"
        />
      </div>

      <div>
        <label className="admin-label">Número do WhatsApp (com DDI e DDD, só números)</label>
        <input
          className="admin-input mt-1 w-full"
          value={settings.whatsappNumber}
          onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
          placeholder="5511999999999"
        />
      </div>

      <div>
        <label className="admin-label">Crédito de indicação (R$ por indicação confirmada)</label>
        <input
          className="admin-input mt-1 w-full"
          type="text"
          inputMode="decimal"
          value={referralCreditReais}
          onChange={(e) => setReferralCreditReais(e.target.value)}
          placeholder="10.00"
        />
        <p className="mt-1 text-xs text-cream/40">
          Valor único e global creditado ao indicador quando um pedido feito com o código dele
          for confirmado (pago).
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="admin-label">Instagram (URL)</label>
          <input
            className="admin-input mt-1 w-full"
            value={settings.instagramUrl || ""}
            onChange={(e) => setSettings({ ...settings, instagramUrl: e.target.value })}
            placeholder="https://instagram.com/..."
          />
        </div>
        <div>
          <label className="admin-label">Facebook (URL)</label>
          <input
            className="admin-input mt-1 w-full"
            value={settings.facebookUrl || ""}
            onChange={(e) => setSettings({ ...settings, facebookUrl: e.target.value })}
            placeholder="https://facebook.com/..."
          />
        </div>
        <div>
          <label className="admin-label">TikTok (URL)</label>
          <input
            className="admin-input mt-1 w-full"
            value={settings.tiktokUrl || ""}
            onChange={(e) => setSettings({ ...settings, tiktokUrl: e.target.value })}
            placeholder="https://tiktok.com/@..."
          />
        </div>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}
      {message && <p className="text-sm text-green-400">{message}</p>}

      <button type="submit" disabled={saving} className="admin-btn-primary">
        {saving ? "Salvando..." : "Salvar configurações"}
      </button>
    </form>
  );
}
