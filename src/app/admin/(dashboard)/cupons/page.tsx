import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatBRL } from "@/lib/format";

export const revalidate = 0;

function formatValue(type: string, value: number) {
  return type === "PERCENT" ? `${value}%` : formatBRL(value);
}

export default async function AdminCuponsPage() {
  const coupons = await prisma.coupon.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="admin-title">Cupons de desconto</h1>
          <p className="admin-subtitle">{coupons.length} cupons cadastrados</p>
        </div>
        <Link href="/admin/cupons/novo" className="admin-btn-primary">
          + Novo cupom
        </Link>
      </div>

      <div className="admin-table-wrap mt-6">
        <table className="w-full text-sm">
          <thead className="admin-table-th">
            <tr>
              <th className="px-4 py-3">Código</th>
              <th className="px-4 py-3">Desconto</th>
              <th className="px-4 py-3">Validade</th>
              <th className="px-4 py-3">Usos</th>
              <th className="px-4 py-3">Origem</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {coupons.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-cream/30">
                  Nenhum cupom cadastrado
                </td>
              </tr>
            ) : (
              coupons.map((c) => (
                <tr key={c.id} className="admin-table-row">
                  <td className="px-4 py-3 font-medium text-cream">{c.code}</td>
                  <td className="px-4 py-3 text-cream">{formatValue(c.type, c.value)}</td>
                  <td className="px-4 py-3 text-cream/50">
                    {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString("pt-BR") : "Sem validade"}
                  </td>
                  <td className="px-4 py-3 text-cream/50">
                    {c.usedCount}
                    {c.maxUses ? ` / ${c.maxUses}` : ""}
                  </td>
                  <td className="px-4 py-3">
                    {c.sourceReferralId ? (
                      <span className="rounded-full bg-gold-400/15 px-2 py-0.5 text-xs text-gold-400">
                        Indicação
                      </span>
                    ) : (
                      <span className="text-cream/30">Manual</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {c.active ? (
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
                    <Link href={`/admin/cupons/${c.id}`} className="admin-link">
                      Editar
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
