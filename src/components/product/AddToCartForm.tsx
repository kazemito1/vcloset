"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatBRL } from "@/lib/format";
import { useCartStore } from "@/store/cartStore";
import type { Product } from "@/types";

interface AddToCartFormProps {
  product: Product;
}

export function AddToCartForm({ product }: AddToCartFormProps) {
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const [variantLabel, setVariantLabel] = useState<string | undefined>(
    product.variants[0]?.label
  );
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const hasDiscount =
    typeof product.salePriceCents === "number" &&
    product.salePriceCents > 0 &&
    product.salePriceCents < product.priceCents;
  const effectivePriceCents = hasDiscount ? product.salePriceCents! : product.priceCents;

  function handleAdd() {
    addItem({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      image: product.images[0],
      unitPriceCents: effectivePriceCents,
      quantity,
      variantLabel,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  function handleBuyNow() {
    handleAdd();
    router.push("/carrinho");
  }

  return (
    <div className="mt-8 space-y-6">
      {hasDiscount ? (
        <div className="flex items-baseline gap-3">
          <p className="text-lg text-ink/40 line-through">{formatBRL(product.priceCents)}</p>
          <p className="text-3xl font-serif text-ink">{formatBRL(effectivePriceCents)}</p>
        </div>
      ) : (
        <p className="text-3xl font-serif text-ink">{formatBRL(product.priceCents)}</p>
      )}
      <p className="text-sm text-ink/60">
        Em até 10x sem juros no cartão de crédito ou 5% de desconto no PIX.
      </p>

      {product.variants.length > 0 && (
        <div>
          <label className="mb-2 block text-xs uppercase tracking-widest2 text-ink/70">
            Tamanho
          </label>
          <div className="flex flex-wrap gap-2">
            {product.variants.map((v) => (
              <button
                key={v.id}
                onClick={() => setVariantLabel(v.label)}
                className={`border px-4 py-2 text-sm transition-colors ${
                  variantLabel === v.label
                    ? "border-ink bg-ink text-gold-400"
                    : "border-gold-400/40 text-ink hover:border-ink"
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <label className="mb-2 block text-xs uppercase tracking-widest2 text-ink/70">
          Quantidade
        </label>
        <div className="flex w-32 items-center border border-gold-400/40">
          <button
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="flex-1 py-2 text-lg"
            aria-label="Diminuir"
          >
            −
          </button>
          <span className="flex-1 text-center">{quantity}</span>
          <button
            onClick={() => setQuantity((q) => q + 1)}
            className="flex-1 py-2 text-lg"
            aria-label="Aumentar"
          >
            +
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button onClick={handleAdd} className="btn-gold-outline flex-1">
          {added ? "Adicionado ✓" : "Adicionar ao carrinho"}
        </button>
        <button onClick={handleBuyNow} className="btn-gold flex-1">
          Comprar agora
        </button>
      </div>
    </div>
  );
}
