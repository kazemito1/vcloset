import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const revalidate = 0;

export default async function AdminUsuariosPage() {
  const users = await prisma.adminUser.findMany({
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true, email: true, role: true, active: true, createdAt: true },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="admin-title">Usuários do painel</h1>
          <p className="admin-subtitle">{users.length} usuários cadastrados</p>
        </div>
        <Link href="/admin/usuarios/novo" className="admin-btn-primary">
          + Novo usuário
        </Link>
      </div>

      <div className="admin-table-wrap mt-6">
        <table className="w-full text-sm">
          <thead className="admin-table-th">
            <tr>
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">E-mail</th>
              <th className="px-4 py-3">Nível</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-cream/30">
                  Nenhum usuário cadastrado. O primeiro usuário criado vira SUPER_ADMIN
                  automaticamente.
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="admin-table-row">
                  <td className="px-4 py-3 font-medium text-cream">{u.name}</td>
                  <td className="px-4 py-3 text-cream/50">{u.email}</td>
                  <td className="px-4 py-3">
                    {u.role === "SUPER_ADMIN" ? (
                      <span className="rounded-full bg-gold-400/15 px-2 py-0.5 text-xs text-gold-400">
                        Super Admin
                      </span>
                    ) : (
                      <span className="rounded-full bg-cream/10 px-2 py-0.5 text-xs text-cream/60">
                        Operador
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {u.active ? (
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
                    <Link href={`/admin/usuarios/${u.id}`} className="admin-link">
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
