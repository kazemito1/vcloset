import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const revalidate = 0;

export default async function AdminIndicacoesPage() {
  const referrals = await prisma.referral.findMany({
    orderBy: { createdAt: "desc" },
  });

  const rewardCoupons = await prisma.coupon.findMany({
    where: { sourceReferralId: { in: referrals.map((r) => r.id) } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="admin-title">Indique e Ganhe</h1>
          <p className="admin-subtitle">
            {referrals.length} indicadores cadastrados — cada indicação gera um código para o
            cliente indicar amigos e o indicador ganha um cupom de recompensa automaticamente
          </p>
        </div>
        <Link href="/admin/indicacoes/novo" className="admin-btn-primary">
          + Nova indicação
        </Link>
      </div>

      <div className="admin-table-wrap mt-6">
        <table className="w-full text-sm">
          <thead className="admin-table-th">
            <tr>
              <th className="px-4 py-3">Indicador</th>
              <th className="px-4 py-3">Código</th>
              <th className="px-4 py-3">Desconto p/ indicado</th>
              <th className="px-4 py-3">Recompensa</th>
              <th className="px-4 py-3">Usos</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {referrals.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-cream/30">
                  Nenhuma indicação cadastrada
                </td>
              </tr>
            ) : (
              referrals.map((r) => {
                const rewards = rewardCoupons.filter((c) => c.sourceReferralId === r.id);
                const lastReward = rewards[0];
                return (
                  <tr key={r.id} className="admin-table-row">
                    <td className="px-4 py-3">
                      <p className="text-cream">{r.referrerName}</p>
                      <p className="text-xs text-cream/40">{r.referrerEmail}</p>
                    </td>
                    <td className="px-4 py-3 font-medium text-gold-400">{r.code}</td>
                    <td className="px-4 py-3 text-cream/50">
                      {r.referredDiscountType === "PERCENT"
                        ? `${r.referredDiscountValue}%`
                        : `R$ ${(r.referredDiscountValue / 100).toFixed(2)}`}
                    </td>
                    <td className="px-4 py-3 text-cream/50">
                      {r.rewardType === "PERCENT"
                        ? `${r.rewardValue}%`
                        : `R$ ${(r.rewardValue / 100).toFixed(2)}`}
                      {lastReward && (
                        <p className="text-xs text-emerald-400">
                          Último cupom gerado: {lastReward.code}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-cream/50">
                      {r.usedCount} ({rewards.length} recompensa{rewards.length !== 1 ? "s" : ""})
                    </td>
                    <td className="px-4 py-3">
                      {r.active ? (
                        <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs text-emerald-400">
                          Ativo
                        </span>
                      ) : (
                        <span className="rounded-full bg-cream/10 px-2 py-0.5 text-xs text-cream/40">
                          Inativo
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/admin/indicacoes/${r.id}`} className="admin-link">
                        Editar
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
