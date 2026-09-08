"use client";

import Link from "next/link";
import { WHATSAPP_NUMBER } from "@/lib/constants";

// Tela exibida quando o cartão é recusado (ex.: reuso de cartão bloqueado).
// Mesmo padrão visual da página "Pedido recebido" (/obrigado).
export function PagamentoRecusadoContent() {
  const whatsappHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    "Olá! Tive um problema com o pagamento do meu pedido no site."
  )}`;

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
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </div>

          <h2 className="text-lg font-semibold">Não foi possível concluir o pagamento</h2>
          <p className="text-sm leading-relaxed text-cream/60">
            Houve um problema ao processar as informações do seu cartão, tente
            outra forma de pagamento ou entre em contato conosco.
          </p>

          <Link
            href="/checkout"
            className="mt-8 inline-flex h-11 w-full items-center justify-center rounded-full bg-gold-400 text-xs font-bold uppercase tracking-widest2 text-ink transition hover:bg-gold-300"
          >
            Tentar outra forma de pagamento
          </Link>
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-11 w-full items-center justify-center rounded-full border border-gold-400/50 text-xs font-bold uppercase tracking-widest2 text-gold-400 transition hover:bg-gold-400/10"
          >
            Falar no WhatsApp
          </a>
        </div>

        <p className="mt-6 text-[11px] tracking-wide text-cream/40">
          Todos os direitos reservados VCLOSET STORE LTDA
        </p>
      </div>
    </div>
  );
}
