"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export function ObrigadoContent() {
  const [processing, setProcessing] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setProcessing(false), 10000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="bg-ink py-20 text-cream">
      <div className="mx-auto max-w-md rounded-2xl border border-gold-400/15 bg-ink-soft px-8 py-12 text-center shadow-gold">
        <img
          src="/logo-vcloset-plain.svg"
          alt="VCLOSET — Joias e Acessórios"
          className="mx-auto h-auto w-48"
        />

        <div className="mx-auto my-8 flex items-center justify-center gap-3">
          <span className="h-px w-16 bg-gold-400/20" />
          <span className="h-1.5 w-1.5 rotate-45 border border-gold-400" />
          <span className="h-px w-16 bg-gold-400/20" />
        </div>

        {processing ? (
          <div className="space-y-6">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-gold-400/40 bg-gold-400/10">
              <svg
                className="h-6 w-6 animate-spin text-gold-400"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </div>
            <h2 className="text-lg font-semibold">Processando seu pedido Vcloset</h2>
            <p className="text-sm leading-relaxed text-cream/60">
              Estamos conectando com a operadora do cartão. Por favor, aguarde
              alguns instantes.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-gold-400/40 bg-gold-400/10">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6 text-gold-400"
                aria-hidden="true"
              >
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </div>

            <h2 className="text-lg font-semibold">Pedido recebido!</h2>
            <p className="text-sm leading-relaxed text-cream/60">
              Obrigado por comprar no nosso site. Estamos processando o seu
              pagamento junto à operadora do cartão. Você receberá um e-mail
              quando o seu pagamento for confirmado.
            </p>

            <Link
              href="/"
              className="mt-8 inline-flex h-11 w-full items-center justify-center rounded-full bg-gold-400 text-xs font-bold uppercase tracking-widest2 text-ink transition hover:bg-gold-300"
            >
              Continuar comprando
            </Link>
          </div>
        )}

        <p className="mt-6 text-[11px] tracking-wide text-cream/40">
          Todos os direitos reservados VCLOSET STORE LTDA
        </p>
      </div>
    </div>
  );
}
