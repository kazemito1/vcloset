import { prisma } from "@/lib/prisma";
import { parseProduct } from "@/lib/parseProduct";
import { ProductCard } from "@/components/product/ProductCard";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";

export const revalidate = 0;

interface Props {
  searchParams: { q?: string };
}

export default async function SearchPage({ searchParams }: Props) {
  const query = (searchParams.q ?? "").trim();

  const products = query
    ? await prisma.product.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
            { material: { contains: query, mode: "insensitive" } },
            { category: { name: { contains: query, mode: "insensitive" } } },
          ],
        },
        include: { category: true, variants: true },
        orderBy: { createdAt: "asc" },
      })
    : [];

  const parsed = products.map(parseProduct);

  return (
    <div className="container-page py-12 md:py-16">
      <Breadcrumbs items={[{ label: "Busca" }]} />

      <h1 className="section-title text-left">
        {query ? `Resultados para “${query}”` : "Buscar produtos"}
      </h1>

      {query && parsed.length === 0 && (
        <p className="mt-6 max-w-xl text-ink/60">
          Nenhum produto encontrado para “{query}”. Tente outro termo, material
          ou categoria.
        </p>
      )}

      {parsed.length > 0 && (
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
