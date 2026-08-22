import { prisma } from "@/lib/prisma";
import { parseProduct } from "@/lib/parseProduct";
import { ProductCard } from "@/components/product/ProductCard";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";

export const revalidate = 0;

// Página curada por faixa de preço, cruzando produtos já existentes no
// catálogo (sem necessidade de produtos exclusivos nem categoria nova).
const PRICE_BANDS = [
  { label: "Até R$ 500", max: 50000 },
  { label: "Até R$ 1.000", max: 100000 },
  { label: "Acima de R$ 1.000", max: null },
] as const;

export default async function PresentesPage() {
  const bands = await Promise.all(
    PRICE_BANDS.map(async (band) => {
      const where =
        band.max === null
          ? { priceCents: { gt: 100000 } }
          : { priceCents: { lte: band.max } };

      const products = await prisma.product.findMany({
        where,
        include: { category: true, variants: true },
        orderBy: { createdAt: "desc" },
        take: 8,
      });

      return { label: band.label, products: products.map(parseProduct) };
    })
  );

  return (
    <div className="container-page py-12 md:py-16">
      <Breadcrumbs items={[{ label: "Presentes" }]} />

      <h1 className="section-title text-left">Presentes</h1>
      <p className="mt-3 max-w-xl text-ink/60">
        Encontre o presente perfeito por faixa de preço — peças selecionadas
        do nosso catálogo para todas as ocasiões.
      </p>

      {bands.map((band) => (
        <section key={band.label} className="mt-16 first:mt-12">
          <h2 className="font-serif text-2xl text-ink">{band.label}</h2>
          {band.products.length === 0 ? (
            <p className="mt-6 text-ink/60">Nenhum produto disponível nesta faixa no momento.</p>
          ) : (
            <div className="mt-6 grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
              {band.products.map((p) => (
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
        </section>
      ))}
    </div>
  );
}
