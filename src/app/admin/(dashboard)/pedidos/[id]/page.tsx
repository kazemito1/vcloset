import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatBRL } from "@/lib/format";
import { OrderStatusSelect } from "@/components/admin/OrderStatusSelect";
import { formatCpf } from "@/lib/cpf";
import type { ShippingAddress } from "@/types";

export const revalidate = 0;

interface Props {
  params: { id: string };
}

export default async function AdminPedidoDetalhePage({ params }: Props) {
  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: { items: true },
  });

  if (!order) {
    notFound();
  }

  const address: ShippingAddress | null = order!.shippingAddress
    ? JSON.parse(order!.shippingAddress)
    : null;

  return (
    <div>
      <Link href="/admin/pedidos" className="text-sm text-cream/50 hover:underline">
        ← Voltar para pedidos
      </Link>

      <div className="mt-4 flex items-start justify-between">
        <div>
          <h1 className="admin-title">Pedido #{order!.id.slice(-8)}</h1>
          <p className="admin-subtitle">
            {new Date(order!.createdAt).toLocaleString("pt-BR")}
          </p>
        </div>
        <OrderStatusSelect orderId={order!.id} currentStatus={order!.status} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="admin-card p-5">
          <h2 className="text-sm font-semibold text-gold-400">Cliente</h2>
          <p className="mt-2 text-sm text-cream">{order!.customerName}</p>
          <p className="text-sm text-cream/50">{order!.customerEmail}</p>
          {order!.customerCpf && (
            <p className="text-sm text-cream/50">CPF: {formatCpf(order!.customerCpf)}</p>
          )}
          {order!.customerPhone && <p className="text-sm text-cream/50">{order!.customerPhone}</p>}
        </div>

        <div className="admin-card p-5">
          <h2 className="text-sm font-semibold text-gold-400">Pagamento</h2>
          <p className="mt-2 text-sm text-cream">
            Método: {order!.paymentMethod === "CREDIT_CARD" ? "Cartão de crédito" : "PIX"}
          </p>
          {order!.discountCents > 0 && (
            <>
              <p className="text-sm text-cream/50">
                Subtotal: {formatBRL(order!.totalCents + order!.discountCents)}
              </p>
              <p className="text-sm text-emerald-400">
                Desconto ({order!.couponCode || order!.referralCode}): -{formatBRL(order!.discountCents)}
              </p>
            </>
          )}
          <p className="text-sm text-cream/50">Total: {formatBRL(order!.totalCents)}</p>
          {order!.paymentRef && (
            <p className="text-sm text-cream/50">Referência: {order!.paymentRef}</p>
          )}
        </div>

        {address && (
          <div className="admin-card p-5 lg:col-span-2">
            <h2 className="text-sm font-semibold text-gold-400">Endereço de entrega</h2>
            <p className="mt-2 text-sm text-cream">
              {address.street}, {address.number}
              {address.complement ? ` - ${address.complement}` : ""}
            </p>
            <p className="text-sm text-cream/50">
              {address.neighborhood} - {address.city}/{address.state} - {address.zipCode}
            </p>
          </div>
        )}

        <div className="admin-card p-5 lg:col-span-2">
          <h2 className="text-sm font-semibold text-gold-400">Itens do pedido</h2>
          <table className="mt-3 w-full text-sm">
            <thead className="text-left text-cream/50">
              <tr>
                <th className="py-2">Produto</th>
                <th className="py-2">Variante</th>
                <th className="py-2">Qtd</th>
                <th className="py-2 text-right">Valor unitário</th>
                <th className="py-2 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {order!.items.map((item) => (
                <tr key={item.id} className="admin-table-row">
                  <td className="py-2 text-cream">{item.productName}</td>
                  <td className="py-2 text-cream/50">{item.variantLabel || "-"}</td>
                  <td className="py-2 text-cream">{item.quantity}</td>
                  <td className="py-2 text-right text-cream">{formatBRL(item.unitPriceCents)}</td>
                  <td className="py-2 text-right text-cream">
                    {formatBRL(item.unitPriceCents * item.quantity)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
