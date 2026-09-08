"use client";

import { useEffect, useRef, useState } from "react";
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
  street?: string;
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
  // Reconhecimento automático: nome da rua do CEP digitado (ViaCEP)
  const [street, setStreet] = useState<string | null>(null);
  const [streetLookup, setStreetLookup] = useState(false);
  const lookupSeq = useRef(0);

  function handleChange(value: string) {
    setCep(maskCep(value));
    setResult(null);
    setError(null);
    setStreet(null);
  }

  // Quando o CEP completa 8 dígitos, reconhece automaticamente e mostra
  // o nome da rua correspondente.
  useEffect(() => {
    const digits = cep.replace(/\D/g, "");
    if (digits.length !== 8) {
      setStreet(null);
      return;
    }
    const seq = ++lookupSeq.current;
    setStreetLookup(true);
    (async () => {
      try {
        const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
        if (seq !== lookupSeq.current) return;
        if (res.ok) {
          const data: ViaCepResponse = await res.json();
          if (!data.erro && data.logradouro) {
            setStreet(data.logradouro);
          } else {
            setStreet(null);
          }
        } else {
          setStreet(null);
        }
      } catch {
        if (seq === lookupSeq.current) setStreet(null);
      } finally {
        if (seq === lookupSeq.current) setStreetLookup(false);
      }
    })();
  }, [cep]);

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

      let streetName: string | undefined;
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
          streetName = data.logradouro || undefined;
          city = data.localidade;
          state = data.uf;
        }
      } catch {
        // Falha ao consultar ViaCEP não impede a estimativa: seguimos apenas
        // sem os dados de endereço, já que a estimativa é local (por dígito do CEP).
      }

      setResult({
        street: streetName,
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
    <section className="bg-cream py-16 md:py-24">
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
              className="flex-1 border border-gold-400/40 bg-neutral-50 px-4 py-3 text-sm text-ink placeholder:text-ink/40 focus:border-gold-400 focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading}
              className="border border-ink bg-ink px-6 py-3 text-sm uppercase tracking-wide text-gold-400 transition-colors hover:bg-gold-400 hover:text-ink disabled:opacity-50"
            >
              {loading ? "Consultando..." : "Consultar"}
            </button>
          </form>

          {streetLookup && (
            <p className="mt-3 text-sm text-ink/50">Reconhecendo endereço…</p>
          )}
          {street && !streetLookup && (
            <p className="mt-3 text-sm text-ink/70">
              <svg
                className="mr-1 inline h-4 w-4 align-text-bottom text-gold-600"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              {street}
            </p>
          )}

          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

          {result && (
            <div className="mt-6 border border-gold-400/30 bg-gold-50/70 p-5 text-sm text-ink">
              {result.street ? (
                <p className="text-ink/70">
                  Entrega para <strong>{result.street}</strong>
                  {result.city && result.state && (
                    <> — {result.city}/{result.state}</>
                  )}
                </p>
              ) : (
                result.city && result.state && (
                  <p className="text-ink/70">
                    Entrega para <strong>{result.city}/{result.state}</strong>
                  </p>
                )
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
