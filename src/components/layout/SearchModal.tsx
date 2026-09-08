"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CATEGORIES } from "@/lib/constants";
import { formatBRL } from "@/lib/format";
import type { Product } from "@/types";
import { CategoryLink } from "@/components/store/CategoryTransition";

interface SearchModalProps {
  open: boolean;
  onClose: () => void;
}

export function SearchModal({ open, onClose }: SearchModalProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string; slug: string; image: string }[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
      setQuery("");
      setProducts([]);
      setCategories([]);
    }
  }, [open]);

  useEffect(() => {
    const term = query.trim();
    if (term.length < 2) {
      setProducts([]);
      setCategories([]);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(term)}`);
        const data = await res.json();
        setProducts(data.products || []);
        setCategories(data.categories || []);
      } catch {
        setProducts([]);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (query.trim()) {
      router.push(`/busca?q=${encodeURIComponent(query.trim())}`);
      onClose();
    }
  }

  if (!open) return null;

  const hasResults = products.length > 0 || categories.length > 0;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm">
      <div className="absolute inset-x-0 top-0 bg-cream shadow-gold">
        <div className="container-page py-4 md:py-6">
          <form onSubmit={handleSubmit} className="relative">
            <svg
              className="absolute left-0 top-1/2 -translate-y-1/2 text-gold-600"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <circle cx="11" cy="11" r="7" strokeWidth="1.4" />
              <path d="M20 20l-4.35-4.35" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por produto, material ou categoria..."
              className="w-full border-b border-gold-400/30 bg-transparent py-3 pl-10 pr-10 font-serif text-lg text-ink outline-none placeholder:text-ink/40 focus:border-gold-500"
            />
            <button
              type="button"
              onClick={onClose}
              className="absolute right-0 top-1/2 -translate-y-1/2 text-ink/60 hover:text-ink"
              aria-label="Fechar busca"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M18 6L6 18M6 6l12 12" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </form>

          {query.trim().length < 2 ? (
            <div className="mt-6">
              <p className="mb-3 text-xs uppercase tracking-widest2 text-ink/50">Categorias populares</p>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {CATEGORIES.slice(0, 4).map((cat) => (
                  <CategoryLink
                    key={cat.slug}
                    href={`/categorias/${cat.slug}`}
                    onClick={onClose}
                    className="flex items-center gap-3 rounded-sm border border-gold-400/15 p-2 transition-colors hover:bg-neutral-100"
                  >
                    <span className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-full bg-neutral-100">
                      <Image src={cat.image} alt={cat.name} fill className="object-cover p-1.5" />
                    </span>
                    <span className="text-sm text-ink">{cat.name}</span>
                  </CategoryLink>
                ))}
              </div>
            </div>
          ) : loading ? (
            <p className="mt-6 text-sm text-ink/50">Buscando...</p>
          ) : !hasResults ? (
            <div className="mt-6">
              <p className="text-sm text-ink/60">Nenhum resultado para “{query.trim()}”. Tente outro termo.</p>
              <Link
                href="/"
                onClick={onClose}
                className="mt-4 inline-block text-xs uppercase tracking-wide text-gold-700 hover:text-gold-500"
              >
                Ver todos os produtos
              </Link>
            </div>
          ) : (
            <div className="mt-6 max-h-[60vh] overflow-y-auto">
              {categories.length > 0 && (
                <div className="mb-5">
                  <p className="mb-2 text-xs uppercase tracking-widest2 text-ink/50">Categorias</p>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((cat) => (
                      <CategoryLink
                        key={cat.id}
                        href={`/categorias/${cat.slug}`}
                        onClick={onClose}
                        className="rounded-sm border border-gold-400/30 px-3 py-1.5 text-sm text-ink transition-colors hover:border-gold-500 hover:text-gold-600"
                      >
                        {cat.name}
                      </CategoryLink>
                    ))}
                  </div>
                </div>
              )}

              {products.length > 0 && (
                <div>
                  <p className="mb-2 text-xs uppercase tracking-widest2 text-ink/50">Produtos</p>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {products.map((p) => (
                      <Link
                        key={p.id}
                        href={`/produto/${p.slug}`}
                        onClick={onClose}
                        className="flex items-center gap-3 rounded-sm border border-gold-400/10 p-2 transition-colors hover:bg-neutral-100"
                      >
                        <span className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-sm bg-neutral-100">
                          <Image src={p.images[0]} alt={p.name} fill className="object-cover" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-ink">{p.name}</p>
                          <p className="text-xs text-ink/50">{p.category?.name ?? p.material}</p>
                          <p className="mt-0.5 text-sm text-gold-700">
                            {formatBRL(p.salePriceCents ?? p.priceCents)}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
