import { prisma } from "@/lib/prisma";
import { formatBRL } from "@/lib/format";

export const revalidate = 0;

export default async function AdminDashboardPage() {
  const [totalOrders, totalProducts, totalCategories, paidOrders, pendingOrders] =
    await Promise.all([
      prisma.order.count(),
      prisma.product.count(),
      prisma.category.count(),
      prisma.order.findMany({ where: { status: "PAID" }, select: { totalCents: true } }),
      prisma.order.count({ where: { status: "PENDING" } }),
    ]);

  const totalRevenueCents = paidOrders.reduce((sum, o) => sum + o.totalCents, 0);

  const cards = [
    { label: "Total de pedidos", value: totalOrders },
    { label: "Pedidos pendentes", value: pendingOrders },
    { label: "Receita total (pedidos pagos)", value: formatBRL(totalRevenueCents) },
    { label: "Produtos cadastrados", value: totalProducts },
    { label: "Categorias", value: totalCategories },
  ];

  return (
    <div>
      <h1 className="admin-title">Dashboard</h1>
      <p className="admin-subtitle">Visão geral da loja</p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <div key={card.label} className="admin-card p-5">
            <p className="text-sm text-cream/50">{card.label}</p>
            <p className="mt-2 text-2xl font-semibold text-gold-400">{card.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
