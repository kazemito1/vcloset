import { prisma } from "@/lib/prisma";
import { parseProduct } from "@/lib/parseProduct";
import { ProductCard } from "@/components/product/ProductCard";
import { HeroCarousel } from "@/components/home/HeroCarousel";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { TrustBadges } from "@/components/home/TrustBadges";
import { ShippingEstimate } from "@/components/home/ShippingEstimate";
import { STORE_NAME } from "@/lib/constants";
import { getStoreSettings } from "@/lib/storeSettings";

export const revalidate = 0;

export default async function HomePage() {
  const [featuredProducts, newProducts, settings] = await Promise.all([
    prisma.product.findMany({
      where: { featured: true },
      include: { category: true, variants: true },
      take: 8,
    }),
    prisma.product.findMany({
      include: { category: true, variants: true },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    getStoreSettings(),
  ]);

  const products = featuredProducts.map(parseProduct);
  const news = newProducts.map(parseProduct);

  return (
    <div>
      <HeroCarousel />

      <CategoryGrid />

      <TrustBadges freeShippingCents={settings.freeShippingCents} />

      <ShippingEstimate freeShippingCents={settings.freeShippingCents} />

      {/* Produtos em destaque */}
      {products.length > 0 && (
        <section className="bg-white py-16 md:py-24">
          <div className="container-page">
            <h2 className="section-title">Destaques</h2>
            <p className="mx-auto mt-4 max-w-xl text-center text-ink/60">
              Peças selecionadas pela nossa curadoria, com o melhor do design e da qualidade.
            </p>
            <div className="mt-12 grid grid-cols-2 gap-8 md:grid-cols-4">
              {products.map((p) => (
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
          </div>
        </section>
      )}

      {/* Novidades */}
      {news.length > 0 && (
        <section className="container-page py-16 md:py-24">
          <h2 className="section-title">Novidades</h2>
          <p className="mx-auto mt-4 max-w-xl text-center text-ink/60">
            As últimas peças a chegar na nossa coleção.
          </p>
          <div className="mt-12 grid grid-cols-2 gap-8 md:grid-cols-4">
            {news.map((p) => (
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
        </section>
      )}

      {/* Institucional */}
      <section className="bg-white py-16 md:py-24 text-center">
        <div className="container-page">
          <h2 className="section-title">Excelência em cada detalhe</h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-ink/70">
            Cada peça {STORE_NAME} é selecionada e desenvolvida com rigoroso
            padrão de qualidade, unindo design atemporal e materiais nobres para
            criar joias que atravessam gerações.
          </p>
        </div>
      </section>
    </div>
  );
}
