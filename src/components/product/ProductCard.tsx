import Image from "next/image";
import Link from "next/link";
import { formatBRL } from "@/lib/format";
import { ProductRating } from "@/components/product/ProductRating";

interface ProductCardProps {
  slug: string;
  name: string;
  material: string;
  priceCents: number;
  salePriceCents?: number | null;
  image: string;
}

export function ProductCard({ slug, name, material, priceCents, salePriceCents, image }: ProductCardProps) {
  const hasDiscount = typeof salePriceCents === "number" && salePriceCents > 0 && salePriceCents < priceCents;
  const discountPercent = hasDiscount
    ? Math.round(((priceCents - salePriceCents!) / priceCents) * 100)
    : 0;

  return (
    <Link href={`/produto/${slug}`} className="group block">
      <div className="relative aspect-[3/4] overflow-hidden rounded-sm bg-neutral-50">
        {hasDiscount && (
          <span className="absolute left-2 top-2 z-10 rounded-sm bg-gold-500 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-ink">
            {discountPercent}% Off
          </span>
        )}
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 50vw, 25vw"
        />
      </div>
      <div className="mt-4 text-center">
        <p className="text-xs uppercase tracking-wide text-gold-600">{material}</p>
        <h3 className="mt-1 font-serif text-lg text-ink">{name}</h3>
        <div className="mt-1 flex justify-center">
          <ProductRating />
        </div>
        {hasDiscount ? (
          <div className="mt-1 flex items-center justify-center gap-2">
            <span className="text-sm text-ink/40 line-through">{formatBRL(priceCents)}</span>
            <span className="text-base font-medium text-ink">{formatBRL(salePriceCents!)}</span>
          </div>
        ) : (
          <p className="mt-1 text-base text-ink/80">{formatBRL(priceCents)}</p>
        )}
      </div>
    </Link>
  );
}
