import Image from "next/image";
import { CATEGORIES } from "@/lib/constants";
import { CategoryLink } from "@/components/store/CategoryTransition";

export function CategoryGrid() {
  return (
    <section className="container-page py-16 md:py-24">
      <h2 className="section-title">Nossas Categorias</h2>
      <p className="mx-auto mt-4 max-w-xl text-center text-neutral-500">
        Escolha por categoria e encontre a peça perfeita para cada ocasião.
      </p>
      <div className="mt-12 grid grid-cols-2 justify-items-center gap-x-6 gap-y-10 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {CATEGORIES.map((cat) => (
          <CategoryLink
            key={cat.slug}
            href={`/categorias/${cat.slug}`}
            className="group w-full max-w-[184px] text-center"
          >
            <div className="relative aspect-square overflow-hidden rounded-full border border-gold-400/25 bg-neutral-100 transition-colors group-hover:border-gold-400 group-hover:shadow-gold">
              <Image
                src={cat.image}
                alt={cat.name}
                fill
                className="rounded-full object-cover transition-transform duration-500 group-hover:scale-110"
                sizes="(max-width: 640px) 44vw, (max-width: 1024px) 22vw, 184px"
              />
            </div>
            <span className="mt-4 block font-serif text-sm text-ink group-hover:text-gold-600">
              {cat.name}
            </span>
          </CategoryLink>
        ))}
      </div>
    </section>
  );
}
