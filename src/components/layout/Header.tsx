"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { CATEGORIES, NAV_GROUPS, STORE_NAME } from "@/lib/constants";
import { useCartStore } from "@/store/cartStore";
import { formatBRL } from "@/lib/format";

interface HeaderProps {
  settings?: { freeShippingCents: number };
}

function categoryBySlug(slug: string) {
  return CATEGORIES.find((c) => c.slug === slug);
}

export function Header({ settings }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileGroupOpen, setMobileGroupOpen] = useState<string | null>(null);
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const pathname = usePathname();
  const totalItems = useCartStore((s) => s.totalItems());
  const freeShippingLabel = settings ? formatBRL(settings.freeShippingCents) : "R$ 499";

  return (
    <header className="sticky top-0 z-50 border-b border-neutral-200 bg-white/95 backdrop-blur">
      <div className="bg-ink py-2 text-center text-xs uppercase tracking-wide text-gold-400">
        Frete grátis para todo o Brasil em compras acima de {freeShippingLabel}
      </div>
      <div className="container-page flex items-center justify-between py-4">
        <button
          className="lg:hidden text-ink"
          aria-label="Abrir menu"
          onClick={() => setMenuOpen((v) => !v)}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M4 6h16M4 12h16M4 18h16" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>

        <Link href="/" className="flex-1 text-center lg:flex-none">
          <span className="font-serif text-2xl md:text-3xl tracking-widest2 text-ink">
            {STORE_NAME}
          </span>
        </Link>

        <nav className="hidden lg:flex flex-1 justify-center gap-8">
          {NAV_GROUPS.map((group) => {
            if (group.type === "link") {
              const cat = categoryBySlug(group.slug);
              const href = group.href ?? `/categorias/${group.slug}`;
              return (
                <Link
                  key={group.label}
                  href={href}
                  className={`text-sm uppercase tracking-wide transition-colors hover:text-gold-600 ${
                    pathname === href ? "text-gold-600" : "text-ink"
                  }`}
                >
                  {cat?.name ?? group.label}
                </Link>
              );
            }

            return (
              <div
                key={group.label}
                className="relative"
                onMouseEnter={() => setOpenGroup(group.label)}
                onMouseLeave={() => setOpenGroup(null)}
              >
                <button className="flex items-center gap-1 text-sm uppercase tracking-wide text-ink transition-colors hover:text-gold-600">
                  {group.label}
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M6 9l6 6 6-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>

                {openGroup === group.label && (
                  <div className="absolute left-1/2 top-full z-50 w-[420px] -translate-x-1/2 pt-3">
                    <div className="rounded-sm border border-neutral-200 bg-white p-6 shadow-lg">
                      <div className="grid grid-cols-2 gap-4">
                        {group.slugs.map((slug) => {
                          const cat = categoryBySlug(slug);
                          if (!cat) return null;
                          return (
                            <Link
                              key={cat.slug}
                              href={`/categorias/${cat.slug}`}
                              className="group flex items-center gap-3 rounded-sm p-2 transition-colors hover:bg-neutral-50"
                            >
                              <span className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-full bg-neutral-50">
                                <Image src={cat.image} alt={cat.name} fill className="object-cover p-2" />
                              </span>
                              <span className="text-sm text-ink group-hover:text-gold-600">
                                {cat.name}
                              </span>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          <Link
            href="/sobre"
            className={`text-sm uppercase tracking-wide transition-colors hover:text-gold-600 ${
              pathname === "/sobre" ? "text-gold-600" : "text-ink"
            }`}
          >
            Sobre
          </Link>
          <Link
            href="/contato"
            className={`text-sm uppercase tracking-wide transition-colors hover:text-gold-600 ${
              pathname === "/contato" ? "text-gold-600" : "text-ink"
            }`}
          >
            Contato
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <Link href="/carrinho" className="relative" aria-label="Carrinho">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path
                d="M3 3h2l.4 2M7 13h10l3-8H5.4M7 13L5.4 5M7 13l-2 5h13M9 21a1 1 0 100-2 1 1 0 000 2zM18 21a1 1 0 100-2 1 1 0 000 2z"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {totalItems > 0 && (
              <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-gold-400 text-[10px] font-sans text-ink">
                {totalItems}
              </span>
            )}
          </Link>
        </div>
      </div>

      {menuOpen && (
        <nav className="lg:hidden flex flex-col gap-1 border-t border-neutral-200 bg-white px-4 py-4">
          {NAV_GROUPS.map((group) => {
            if (group.type === "link") {
              const cat = categoryBySlug(group.slug);
              const href = group.href ?? `/categorias/${group.slug}`;
              return (
                <Link
                  key={group.label}
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  className="py-2 text-sm uppercase tracking-wide text-ink"
                >
                  {cat?.name ?? group.label}
                </Link>
              );
            }

            const isOpen = mobileGroupOpen === group.label;
            return (
              <div key={group.label} className="border-b border-neutral-100 last:border-b-0">
                <button
                  onClick={() => setMobileGroupOpen(isOpen ? null : group.label)}
                  className="flex w-full items-center justify-between py-2 text-sm uppercase tracking-wide text-ink"
                >
                  {group.label}
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
                  >
                    <path d="M6 9l6 6 6-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                {isOpen && (
                  <div className="flex flex-col gap-1 pb-2 pl-4">
                    {group.slugs.map((slug) => {
                      const cat = categoryBySlug(slug);
                      if (!cat) return null;
                      return (
                        <Link
                          key={cat.slug}
                          href={`/categorias/${cat.slug}`}
                          onClick={() => setMenuOpen(false)}
                          className="py-1.5 text-sm text-ink/70"
                        >
                          {cat.name}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          <Link
            href="/sobre"
            onClick={() => setMenuOpen(false)}
            className="py-2 text-sm uppercase tracking-wide text-ink"
          >
            Sobre
          </Link>
          <Link
            href="/contato"
            onClick={() => setMenuOpen(false)}
            className="py-2 text-sm uppercase tracking-wide text-ink"
          >
            Contato
          </Link>
        </nav>
      )}
    </header>
  );
}
