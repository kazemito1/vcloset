import { prisma } from "@/lib/prisma";
import { formatBRL } from "@/lib/format";

export const revalidate = 0;

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function startOfWeek(d: Date) {
  const x = startOfDay(d);
  const day = x.getDay();
  const diff = (day + 6) % 7; // segunda-feira como início da semana
  x.setDate(x.getDate() - diff);
  return x;
}

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export default async function AdminRelatoriosPage() {
  const now = new Date();
  const todayStart = startOfDay(now);
  const weekStart = startOfWeek(now);
  const monthStart = startOfMonth(now);

  const [paidOrders, allItems] = await Promise.all([
    prisma.order.findMany({
      where: { status: "PAID" },
      select: { totalCents: true, createdAt: true },
    }),
    prisma.orderItem.findMany({
      where: { order: { status: "PAID" } },
      select: { productName: true, quantity: true, unitPriceCents: true },
    }),
  ]);

  const totalRevenueCents = paidOrders.reduce((sum, o) => sum + o.totalCents, 0);
  const todayRevenueCents = paidOrders
    .filter((o) => o.createdAt >= todayStart)
    .reduce((sum, o) => sum + o.totalCents, 0);
  const weekRevenueCents = paidOrders
    .filter((o) => o.createdAt >= weekStart)
    .reduce((sum, o) => sum + o.totalCents, 0);
  const monthRevenueCents = paidOrders
    .filter((o) => o.createdAt >= monthStart)
    .reduce((sum, o) => sum + o.totalCents, 0);

  const productMap = new Map<string, { quantity: number; revenueCents: number }>();
  for (const item of allItems) {
    const current = productMap.get(item.productName) || { quantity: 0, revenueCents: 0 };
    current.quantity += item.quantity;
    current.revenueCents += item.quantity * item.unitPriceCents;
    productMap.set(item.productName, current);
  }
  const topProducts = Array.from(productMap.entries())
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 10);

  const maxQuantity = topProducts[0]?.quantity || 1;

  return (
    <div>
      <h1 className="admin-title">Relatório de vendas</h1>
      <p className="admin-subtitle">Receita por período e produtos mais vendidos</p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="admin-card p-5">
          <p className="text-sm text-cream/50">Hoje</p>
          <p className="mt-2 text-xl font-semibold text-gold-400">
            {formatBRL(todayRevenueCents)}
          </p>
        </div>
        <div className="admin-card p-5">
          <p className="text-sm text-cream/50">Esta semana</p>
          <p className="mt-2 text-xl font-semibold text-gold-400">
            {formatBRL(weekRevenueCents)}
          </p>
        </div>
        <div className="admin-card p-5">
          <p className="text-sm text-cream/50">Este mês</p>
          <p className="mt-2 text-xl font-semibold text-gold-400">
            {formatBRL(monthRevenueCents)}
          </p>
        </div>
        <div className="admin-card p-5">
          <p className="text-sm text-cream/50">Receita total</p>
          <p className="mt-2 text-xl font-semibold text-gold-400">
            {formatBRL(totalRevenueCents)}
          </p>
          <p className="mt-1 text-xs text-cream/40">{paidOrders.length} pedidos pagos</p>
        </div>
      </div>

      <h2 className="mt-8 text-sm font-semibold text-gold-400">Produtos mais vendidos</h2>
      <div className="admin-table-wrap mt-3">
        <table className="w-full text-sm">
          <thead className="admin-table-th">
            <tr>
              <th className="px-4 py-3">Produto</th>
              <th className="px-4 py-3">Quantidade vendida</th>
              <th className="px-4 py-3 text-right">Receita gerada</th>
            </tr>
          </thead>
          <tbody>
            {topProducts.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center text-cream/30">
                  Nenhuma venda registrada ainda
                </td>
              </tr>
            ) : (
              topProducts.map((p) => (
                <tr key={p.name} className="admin-table-row">
                  <td className="px-4 py-3 text-cream">{p.name}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-32 overflow-hidden rounded-full bg-ink-soft">
                        <div
                          className="h-full rounded-full bg-gold-400"
                          style={{ width: `${(p.quantity / maxQuantity) * 100}%` }}
                        />
                      </div>
                      <span className="text-cream/60">{p.quantity}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right text-cream/60">
                    {formatBRL(p.revenueCents)}
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
