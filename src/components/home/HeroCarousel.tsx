"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface Slide {
  eyebrow: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaHref: string;
}

const SLIDES: Slide[] = [
  {
    eyebrow: "Joalheria Premium",
    title: "V.CLOSET",
    subtitle:
      "Peças exclusivas em ouro, prata e materiais nobres — para eternizar os momentos mais importantes da sua vida.",
    ctaLabel: "Ver coleção",
    ctaHref: "/categorias/aneis",
  },
  {
    eyebrow: "Novidades",
    title: "Coleção Alianças",
    subtitle: "Simbolize seu compromisso com peças atemporais, feitas para durar gerações.",
    ctaLabel: "Explorar alianças",
    ctaHref: "/categorias/aliancas",
  },
  {
    eyebrow: "Presentes",
    title: "Para Momentos Únicos",
    subtitle: "Colares, brincos e pulseiras selecionados para presentear com sofisticação.",
    ctaLabel: "Ver presentes",
    ctaHref: "/categorias/colares",
  },
];

export function HeroCarousel() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  function goTo(idx: number) {
    setActive(idx);
  }

  function prev() {
    setActive((p) => (p - 1 + SLIDES.length) % SLIDES.length);
  }

  function next() {
    setActive((p) => (p + 1) % SLIDES.length);
  }

  const slide = SLIDES[active];

  return (
    <section className="relative flex min-h-[70vh] items-center justify-center overflow-hidden bg-neutral-50 text-ink">
      <div className="relative z-10 mx-auto max-w-3xl px-4 text-center">
        <p className="mb-4 text-xs uppercase tracking-widest2 text-gold-600">{slide.eyebrow}</p>
        <h1 className="font-serif text-4xl leading-tight md:text-6xl">{slide.title}</h1>
        <p className="mx-auto mt-6 max-w-xl text-lg text-ink/70">{slide.subtitle}</p>
        <Link href={slide.ctaHref} className="btn-gold mt-8 inline-flex">
          {slide.ctaLabel}
        </Link>
      </div>

      <button
        aria-label="Slide anterior"
        onClick={prev}
        className="absolute left-4 top-1/2 z-10 hidden -translate-y-1/2 rounded-full border border-neutral-200 bg-white p-2 text-ink transition-colors hover:border-gold-400 md:block"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M15 18l-6-6 6-6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <button
        aria-label="Próximo slide"
        onClick={next}
        className="absolute right-4 top-1/2 z-10 hidden -translate-y-1/2 rounded-full border border-neutral-200 bg-white p-2 text-ink transition-colors hover:border-gold-400 md:block"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M9 18l6-6-6-6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <div className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 gap-2">
        {SLIDES.map((_, idx) => (
          <button
            key={idx}
            aria-label={`Ir para slide ${idx + 1}`}
            onClick={() => goTo(idx)}
            className={`h-1.5 rounded-full transition-all ${
              idx === active ? "w-8 bg-gold-500" : "w-4 bg-gold-500/30"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
