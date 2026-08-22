"use client";

import { useState } from "react";
import { useCartStore } from "@/store/cartStore";
import { formatBRL } from "@/lib/format";

export function CouponBox() {
  const appliedCode = useCartStore((s) => s.appliedCode);
  const setAppliedCode = useCartStore((s) => s.setAppliedCode);
  const subtotalCents = useCartStore((s) => s.totalCents());

  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleApply(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!input.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/cupons/validar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: input, subtotalCents }),
      });
      const data = await res.json();

      if (!res.ok || !data.valid) {
        setError(data.error || "Código inválido");
        return;
      }

      setAppliedCode({ code: data.code, kind: data.kind, discountCents: data.discountCents });
      setInput("");
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  function handleRemove() {
    setAppliedCode(null);
    setError("");
  }

  if (appliedCode) {
    return (
      <div className="flex items-center justify-between border border-gold-400/40 bg-gold-50 px-4 py-3 text-sm">
        <div>
          <p className="text-ink">
            Código <strong>{appliedCode.code}</strong> aplicado
          </p>
          <p className="text-ink/60">Desconto de {formatBRL(appliedCode.discountCents)}</p>
        </div>
        <button onClick={handleRemove} className="text-xs uppercase tracking-wide text-ink/50 hover:text-ink">
          Remover
        </button>
      </div>
    );
  }

  return (
    <div>
      <form onSubmit={handleApply} className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Cupom ou código de indicação"
          className="flex-1 border border-gold-400/40 bg-white px-3 py-2 text-sm uppercase"
        />
        <button
          type="submit"
          disabled={loading}
          className="border border-ink bg-ink px-4 py-2 text-sm text-gold-400 hover:bg-gold-400 hover:text-ink disabled:opacity-50"
        >
          {loading ? "Aplicando..." : "Aplicar"}
        </button>
      </form>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}
