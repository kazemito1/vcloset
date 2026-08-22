import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const revalidate = 0;

interface Props {
  searchParams: { action?: string; adminName?: string; from?: string; to?: string };
}

export default async function AdminAtividadesPage({ searchParams }: Props) {
  const { action, adminName, from, to } = searchParams;

  const where: Record<string, unknown> = {};
  if (action) where.action = action;
  if (adminName) where.adminName = { contains: adminName };
  if (from || to) {
    const createdAt: Record<string, Date> = {};
    if (from) createdAt.gte = new Date(`${from}T00:00:00`);
    if (to) createdAt.lte = new Date(`${to}T23:59:59`);
    where.createdAt = createdAt;
  }

  const [logs, distinctActions] = await Promise.all([
    prisma.activityLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 200,
    }),
    prisma.activityLog.findMany({
      distinct: ["action"],
      select: { action: true },
      orderBy: { action: "asc" },
    }),
  ]);

  return (
    <div>
      <h1 className="admin-title">Log de atividades</h1>
      <p className="admin-subtitle">{logs.length} registros (máx. 200 exibidos)</p>

      <form className="admin-card mt-4 grid grid-cols-1 gap-3 p-4 sm:grid-cols-4" method="get">
        <div>
          <label className="admin-label">Tipo de ação</label>
          <select name="action" defaultValue={action || ""} className="admin-input mt-1 w-full">
            <option value="">Todas</option>
            {distinctActions.map((a) => (
              <option key={a.action} value={a.action}>
                {a.action}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="admin-label">Usuário (nome contém)</label>
          <input
            name="adminName"
            defaultValue={adminName || ""}
            className="admin-input mt-1 w-full"
            placeholder="Ex: Maria"
          />
        </div>
        <div>
          <label className="admin-label">De</label>
          <input type="date" name="from" defaultValue={from || ""} className="admin-input mt-1 w-full" />
        </div>
        <div>
          <label className="admin-label">Até</label>
          <input type="date" name="to" defaultValue={to || ""} className="admin-input mt-1 w-full" />
        </div>
        <div className="sm:col-span-4 flex gap-2">
          <button type="submit" className="admin-btn-primary">
            Filtrar
          </button>
          <Link href="/admin/atividades" className="admin-link self-center">
            Limpar filtros
          </Link>
        </div>
      </form>

      <div className="admin-table-wrap mt-6">
        <table className="w-full text-sm">
          <thead className="admin-table-th">
            <tr>
              <th className="px-4 py-3">Data</th>
              <th className="px-4 py-3">Usuário</th>
              <th className="px-4 py-3">Nível</th>
              <th className="px-4 py-3">Ação</th>
              <th className="px-4 py-3">Descrição</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-cream/30">
                  Nenhuma atividade encontrada
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="admin-table-row">
                  <td className="px-4 py-3 whitespace-nowrap text-cream/50">
                    {new Date(log.createdAt).toLocaleString("pt-BR")}
                  </td>
                  <td className="px-4 py-3 text-cream">{log.adminName}</td>
                  <td className="px-4 py-3 text-cream/50">
                    {log.adminRole === "SUPER_ADMIN"
                      ? "Super Admin"
                      : log.adminRole === "OPERADOR"
                        ? "Operador"
                        : "-"}
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-gold-400/15 px-2 py-0.5 text-xs text-gold-400">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-cream/50">{log.description || "-"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
