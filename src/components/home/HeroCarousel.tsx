import Link from "next/link";

export function HeroCarousel() {
  return (
    <section className="relative flex min-h-[70vh] items-center justify-center overflow-hidden bg-black text-white">
      <video
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        poster="/images/hero-vcloset-editorial-poster.png"
        className="absolute inset-0 h-full w-full object-cover"
        aria-hidden="true"
      >
        <source src="/videos/hero-vcloset-editorial.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-black/45" />
      <div className="relative z-10 mx-auto max-w-3xl px-4 text-center">
        <p className="mb-4 text-xs uppercase tracking-widest2 text-gold-300">Joalheria Premium</p>
        <h1 className="font-serif text-4xl leading-tight md:text-6xl">V.CLOSET</h1>
        <p className="mx-auto mt-6 max-w-xl text-lg text-white/85">
          Joias que acompanham a sua essência, feitas para marcar cada momento.
        </p>
        <Link href="/categorias/aneis" className="btn-gold mt-8 inline-flex">
          Ver coleção
        </Link>
      </div>
    </section>
  );
}
