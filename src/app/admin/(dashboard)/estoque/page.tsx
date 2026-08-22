import { prisma } from "@/lib/prisma";
import { StockManager } from "@/components/admin/StockManager";

export const revalidate = 0;

export default async function AdminEstoquePage() {
  const products = await prisma.product.findMany({
    include: { variants: true, category: true },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <h1 className="admin-title">Gestão de estoque</h1>
      <p className="admin-subtitle">
        Veja e edite a quantidade em estoque de cada produto/variante
      </p>
      <div className="mt-6">
        <StockManager products={products} />
      </div>
    </div>
  );
}
