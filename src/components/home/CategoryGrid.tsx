import Image from "next/image";
import Link from "next/link";
import { CATEGORIES } from "@/lib/constants";

export function CategoryGrid() {
  return (
    <section className="container-page py-16 md:py-24">
      <h2 className="section-title">Nossas Categorias</h2>
      <p className="mx-auto mt-4 max-w-xl text-center text-neutral-500">
        Escolha por categoria e encontre a peça perfeita para cada ocasião.
      </p>
      <div className="mt-12 grid grid-cols-2 gap-8 md:grid-cols-3 md:gap-10 lg:grid-cols-6">
        {CATEGORIES.map((cat) => (
          <Link key={cat.slug} href={`/categorias/${cat.slug}`} className="group text-center">
            <div className="relative aspect-square overflow-hidden rounded-full border border-neutral-200 bg-neutral-50 transition-colors group-hover:border-gold-400 group-hover:shadow-gold">
              <Image
                src={cat.image}
                alt={cat.name}
                fill
                className="object-cover p-4 transition-transform duration-500 group-hover:scale-110"
                sizes="(max-width: 768px) 33vw, 16vw"
              />
            </div>
            <span className="mt-4 block font-serif text-sm text-ink group-hover:text-gold-600">
              {cat.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
