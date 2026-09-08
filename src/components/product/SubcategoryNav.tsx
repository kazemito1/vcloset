import type { Subcategory } from "@/lib/productSubcategories";
import { CategoryLink } from "@/components/store/CategoryTransition";

interface Props {
  categorySlug: string;
  activeSlug?: string | null;
  subcategories: Subcategory[];
}

// Barra de chips para navegar entre as subcategorias de uma categoria.
// Usada na página da categoria (nenhuma ativa) e na página da subcategoria.
export function SubcategoryNav({ categorySlug, activeSlug, subcategories }: Props) {
  if (subcategories.length === 0) return null;

  const chipClass = (active: boolean) =>
    `inline-flex h-9 items-center rounded-full border px-5 text-xs font-semibold uppercase tracking-widest2 transition ${
      active
        ? "border-gold-500 bg-gold-500 text-white"
        : "border-gold-400/30 bg-white text-ink/70 hover:border-gold-500 hover:text-gold-700"
    }`;

  return (
    <nav className="mt-8 flex flex-wrap gap-2" aria-label="Subcategorias">
      <CategoryLink href={`/categorias/${categorySlug}`} className={chipClass(!activeSlug)}>
        Tudo
      </CategoryLink>
      {subcategories.map((sub) => (
        <CategoryLink
          key={sub.slug}
          href={`/categorias/${categorySlug}/${sub.slug}`}
          className={chipClass(activeSlug === sub.slug)}
        >
          {sub.name}
        </CategoryLink>
      ))}
    </nav>
  );
}
