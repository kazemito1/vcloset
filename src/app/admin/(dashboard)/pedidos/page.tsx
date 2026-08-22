import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatBRL } from "@/lib/format";

export const revalidate = 0;

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pendente",
  PAID: "Pago",
  FAILED: "Falhou",
  CANCELED: "Cancelado",
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-amber-500/15 text-amber-400",
  PAID: "bg-emerald-500/15 text-emerald-400",
  FAILED: "bg-red-500/15 text-red-400",
  CANCELED: "bg-cream/10 text-cream/50",
};

interface Props {
  searchParams: { status?: string };
}

export default async function AdminPedidosPage({ searchParams }: Props) {
  const status = searchParams.status;

  const orders = await prisma.order.findMany({
    where: status ? { status } : undefined,
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  const statuses = ["", "PENDING", "PAID", "FAILED", "CANCELED"];

  return (
    <div>
      <h1 className="admin-title">Pedidos</h1>
      <p className="admin-subtitle">{orders.length} pedidos encontrados</p>

      <div className="mt-4 flex gap-2">
        {statuses.map((s) => (
          <Link
            key={s || "all"}
            href={s ? `/admin/pedidos?status=${s}` : "/admin/pedidos"}
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              (status || "") === s
                ? "bg-gold-400 text-ink"
                : "bg-ink-soft text-cream/60 hover:bg-gold-400/10"
            }`}
          >
            {s ? STATUS_LABELS[s] : "Todos"}
          </Link>
        ))}
      </div>

      <div className="admin-table-wrap mt-6">
        <table className="w-full text-sm">
          <thead className="admin-table-th">
            <tr>
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">Itens</th>
              <th className="px-4 py-3">Valor</th>
              <th className="px-4 py-3">Cupom</th>
              <th className="px-4 py-3">Pagamento</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Data</th>
              <th className="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-6 text-center text-cream/30">
                  Nenhum pedido encontrado
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="admin-table-row">
                  <td className="px-4 py-3">
                    <p className="text-cream">{order.customerName}</p>
                    <p className="text-xs text-cream/40">{order.customerEmail}</p>
                  </td>
                  <td className="px-4 py-3 text-cream/50">{order.items.length}</td>
                  <td className="px-4 py-3 text-cream">{formatBRL(order.totalCents)}</td>
                  <td className="px-4 py-3 text-cream/50">
                    {order.couponCode || order.referralCode || "-"}
                  </td>
                  <td className="px-4 py-3 text-cream/50">
                    {order.paymentMethod === "CREDIT_CARD" ? "Cartão" : "PIX"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${STATUS_COLORS[order.status]}`}
                    >
                      {STATUS_LABELS[order.status] || order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-cream/50">
                    {new Date(order.createdAt).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/pedidos/${order.id}`} className="admin-link">
                      Ver detalhes
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
