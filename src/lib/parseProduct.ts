import type { Product as PrismaProduct, ProductVariant, Category } from "@prisma/client";
import type { Product } from "@/types";

type ProductWithRelations = PrismaProduct & {
  category?: Category;
  variants?: ProductVariant[];
};

const GLOBAL_SALE_DISCOUNT = 0.3;

export function parseProduct(p: ProductWithRelations): Product {
  const originalPrice = p.priceCents;
  const existingSale = p.salePriceCents;
  const globalSalePrice = Math.round(originalPrice * (1 - GLOBAL_SALE_DISCOUNT));

  // Usa o menor preço entre o desconto global (30%) e um eventual sale já cadastrado.
  const finalSalePrice =
    typeof existingSale === "number" && existingSale > 0 && existingSale < originalPrice
      ? Math.min(existingSale, globalSalePrice)
      : globalSalePrice;

  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    material: p.material,
    priceCents: originalPrice,
    salePriceCents: finalSalePrice,
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
