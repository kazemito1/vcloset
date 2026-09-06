import Link from "next/link";

export const metadata = {
  title: "Pedido recebido — V.CLOSET",
};

export default function ObrigadoPage() {
  return (
    <div className="bg-ink py-20 text-cream">
      <div className="mx-auto max-w-md rounded-2xl border border-gold-400/15 bg-ink-soft px-8 py-12 text-center shadow-gold">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full border border-gold-400/40 bg-gold-400/10">
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

        <p className="text-[10px] font-medium uppercase tracking-[0.5em] text-cream/50">
          Checkout
        </p>
        <h1 className="mt-2 font-serif text-3xl font-medium tracking-widest2 text-cream">
          <span className="text-gold-400">V</span>CLOSET
        </h1>

        <div className="mx-auto my-6 flex items-center justify-center gap-3">
          <span className="h-px w-16 bg-gold-400/20" />
          <span className="h-1.5 w-1.5 rotate-45 border border-gold-400" />
          <span className="h-px w-16 bg-gold-400/20" />
        </div>

        <h2 className="text-lg font-semibold">Pedido recebido!</h2>
        <p className="mt-3 text-sm leading-relaxed text-cream/60">
          Obrigado por comprar no nosso site. Estamos processando o seu
          pagamento junto à operadora do cartão. Você receberá um e-mail quando
          o seu pagamento for confirmado.
        </p>

        <Link
          href="/"
          className="mt-8 inline-flex h-11 w-full items-center justify-center rounded-full bg-gold-400 text-xs font-bold uppercase tracking-widest2 text-ink transition hover:bg-gold-300"
        >
          Continuar comprando
        </Link>

        <p className="mt-6 text-[11px] tracking-wide text-cream/40">
          Todos os direitos reservados VCLOSET STORE LTDA
        </p>
      </div>
    </div>
  );
}
