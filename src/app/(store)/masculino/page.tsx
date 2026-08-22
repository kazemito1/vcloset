import { prisma } from "@/lib/prisma";
import { parseProduct } from "@/lib/parseProduct";
import { ProductCard } from "@/components/product/ProductCard";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";

export const revalidate = 0;

// Página curada: cruza produtos já existentes marcados com
// targetGender = "masculino" (alianças, relógios, etc.), sem duplicar
// nenhum produto nem criar uma categoria nova no catálogo.
export default async function MasculinoPage() {
  const products = await prisma.product.findMany({
    where: { targetGender: "masculino" },
    include: { category: true, variants: true },
    orderBy: { createdAt: "asc" },
  });

  const parsed = products.map(parseProduct);

  return (
    <div className="container-page py-12 md:py-16">
      <Breadcrumbs items={[{ label: "Masculino" }]} />

      <h1 className="section-title text-left">Masculino</h1>
      <p className="mt-3 max-w-xl text-ink/60">
        Uma seleção de peças pensadas para o público masculino — alianças, relógios
        e acessórios em nossos materiais mais nobres.
      </p>

      {parsed.length === 0 ? (
        <p className="mt-12 text-ink/60">Nenhum produto disponível nesta seleção no momento.</p>
      ) : (
        <div className="mt-12 grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
          {parsed.map((p) => (
            <ProductCard
              key={p.id}
              slug={p.slug}
              name={p.name}
              material={p.material}
              priceCents={p.priceCents}
              salePriceCents={p.salePriceCents}
              image={p.images[0]}
            />
          ))}
        </div>
      )}
    </div>
  );
}
