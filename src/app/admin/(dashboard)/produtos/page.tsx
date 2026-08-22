import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatBRL } from "@/lib/format";

export const revalidate = 0;

export default async function AdminProdutosPage() {
  const products = await prisma.product.findMany({
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="admin-title">Produtos</h1>
          <p className="admin-subtitle">{products.length} produtos cadastrados</p>
        </div>
        <Link href="/admin/produtos/novo" className="admin-btn-primary">
          + Novo produto
        </Link>
      </div>

      <div className="admin-table-wrap mt-6">
        <table className="w-full text-sm">
          <thead className="admin-table-th">
            <tr>
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">Categoria</th>
              <th className="px-4 py-3">Preço</th>
              <th className="px-4 py-3">Destaque</th>
              <th className="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-cream/30">
                  Nenhum produto cadastrado
                </td>
              </tr>
            ) : (
              products.map((p) => (
                <tr key={p.id} className="admin-table-row">
                  <td className="px-4 py-3 text-cream">{p.name}</td>
                  <td className="px-4 py-3 text-cream/50">{p.category.name}</td>
                  <td className="px-4 py-3 text-cream">{formatBRL(p.priceCents)}</td>
                  <td className="px-4 py-3">
                    {p.featured ? (
                      <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs text-emerald-400">
                        Sim
                      </span>
                    ) : (
                      <span className="text-cream/30">Não</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/produtos/${p.id}`} className="admin-link">
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
