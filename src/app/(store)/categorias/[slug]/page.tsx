import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { parseProduct } from "@/lib/parseProduct";
import { ProductCard } from "@/components/product/ProductCard";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";

export const revalidate = 0;

interface Props {
  params: { slug: string };
}

export default async function CategoryPage({ params }: Props) {
  const category = await prisma.category.findUnique({
    where: { slug: params.slug },
  });

  if (!category) {
    notFound();
  }

  const products = await prisma.product.findMany({
    where: { categoryId: category!.id },
    include: { category: true, variants: true },
    orderBy: { createdAt: "asc" },
  });

  const parsed = products.map(parseProduct);

  return (
    <div className="container-page py-12 md:py-16">
      <Breadcrumbs items={[{ label: category!.name }]} />

      <h1 className="section-title text-left">{category!.name}</h1>
      <p className="mt-3 max-w-xl text-ink/60">
        Explore nossa coleção de {category!.name.toLowerCase()} — peças
        exclusivas em ouro, prata e materiais nobres.
      </p>

      {parsed.length === 0 ? (
        <p className="mt-12 text-ink/60">Nenhum produto disponível nesta categoria no momento.</p>
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
