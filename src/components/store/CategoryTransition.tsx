"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

// Intervalo pedido pelo lojista: ao trocar de categoria, uma tela de
// transição elegante (preto/dourado) permanece por este tempo antes de
// carregar a página de destino.
const TRANSITION_MS = 5000;
const FADE_MS = 450;
// Segurança: se a navegação travar, o overlay sai sozinho.
const MAX_TOTAL_MS = 8000;

interface CategoryTransitionContextValue {
  start: (href: string) => void;
}

const CategoryTransitionContext = createContext<CategoryTransitionContextValue | null>(null);

function isCategoryHref(href: string): boolean {
  return href.startsWith("/categorias") && !href.startsWith("/categorias/admin");
}

export function CategoryTransitionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [active, setActive] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [runId, setRunId] = useState(0);
  const busyRef = useRef(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  const finish = useCallback(() => {
    setLeaving(true);
    timersRef.current.push(
      setTimeout(() => {
        setActive(false);
        setLeaving(false);
        busyRef.current = false;
      }, FADE_MS)
    );
  }, []);

  const start = useCallback(
    (href: string) => {
      if (busyRef.current) return;
      busyRef.current = true;
      setRunId((n) => n + 1);
      setActive(true);
      setLeaving(false);
      // Espera o intervalo completo antes de iniciar a troca de página.
      timersRef.current.push(setTimeout(() => router.push(href), TRANSITION_MS));
      // Se a navegação não completar, remove o overlay por segurança.
      timersRef.current.push(setTimeout(finish, MAX_TOTAL_MS));
    },
    [router, finish]
  );

  // Navegação completou (pathname mudou): encerra a transição com fade.
  const pathnameRef = useRef(pathname);
  useEffect(() => {
    if (busyRef.current && pathnameRef.current !== pathname) {
      pathnameRef.current = pathname;
      clearTimers();
      finish();
    } else {
      pathnameRef.current = pathname;
    }
  }, [pathname, finish, clearTimers]);

  // Trava o scroll do fundo enquanto a transição está visível.
  useEffect(() => {
    if (!active) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [active]);

  useEffect(() => clearTimers, [clearTimers]);

  return (
    <CategoryTransitionContext.Provider value={{ start }}>
      {children}
      {active && (
        <div
          aria-hidden="true"
          className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-night transition-opacity ${
            leaving ? "opacity-0" : "opacity-100"
          }`}
          style={{ transitionDuration: `${FADE_MS}ms` }}
        >
          <p className="font-serif text-3xl tracking-[0.35em] text-gold-400 md:text-4xl">
            V.CLOSET
          </p>
          <p className="mt-4 text-[10px] uppercase tracking-widest2 text-cream/50">
            Preparando sua experiência
          </p>
          <div className="mt-8 h-px w-56 overflow-hidden bg-gold-400/20">
            <div
              key={runId}
              className="h-full bg-gold-400"
              style={{ animation: `vcload ${TRANSITION_MS}ms linear forwards` }}
            />
          </div>
          <style>{`@keyframes vcload { from { width: 0% } to { width: 100% } }`}</style>
        </div>
      )}
    </CategoryTransitionContext.Provider>
  );
}

// Link idêntico ao next/link, mas que intercepta cliques em destinos de
// categoria (/categorias/*) para disparar a transição de 5s. Links para
// outros destinos continuam navegando normalmente.
export function CategoryLink({
  href,
  onClick,
  ...rest
}: React.ComponentProps<typeof Link>) {
  const ctx = useContext(CategoryTransitionContext);

  return (
    <Link
      href={href}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented) return;
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        if (e.button !== 0) return;
        const target = typeof href === "string" ? href : href?.toString() ?? "";
        if (!isCategoryHref(target) || !ctx) return;
        e.preventDefault();
        ctx.start(target);
      }}
      {...rest}
    />
  );
}
