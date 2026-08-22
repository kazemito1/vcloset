import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatBRL } from "@/lib/format";

export const revalidate = 0;

interface Props {
  params: { id: string };
}

const statusLabels: Record<string, string> = {
  PENDING: "Aguardando pagamento",
  PAID: "Pagamento confirmado",
  FAILED: "Pagamento não aprovado",
  CANCELED: "Pedido cancelado",
};

export default async function OrderConfirmationPage({ params }: Props) {
  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: { items: true },
  });

  if (!order) {
    notFound();
  }

  const isPaid = order!.status === "PAID";

  return (
    <div className="container-page py-16 md:py-24 text-center">
      <div className="mx-auto max-w-xl">
        <div
          className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${
            isPaid ? "bg-gold-400 text-ink" : "bg-ink/10 text-ink"
          }`}
        >
          {isPaid ? "✓" : "…"}
        </div>

        <h1 className="mt-6 font-serif text-3xl text-ink">
          {isPaid ? "Pedido confirmado!" : "Pedido recebido"}
        </h1>
        <p className="mt-3 text-ink/60">
          {statusLabels[order!.status] || order!.status} — Nº do pedido: {order!.id}
        </p>

        <div className="mt-10 border border-gold-400/30 p-6 text-left">
          <h2 className="font-serif text-xl text-ink">Resumo</h2>
          <div className="mt-4 space-y-3">
            {order!.items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm text-ink/70">
                <span>
                  {item.productName}
                  {item.variantLabel ? ` (${item.variantLabel})` : ""} x{item.quantity}
                </span>
                <span>{formatBRL(item.unitPriceCents * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-between text-sm text-ink/70">
            <span>Subtotal</span>
            <span>{formatBRL(order!.totalCents + order!.discountCents)}</span>
          </div>
          {order!.discountCents > 0 && (
            <div className="mt-2 flex justify-between text-sm text-emerald-700">
              <span>Desconto {order!.couponCode || order!.referralCode ? `(${order!.couponCode || order!.referralCode})` : ""}</span>
              <span>-{formatBRL(order!.discountCents)}</span>
            </div>
          )}
          <div className="mt-4 flex justify-between border-t border-gold-400/20 pt-4 font-serif text-lg text-ink">
            <span>Total</span>
            <span>{formatBRL(order!.totalCents)}</span>
          </div>
        </div>

        <p className="mt-6 text-sm text-ink/60">
          Enviamos os detalhes do pedido para <strong>{order!.customerEmail}</strong>.
        </p>

        <Link href="/" className="btn-gold mt-8 inline-flex">
          Voltar para a loja
        </Link>
      </div>
    </div>
  );
}
