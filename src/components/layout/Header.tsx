"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { CATEGORIES, NAV_GROUPS, STORE_NAME } from "@/lib/constants";
import { useCartStore } from "@/store/cartStore";
import { formatBRL } from "@/lib/format";
import { SearchModal } from "./SearchModal";
import { CategoryLink } from "@/components/store/CategoryTransition";

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
  const [cep, setCep] = useState("");
  const [cepSaved, setCepSaved] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const pathname = usePathname();
  const totalItems = useCartStore((s) => s.totalItems());
  const cartItems = useCartStore((s) => s.items);
  const cartCode = useCartStore((s) => s.appliedCode);
  const [cartSyncReady, setCartSyncReady] = useState(false);
  const freeShippingLabel = settings ? formatBRL(settings.freeShippingCents) : "R$ 499";

  useEffect(() => {
    setCep(window.localStorage.getItem("vcloset-cep") ?? "");
  }, []);

  // Carrinho salvo na conta: restaura a sacola do servidor quando o carrinho
  // local está vazio (ex.: outro dispositivo) e salva a cada alteração.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/conta/carrinho", { cache: "no-store" });
        if (res.ok && !cancelled) {
          const { cart } = await res.json();
          const local = useCartStore.getState().items;
          if (Array.isArray(cart?.items) && cart.items.length > 0 && local.length === 0) {
            useCartStore.setState({
              items: cart.items,
              appliedCode: cart.appliedCode ?? null,
            });
          }
        }
      } catch {
        // offline: segue só com o carrinho local
      } finally {
        if (!cancelled) setCartSyncReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!cartSyncReady) return;
    const timer = setTimeout(() => {
      fetch("/api/conta/carrinho", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: cartItems, appliedCode: cartCode }),
      }).catch(() => {});
    }, 800);
    return () => clearTimeout(timer);
  }, [cartItems, cartCode, cartSyncReady]);

  function handleCepChange(value: string) {
    const digits = value.replace(/\D/g, "").slice(0, 8);
    setCep(digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits);
    setCepSaved(false);
  }

  function handleCepSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (cep.replace(/\D/g, "").length === 8) {
      window.localStorage.setItem("vcloset-cep", cep);
      setCepSaved(true);
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b border-gold-400/20 bg-cream/95 backdrop-blur">
      <div className="bg-ink py-2 text-center text-xs uppercase tracking-wide text-gold-400">
        Frete grátis para todo o Brasil em compras acima de {freeShippingLabel}
      </div>
      <div className="container-page flex justify-center py-3">
        <Link href="/">
          <span className="font-serif text-2xl tracking-widest2 text-ink md:text-3xl">
            {STORE_NAME}
          </span>
        </Link>
      </div>
      <div className="border-t border-gold-400/15">
        <div className="container-page relative flex min-h-[58px] items-center justify-center py-3">
        <button
          className="absolute left-0 text-ink xl:hidden"
          aria-label="Abrir menu"
          onClick={() => setMenuOpen((v) => !v)}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M4 6h16M4 12h16M4 18h16" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>

        <form
          onSubmit={handleCepSubmit}
          className="absolute -left-7 hidden items-center gap-2 xl:flex"
        >
          <label className="sr-only" htmlFor="header-cep">
            Informe seu CEP
          </label>
          <div className="flex h-9 items-center border-b border-neutral-300 focus-within:border-gold-500">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              className="mr-2 text-gold-600"
              aria-hidden="true"
            >
              <path
                d="M12 21s7-5.2 7-12A7 7 0 105 9c0 6.8 7 12 7 12z"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="12" cy="9" r="2.5" strokeWidth="1.5" />
            </svg>
            <input
              id="header-cep"
              value={cep}
              onChange={(event) => handleCepChange(event.target.value)}
              inputMode="numeric"
              maxLength={9}
              placeholder="Informe seu CEP"
              className="w-28 bg-transparent text-xs tracking-wide text-ink outline-none placeholder:text-ink/45"
            />
          </div>
          <button
            type="submit"
            className="text-[10px] font-medium uppercase tracking-wide text-gold-700 hover:text-gold-500"
          >
            {cepSaved ? "Salvo" : "OK"}
          </button>
        </form>

        <nav className="hidden items-center justify-center gap-7 xl:flex">
          {NAV_GROUPS.map((group) => {
            if (group.type === "link") {
              const cat = categoryBySlug(group.slug);
              const href = group.href ?? `/categorias/${group.slug}`;
              return (
                <CategoryLink
                  key={group.label}
                  href={href}
                  className={`text-sm uppercase tracking-wide transition-colors hover:text-gold-600 ${
                    pathname === href ? "text-gold-600" : "text-ink"
                  }`}
                >
                  {cat?.name ?? group.label}
                </CategoryLink>
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
                    <div className="rounded-sm border border-gold-400/25 bg-cream p-6 shadow-lg">
                      <div className="grid grid-cols-2 gap-4">
                        {group.slugs.map((slug) => {
                          const cat = categoryBySlug(slug);
                          if (!cat) return null;
                          return (
                            <CategoryLink
                              key={cat.slug}
                              href={`/categorias/${cat.slug}`}
                              onClick={() => setOpenGroup(null)}
                              className="group flex items-center gap-3 rounded-sm p-2 transition-colors hover:bg-neutral-100"
                            >
                              <span className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-full bg-neutral-100">
                                <Image src={cat.image} alt={cat.name} fill className="object-cover p-2" />
                              </span>
                              <span className="text-sm text-ink group-hover:text-gold-600">
                                {cat.name}
                              </span>
                            </CategoryLink>
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
            href="/contato"
            className={`text-sm uppercase tracking-wide transition-colors hover:text-gold-600 ${
              pathname === "/contato" ? "text-gold-600" : "text-ink"
            }`}
          >
            Contato
          </Link>
          <Link
            href="/pedidos"
            className={`text-sm uppercase tracking-wide transition-colors hover:text-gold-600 ${
              pathname === "/pedidos" ? "text-gold-600" : "text-ink"
            }`}
          >
            Pedidos
          </Link>
        </nav>

        <div className="absolute right-0 flex items-center gap-4">
          <button
            onClick={() => setSearchOpen(true)}
            aria-label="Buscar produtos"
            className={`transition-colors hover:text-gold-600 ${
              pathname === "/busca" ? "text-gold-600" : "text-ink"
            }`}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="11" cy="11" r="7" strokeWidth="1.4" />
              <path d="M20 20l-4.35-4.35" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <Link
            href="/conta"
            aria-label="Minha Conta"
            className={`transition-colors hover:text-gold-600 ${
              pathname === "/conta" ? "text-gold-600" : "text-ink"
            }`}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="7" r="4.5" strokeWidth="1.3" />
              <path
                d="M4 21v-3.25A5.75 5.75 0 019.75 12h4.5A5.75 5.75 0 0120 17.75V21"
                strokeWidth="1.3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
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
      </div>

      {menuOpen && (
        <nav className="flex flex-col gap-1 border-t border-gold-400/20 bg-cream px-4 py-4 xl:hidden">
          {NAV_GROUPS.map((group) => {
            if (group.type === "link") {
              const cat = categoryBySlug(group.slug);
              const href = group.href ?? `/categorias/${group.slug}`;
              return (
                <CategoryLink
                  key={group.label}
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  className="py-2 text-sm uppercase tracking-wide text-ink"
                >
                  {cat?.name ?? group.label}
                </CategoryLink>
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
                        <CategoryLink
                          key={cat.slug}
                          href={`/categorias/${cat.slug}`}
                          onClick={() => setMenuOpen(false)}
                          className="py-1.5 text-sm text-ink/70"
                        >
                          {cat.name}
                        </CategoryLink>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          <Link
            href="/contato"
            onClick={() => setMenuOpen(false)}
            className="py-2 text-sm uppercase tracking-wide text-ink"
          >
            Contato
          </Link>
          <Link
            href="/pedidos"
            onClick={() => setMenuOpen(false)}
            className="py-2 text-sm uppercase tracking-wide text-ink"
          >
            Pedidos
          </Link>
        </nav>
      )}
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  );
}
