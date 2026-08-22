import type { Product as PrismaProduct, ProductVariant, Category } from "@prisma/client";
import type { Product } from "@/types";

type ProductWithRelations = PrismaProduct & {
  category?: Category;
  variants?: ProductVariant[];
};

export function parseProduct(p: ProductWithRelations): Product {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    material: p.material,
    priceCents: p.priceCents,
    salePriceCents: p.salePriceCents,
    targetGender: p.targetGender,
    images: JSON.parse(p.images) as string[],
    featured: p.featured,
    categoryId: p.categoryId,
    category: p.category
      ? { id: p.category.id, name: p.category.name, slug: p.category.slug }
      : undefined,
    variants: (p.variants || []).map((v) => ({ id: v.id, label: v.label, stock: v.stock })),
  };
}
