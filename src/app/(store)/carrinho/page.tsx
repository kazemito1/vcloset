"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import { formatBRL } from "@/lib/format";
import { CouponBox } from "@/components/checkout/CouponBox";

export default function CartPage() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const totalCents = useCartStore((s) => s.totalCents());
  const discountCents = useCartStore((s) => s.discountCents());
  const finalTotalCents = useCartStore((s) => s.finalTotalCents());

  if (items.length === 0) {
    return (
      <div className="container-page py-24 text-center">
        <h1 className="section-title">Seu carrinho está vazio</h1>
        <p className="mt-4 text-ink/60">
          Explore nossa coleção e encontre a peça perfeita para você.
        </p>
        <Link href="/" className="btn-gold mt-8 inline-flex">
          Continuar comprando
        </Link>
      </div>
    );
  }

  return (
    <div className="container-page py-12 md:py-16">
      <h1 className="section-title text-left">Meu Carrinho</h1>

      <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {items.map((item) => (
            <div
              key={`${item.productId}-${item.variantLabel}`}
              className="flex gap-4 border-b border-gold-400/20 pb-6"
            >
              <div className="relative h-24 w-24 flex-shrink-0 bg-white">
                <Image src={item.image} alt={item.name} fill className="object-cover" />
              </div>
              <div className="flex flex-1 flex-col justify-between">
                <div>
                  <Link href={`/produto/${item.slug}`} className="font-serif text-lg text-ink hover:text-gold-600">
                    {item.name}
                  </Link>
                  {item.variantLabel && (
                    <p className="text-sm text-ink/50">Tamanho: {item.variantLabel}</p>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center border border-gold-400/40">
                    <button
                      onClick={() =>
                        updateQuantity(item.productId, item.variantLabel, item.quantity - 1)
                      }
                      className="px-3 py-1"
                    >
                      −
                    </button>
                    <span className="px-3">{item.quantity}</span>
                    <button
                      onClick={() =>
                        updateQuantity(item.productId, item.variantLabel, item.quantity + 1)
                      }
                      className="px-3 py-1"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem(item.productId, item.variantLabel)}
                    className="text-xs uppercase tracking-wide text-ink/50 hover:text-ink"
                  >
                    Remover
                  </button>
                </div>
              </div>
              <p className="font-serif text-lg text-ink">
                {formatBRL(item.unitPriceCents * item.quantity)}
              </p>
            </div>
          ))}
        </div>

        <div className="border border-gold-400/30 p-6 h-fit">
          <h2 className="font-serif text-xl text-ink">Resumo do pedido</h2>

          <div className="mt-4">
            <CouponBox />
          </div>

          <div className="mt-4 flex justify-between text-ink/70">
            <span>Subtotal</span>
            <span>{formatBRL(totalCents)}</span>
          </div>
          {discountCents > 0 && (
            <div className="mt-2 flex justify-between text-emerald-700">
              <span>Desconto</span>
              <span>-{formatBRL(discountCents)}</span>
            </div>
          )}
          <div className="mt-2 flex justify-between text-ink/70">
            <span>Frete</span>
            <span>Calculado no checkout</span>
          </div>
          <div className="mt-4 flex justify-between border-t border-gold-400/20 pt-4 font-serif text-lg text-ink">
            <span>Total</span>
            <span>{formatBRL(finalTotalCents)}</span>
          </div>
          <button onClick={() => router.push("/checkout")} className="btn-gold mt-6 w-full">
            Finalizar compra
          </button>
        </div>
      </div>
    </div>
  );
}
