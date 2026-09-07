import Image from "next/image";
import Link from "next/link";
import { ORDER_STATUS_LABEL, type OrderStatus } from "@/lib/orderStatus";
import { WHATSAPP_NUMBER } from "@/lib/constants";

interface OrderItem {
  productName: string;
  quantity: number;
  unitPriceCents: number;
  productSlug?: string;
  image?: string;
}

export interface OrderRow {
  id: string;
  fullName: string;
  createdAt: string;
  itemsJson: string;
  subtotalCents: number;
  discountCents: number;
  totalCents: number;
  installments: string;
  paymentMethod: string;
  status: OrderStatus;
}

function formatBRL(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function statusBadgeClass(status: OrderStatus): string {
  switch (status) {
    case "ENVIADO":
      return "border-sky-400/40 bg-sky-400/10 text-sky-300";
    case "PAGO":
      return "border-emerald-400/40 bg-emerald-400/10 text-emerald-300";
    case "WHATSAPP":
      return "border-[#25D366]/50 bg-[#25D366]/10 text-[#4ae08a]";
    default:
      return "border-amber-400/40 bg-amber-400/10 text-amber-300";
  }
}

// Link do WhatsApp para finalizar um pedido Pix, no mesmo padrão do checkout:
// puxa automaticamente os produtos e o total da sacola.
function whatsappFinalizeLink(items: OrderItem[], totalCents: number): string {
  const produtosMsg = items
    .map((i) => `• ${i.productName} (${i.quantity}x)`)
    .join("\n");
  const texto = `Olá! Quero finalizar a compra do pedido:\n${produtosMsg}\nTotal: ${formatBRL(totalCents)}`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(texto)}`;
}

export function OrdersTable({ orders }: { orders: OrderRow[] }) {
  if (orders.length === 0) {
    return (
      <p className="rounded-lg border border-gold-400/15 bg-ink-soft py-8 text-center text-sm text-cream/50">
        Você ainda não fez nenhum pedido.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gold-400/15 bg-ink-soft">
      <table className="w-full min-w-[640px] border-collapse text-sm">
        <thead>
          <tr>
            <th className="bg-ink px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest2 text-cream/50">
              Pedido
            </th>
            <th className="bg-ink px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest2 text-cream/50">
              Produto(s)
            </th>
            <th className="bg-ink px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest2 text-cream/50">
              Status
            </th>
            <th className="bg-ink px-4 py-3 text-right text-[10px] font-bold uppercase tracking-widest2 text-cream/50">
              Valor
            </th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => {
            let items: OrderItem[] = [];
            try {
              items = JSON.parse(order.itemsJson) as OrderItem[];
            } catch {
              items = [];
            }

            return (
              <tr key={order.id} className="border-t border-gold-400/10 align-top">
                <td className="px-4 py-4">
                  <p className="font-semibold text-cream">
                    #{order.id.slice(-6).toUpperCase()}
                  </p>
                  <p className="mt-0.5 text-xs text-cream/50">
                    {new Date(order.createdAt).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </p>
                </td>
                <td className="px-4 py-4 text-cream/80">
                  {items.length === 0 ? (
                    <span className="text-cream/40">—</span>
                  ) : (
                    <ul className="space-y-3">
                      {items.map((item, idx) => {
                        const content = (
                          <>
                            <span className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-sm border border-gold-400/10 bg-ink">
                              {item.image ? (
                                <Image
                                  src={item.image}
                                  alt={item.productName}
                                  fill
                                  sizes="48px"
                                  className="object-cover"
                                />
                              ) : null}
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-cream/80">
                                {item.productName}
                                {item.quantity > 1 ? ` (×${item.quantity})` : ""}
                              </span>
                              <span className="block text-[11px] text-cream/40">
                                {formatBRL(item.unitPriceCents)} un.
                              </span>
                            </span>
                          </>
                        );

                        return (
                          <li key={idx} className="flex items-center gap-3">
                            {item.productSlug ? (
                              <Link
                                href={`/produto/${item.productSlug}`}
                                className="flex min-w-0 flex-1 items-center gap-3 transition-opacity hover:opacity-80"
                              >
                                {content}
                              </Link>
                            ) : (
                              content
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </td>
                <td className="px-4 py-4">
                  {order.status === "WHATSAPP" ? (
                    <a
                      href={whatsappFinalizeLink(items, order.totalCents)}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Clique para finalizar este pedido pelo WhatsApp"
                      className={`inline-block whitespace-nowrap rounded-full border px-3 py-1 text-[9px] font-bold uppercase tracking-widest2 transition hover:brightness-125 ${statusBadgeClass(order.status)}`}
                    >
                      {ORDER_STATUS_LABEL[order.status]}
                    </a>
                  ) : (
                    <span
                      className={`inline-block whitespace-nowrap rounded-full border px-3 py-1 text-[9px] font-bold uppercase tracking-widest2 ${statusBadgeClass(order.status)}`}
                    >
                      {ORDER_STATUS_LABEL[order.status]}
                    </span>
                  )}
                </td>
                <td className="px-4 py-4 text-right">
                  <p className="font-bold text-gold-400">
                    {formatBRL(order.totalCents)}
                  </p>
                  {order.discountCents > 0 && (
                    <p className="mt-0.5 text-[11px] text-emerald-400">
                      Desconto: -{formatBRL(order.discountCents)}
                    </p>
                  )}
                  <p className="mt-0.5 text-[11px] text-cream/40">
                    {order.installments}
                    {order.installments === "1" ? "x (à vista)" : "x sem juros"}
                  </p>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
