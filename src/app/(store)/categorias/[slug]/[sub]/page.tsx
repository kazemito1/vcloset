import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { parseProduct } from "@/lib/parseProduct";
import { ProductCard } from "@/components/product/ProductCard";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { SubcategoryNav } from "@/components/product/SubcategoryNav";
import {
  getSubcategoriesForCategory,
  resolveSubcategorySlug,
} from "@/lib/productSubcategories";

export const revalidate = 0;

interface Props {
  params: { slug: string; sub: string };
}

// Página de subcategoria (ex.: /categorias/masculino/blazers): mostra apenas
// os produtos da categoria que pertencem àquela subcategoria específica.
export default async function SubcategoryPage({ params }: Props) {
  const category = await prisma.category.findUnique({
    where: { slug: params.slug },
  });

  if (!category) {
    notFound();
  }

  const subcategories = getSubcategoriesForCategory(category!.slug);
  const subcategory = subcategories.find((s) => s.slug === params.sub);

  // Subcategoria inexistente para esta categoria: 404.
  if (!subcategory) {
    notFound();
  }

  const products = await prisma.product.findMany({
    where: { categoryId: category!.id },
    include: { category: true, variants: true },
    orderBy: { createdAt: "asc" },
  });

  const parsed = products
    .map(parseProduct)
    .filter((p) => resolveSubcategorySlug(category!.slug, p.slug) === subcategory.slug);

  return (
    <div className="container-page py-12 md:py-16">
      <Breadcrumbs
        items={[
          { label: category!.name, href: `/categorias/${category!.slug}` },
          { label: subcategory.name },
        ]}
      />

      <p className="text-[10px] font-medium uppercase tracking-[0.5em] text-ink/50">
        {category!.name}
      </p>
      <h1 className="section-title text-left">{subcategory.name}</h1>
      <p className="mt-3 max-w-xl text-ink/60">
        Seleção de {subcategory.name.toLowerCase()} dentro de{" "}
        {category!.name.toLowerCase()} — peças exclusivas em materiais nobres.
      </p>

      <SubcategoryNav
        categorySlug={category!.slug}
        activeSlug={subcategory.slug}
        subcategories={subcategories}
      />

      {parsed.length === 0 ? (
        <p className="mt-12 text-ink/60">
          Nenhum produto disponível nesta subcategoria no momento.
        </p>
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
              hoverImage={p.images[1]}
            />
          ))}
        </div>
      )}
    </div>
  );
}
