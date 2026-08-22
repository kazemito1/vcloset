import { formatBRL } from "@/lib/format";

function getBadges(freeShippingCents?: number) {
  return [
  {
    label: "Frete grátis",
    description: freeShippingCents ? `Acima de ${formatBRL(freeShippingCents)}` : "Acima de R$ 299",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path
          d="M3 7h11v10H3zM14 10h4l3 3v4h-7v-7zM6.5 21a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM17.5 21a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    label: "Parcelamento sem juros",
    description: "Em até 6x no cartão",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path
          d="M3 5h18v14H3zM3 9h18M7 15h4"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    label: "Compra 100% segura",
    description: "Dados protegidos",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path
          d="M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-4z"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    label: "Troca fácil",
    description: "Até 30 dias",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path
          d="M4 4v5h5M20 20v-5h-5M4.5 15a8 8 0 0014.9 2.5M19.5 9a8 8 0 00-14.9-2.5"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  ];
}

export function TrustBadges({ freeShippingCents }: { freeShippingCents?: number }) {
  const badges = getBadges(freeShippingCents);
  return (
    <section className="border-y border-gold-400/20 bg-white py-12">
      <div className="container-page grid grid-cols-2 gap-8 md:grid-cols-4">
        {badges.map((badge) => (
          <div key={badge.label} className="flex flex-col items-center gap-3 text-center">
            <span className="text-gold-600">{badge.icon}</span>
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-ink">
                {badge.label}
              </p>
              <p className="mt-1 text-xs text-ink/50">{badge.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
