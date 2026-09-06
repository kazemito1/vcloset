import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { parseProduct } from "@/lib/parseProduct";
import { ProductCard } from "@/components/product/ProductCard";
import { HeroCarousel } from "@/components/home/HeroCarousel";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { TrustBadges } from "@/components/home/TrustBadges";
import { STORE_NAME } from "@/lib/constants";
import { getStoreSettings } from "@/lib/storeSettings";

export const revalidate = 0;

export default async function HomePage() {
  const [featuredProducts, categories, settings] = await Promise.all([
    prisma.product.findMany({
      where: { featured: true },
      include: { category: true, variants: true },
      take: 8,
    }),
    prisma.category.findMany({
      orderBy: { order: "asc" },
      include: {
        products: {
          take: 4,
          orderBy: { createdAt: "desc" },
          include: { variants: true },
        },
      },
    }),
    getStoreSettings(),
  ]);

  const products = featuredProducts.map(parseProduct);
  const sections = categories
    .map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      products: category.products.map(parseProduct),
    }))
    .filter((section) => section.products.length > 0);

  return (
    <div>
      <HeroCarousel />

      <CategoryGrid />

      <TrustBadges freeShippingCents={settings.freeShippingCents} />

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

      {/* Produtos por categoria */}
      {sections.map((section) => (
        <section key={section.id} className="container-page py-16 md:py-24">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="section-title text-left">{section.name}</h2>
              <p className="mt-3 max-w-xl text-left text-ink/60">
                Explore nossa coleção de {section.name.toLowerCase()}.
              </p>
            </div>
            <Link
              href={`/categorias/${section.slug}`}
              className="hidden shrink-0 border-b border-gold-500 pb-1 text-xs uppercase tracking-wide text-gold-700 transition-colors hover:text-gold-500 sm:block"
            >
              Ver tudo
            </Link>
          </div>
          <div className="mt-12 grid grid-cols-2 gap-8 md:grid-cols-4">
            {section.products.map((p) => (
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
      ))}

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
