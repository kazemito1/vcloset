import { prisma } from "@/lib/prisma";
import { formatBRL } from "@/lib/format";
import { ExpenseForm } from "@/components/admin/ExpenseForm";
import { ExpenseTable } from "@/components/admin/ExpenseTable";

export const revalidate = 0;

export default async function AdminFinanceiroPage() {
  const [paidOrders, expenses] = await Promise.all([
    prisma.order.findMany({
      where: { status: "PAID" },
      select: { totalCents: true },
    }),
    prisma.expense.findMany({ orderBy: { date: "desc" } }),
  ]);

  const totalRevenueCents = paidOrders.reduce((sum, o) => sum + o.totalCents, 0);
  const totalExpensesCents = expenses.reduce((sum, e) => sum + e.amountCents, 0);
  const balanceCents = totalRevenueCents - totalExpensesCents;

  return (
    <div>
      <h1 className="admin-title">Financeiro</h1>
      <p className="admin-subtitle">Controle simples de entradas e saídas</p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="admin-card p-5">
          <p className="text-sm text-cream/50">Entradas (pedidos pagos)</p>
          <p className="mt-2 text-2xl font-semibold text-emerald-400">
            {formatBRL(totalRevenueCents)}
          </p>
          <p className="mt-1 text-xs text-cream/40">{paidOrders.length} pedidos</p>
        </div>
        <div className="admin-card p-5">
          <p className="text-sm text-cream/50">Saídas (despesas)</p>
          <p className="mt-2 text-2xl font-semibold text-red-400">
            -{formatBRL(totalExpensesCents)}
          </p>
          <p className="mt-1 text-xs text-cream/40">{expenses.length} despesas</p>
        </div>
        <div className="admin-card p-5">
          <p className="text-sm text-cream/50">Saldo</p>
          <p
            className={`mt-2 text-2xl font-semibold ${
              balanceCents >= 0 ? "text-gold-400" : "text-red-400"
            }`}
          >
            {formatBRL(balanceCents)}
          </p>
        </div>
      </div>

      <h2 className="mt-8 text-sm font-semibold text-gold-400">Nova despesa</h2>
      <div className="mt-3">
        <ExpenseForm />
      </div>

      <h2 className="mt-8 text-sm font-semibold text-gold-400">Despesas cadastradas</h2>
      <ExpenseTable
        expenses={expenses.map((e) => ({
          id: e.id,
          description: e.description,
          amountCents: e.amountCents,
          category: e.category,
          date: e.date.toISOString(),
        }))}
      />
    </div>
  );
}
