"use client";

import { useState } from "react";
import { useCartStore } from "@/store/cartStore";
import { formatBRL } from "@/lib/format";
import { getShippingEstimateByCep, isValidCepFormat, maskCep } from "@/lib/shipping";

interface ViaCepResponse {
  cep: string;
  logradouro: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

interface EstimateResult {
  city?: string;
  state?: string;
  minDays: number;
  maxDays: number;
  priceCents: number;
}

export function ShippingEstimate({ freeShippingCents }: { freeShippingCents: number }) {
  // Se o valor já no carrinho ultrapassa o mínimo para frete grátis, a estimativa
  // deve mostrar "Frete grátis" independente do CEP consultado.
  const cartTotalCents = useCartStore((s) => s.totalCents());
  const qualifiesForFreeShipping = cartTotalCents >= freeShippingCents;

  const [cep, setCep] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<EstimateResult | null>(null);

  function handleChange(value: string) {
    setCep(maskCep(value));
    setResult(null);
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);

    if (!isValidCepFormat(cep)) {
      setError("Informe um CEP válido, no formato 00000-000.");
      return;
    }

    setLoading(true);
    try {
      const digits = cep.replace(/\D/g, "");
      const estimate = getShippingEstimateByCep(digits);

      let city: string | undefined;
      let state: string | undefined;

      try {
        const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
        if (res.ok) {
          const data: ViaCepResponse = await res.json();
          if (data.erro) {
            setError("CEP não encontrado. Verifique o número informado.");
            setLoading(false);
            return;
          }
          city = data.localidade;
          state = data.uf;
        }
      } catch {
        // Falha ao consultar ViaCEP não impede a estimativa: seguimos apenas
        // sem os dados de cidade/UF, já que a estimativa é local (por dígito do CEP).
      }

      setResult({
        city,
        state,
        minDays: estimate.minDays,
        maxDays: estimate.maxDays,
        priceCents: estimate.priceCents,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="bg-white py-16 md:py-24">
      <div className="container-page">
        <h2 className="section-title">Consulte o frete para sua região</h2>
        <p className="mx-auto mt-4 max-w-xl text-center text-ink/60">
          Informe seu CEP e veja uma estimativa de prazo e valor de entrega.
        </p>

        <div className="mx-auto mt-10 max-w-md">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              value={cep}
              onChange={(e) => handleChange(e.target.value)}
              placeholder="00000-000"
              inputMode="numeric"
              maxLength={9}
              aria-label="CEP"
              className="flex-1 border border-gold-400/40 bg-white px-4 py-3 text-sm text-ink placeholder:text-ink/40 focus:border-gold-400 focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading}
              className="border border-ink bg-ink px-6 py-3 text-sm uppercase tracking-wide text-gold-400 transition-colors hover:bg-gold-400 hover:text-ink disabled:opacity-50"
            >
              {loading ? "Consultando..." : "Consultar"}
            </button>
          </form>

          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

          {result && (
            <div className="mt-6 border border-gold-400/30 bg-gold-50/40 p-5 text-sm text-ink">
              {result.city && result.state && (
                <p className="text-ink/70">
                  Entrega para <strong>{result.city}/{result.state}</strong>
                </p>
              )}
              <div className="mt-2 flex items-center justify-between">
                <span className="text-ink/70">Prazo estimado</span>
                <span className="font-serif text-lg">
                  {result.minDays === result.maxDays
                    ? `${result.minDays} dia(s) útil(eis)`
                    : `${result.minDays} a ${result.maxDays} dias úteis`}
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between border-t border-gold-400/20 pt-2">
                <span className="text-ink/70">Valor do frete</span>
                <span className="font-serif text-lg text-gold-600">
                  {qualifiesForFreeShipping ? "Frete grátis" : formatBRL(result.priceCents)}
                </span>
              </div>
              <p className="mt-3 text-xs text-ink/40">
                {qualifiesForFreeShipping
                  ? `Seu carrinho já ultrapassa ${formatBRL(freeShippingCents)}, garantindo frete grátis.`
                  : `Compre acima de ${formatBRL(freeShippingCents)} e ganhe frete grátis. Estimativa aproximada — o valor definitivo é calculado no checkout.`}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
