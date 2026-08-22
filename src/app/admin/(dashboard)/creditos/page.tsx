import { prisma } from "@/lib/prisma";
import { formatBRL } from "@/lib/format";
import { CreditAdjustForm } from "@/components/admin/CreditAdjustForm";

export const revalidate = 0;

const TYPE_LABELS: Record<string, string> = {
  GANHO_POR_INDICACAO: "Ganho por indicação",
  USADO_EM_COMPRA: "Usado em compra",
  AJUSTE_MANUAL: "Ajuste manual",
};

export default async function AdminCreditosPage() {
  const credits = await prisma.customerCredit.findMany({
    orderBy: { balanceCents: "desc" },
    include: {
      transactions: {
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });

  const totalBalanceCents = credits.reduce((sum, c) => sum + c.balanceCents, 0);

  return (
    <div>
      <h1 className="admin-title">Créditos de indicação</h1>
      <p className="admin-subtitle">
        Saldo de crédito virtual por cliente e histórico de movimentações
      </p>

      <div className="mt-6 admin-card p-5">
        <p className="text-sm text-cream/50">Saldo total em créditos concedidos</p>
        <p className="mt-2 text-2xl font-semibold text-gold-400">
          {formatBRL(totalBalanceCents)}
        </p>
        <p className="mt-1 text-xs text-cream/40">{credits.length} clientes com histórico</p>
      </div>

      <h2 className="mt-8 text-sm font-semibold text-gold-400">Ajuste manual de crédito</h2>
      <div className="mt-3">
        <CreditAdjustForm />
      </div>

      <h2 className="mt-8 text-sm font-semibold text-gold-400">Saldos por cliente</h2>
      <div className="mt-3 space-y-4">
        {credits.length === 0 ? (
          <div className="admin-card p-6 text-center text-cream/30">
            Nenhum crédito concedido ainda
          </div>
        ) : (
          credits.map((credit) => (
            <div key={credit.id} className="admin-card p-5">
              <div className="flex items-center justify-between">
                <p className="font-medium text-cream">{credit.customerEmail}</p>
                <p className="text-lg font-semibold text-gold-400">
                  {formatBRL(credit.balanceCents)}
                </p>
              </div>
              {credit.transactions.length > 0 && (
                <div className="mt-3 admin-table-wrap">
                  <table className="w-full text-xs">
                    <thead className="admin-table-th">
                      <tr>
                        <th className="px-3 py-2">Data</th>
                        <th className="px-3 py-2">Tipo</th>
                        <th className="px-3 py-2 text-right">Valor</th>
                        <th className="px-3 py-2">Descrição</th>
                      </tr>
                    </thead>
                    <tbody>
                      {credit.transactions.map((tx) => (
                        <tr key={tx.id} className="admin-table-row">
                          <td className="px-3 py-2 whitespace-nowrap text-cream/50">
                            {new Date(tx.createdAt).toLocaleString("pt-BR")}
                          </td>
                          <td className="px-3 py-2 text-cream/60">
                            {TYPE_LABELS[tx.type] || tx.type}
                          </td>
                          <td
                            className={`px-3 py-2 text-right ${
                              tx.amountCents >= 0 ? "text-emerald-400" : "text-red-400"
                            }`}
                          >
                            {tx.amountCents >= 0 ? "+" : ""}
                            {formatBRL(tx.amountCents)}
                          </td>
                          <td className="px-3 py-2 text-cream/50">{tx.description || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
