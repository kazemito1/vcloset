"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface HeroSlide {
  video: string;
  poster: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaHref: string;
}

const SLIDES: HeroSlide[] = [
  {
    video: "/videos/hero-vcloset-editorial.mp4",
    poster: "/images/hero-vcloset-editorial-poster.png",
    eyebrow: "Joalheria Premium",
    title: "V.CLOSET",
    subtitle: "Joias que acompanham a sua essência, feitas para marcar cada momento.",
    ctaLabel: "Ver coleção",
    ctaHref: "/categorias/aneis",
  },
  {
    video: "/videos/hero-feminino-roupas.mp4",
    poster: "/images/hero-feminino-roupas-poster.png",
    eyebrow: "Moda Feminina",
    title: "Elegância em Cada Detalhe",
    subtitle:
      "Roupas femininas sofisticadas em tecidos nobres, complementadas por joias e acessórios dourados.",
    ctaLabel: "Ver trajes femininos",
    ctaHref: "/categorias/trajes-femininos",
  },
  {
    video: "/videos/hero-masculino-roupas.mp4",
    poster: "/images/hero-masculino-roupas-poster.png",
    eyebrow: "Moda Masculina",
    title: "Presença e Sofisticação",
    subtitle:
      "Alfaiataria impecável com relógios e acessórios que completam o visual com elegância.",
    ctaLabel: "Ver masculino",
    ctaHref: "/categorias/masculino",
  },
];

const SLIDE_MS = 8000;

export function HeroCarousel() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % SLIDES.length);
    }, SLIDE_MS);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative min-h-[70vh] overflow-hidden bg-black text-white">
      <div
        className="flex w-full transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${active * 100}%)` }}
      >
        {SLIDES.map((slide) => (
          <div key={slide.video} className="relative min-h-[70vh] w-full shrink-0">
            {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
            <video
              src={slide.video}
              poster={slide.poster}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              className="absolute inset-0 h-full w-full object-cover"
              aria-hidden="true"
            />
            <div className="absolute inset-0 bg-black/45" />
            <div className="relative z-10 mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center px-4 text-center">
              <p className="mb-4 text-xs uppercase tracking-widest2 text-gold-300">{slide.eyebrow}</p>
              <h1 className="font-serif text-4xl leading-tight md:text-6xl">{slide.title}</h1>
              <p className="mx-auto mt-6 max-w-xl text-lg text-white/85">{slide.subtitle}</p>
              <Link href={slide.ctaHref} className="btn-gold mt-8 inline-flex">
                {slide.ctaLabel}
              </Link>
            </div>
          </div>
        ))}
      </div>

      <div className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 gap-2">
        {SLIDES.map((slide, idx) => (
          <button
            key={slide.video}
            aria-label={`Ir para slide ${idx + 1}`}
            onClick={() => setActive(idx)}
            className={`h-1.5 rounded-full transition-all ${
              idx === active ? "w-8 bg-gold-400" : "w-4 bg-white/40 hover:bg-white/70"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
