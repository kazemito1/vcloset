"use client";

import Image from "next/image";
import { useRef, useState } from "react";

interface ProductGalleryProps {
  images: string[];
  name: string;
  /** Arquivo de vídeo real (ex.: "/products/relogio-video.mp4"), quando existir. */
  videoUrl?: string | null;
  /**
   * Quando true e não houver `videoUrl`, exibe um slide de "clipe" animado a
   * partir das próprias fotos do produto (zoom lento + crossfade), sem
   * adicionar nenhum arquivo de vídeo ao deploy.
   */
  motionClip?: boolean;
}

export function ProductGallery({
  images,
  name,
  videoUrl,
  motionClip,
}: ProductGalleryProps) {
  const [active, setActive] = useState(0);
  const [zoomStyle, setZoomStyle] = useState<React.CSSProperties>({});
  const [zooming, setZooming] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const list = images.length > 0 ? images : ["/products/placeholder-aneis.svg"];

  // O vídeo (ou o clipe animado) entra como um slide extra depois das fotos.
  const hasMotionSlide = Boolean(videoUrl) || Boolean(motionClip);
  const motionIndex = hasMotionSlide ? list.length : -1;
  const showingMotion = active === motionIndex;
  const slideCount = list.length + (hasMotionSlide ? 1 : 0);
  const hasSecondPhoto = list.length > 1;

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomStyle({ transformOrigin: `${x}% ${y}%` });
  }

  return (
    <div>
      <div
        ref={containerRef}
        className={`relative aspect-[3/4] overflow-hidden bg-neutral-100 ${
          showingMotion ? "" : "cursor-zoom-in"
        }`}
        onMouseEnter={() => !showingMotion && setZooming(true)}
        onMouseLeave={() => setZooming(false)}
        onMouseMove={showingMotion ? undefined : handleMouseMove}
      >
        {showingMotion && videoUrl ? (
          <video
            src={videoUrl}
            poster={list[0]}
            autoPlay
            loop
            muted
            playsInline
            className="h-full w-full object-cover"
          />
        ) : showingMotion ? (
          <div className="vc-clip-zoom absolute inset-0">
            <Image
              src={list[0]}
              alt={name}
              fill
              className={`object-cover ${hasSecondPhoto ? "vc-clip-fade-a" : ""}`}
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            {hasSecondPhoto && (
              <Image
                src={list[1]}
                alt={`${name} — outro ângulo`}
                fill
                className="vc-clip-fade-b object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            )}
          </div>
        ) : (
          <Image
            src={list[active]}
            alt={name}
            fill
            className="object-cover transition-transform duration-200 ease-out"
            style={{ ...zoomStyle, transform: zooming ? "scale(2)" : "scale(1)" }}
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
        )}
      </div>
      {slideCount > 1 && (
        <div className="mt-4 flex gap-3">
          {list.map((img, idx) => (
            <button
              key={img + idx}
              onClick={() => setActive(idx)}
              className={`relative h-20 w-20 overflow-hidden border ${
                active === idx ? "border-gold-400" : "border-gold-400/20"
              }`}
            >
              <Image src={img} alt={`${name} ${idx + 1}`} fill className="object-cover" />
            </button>
          ))}
          {hasMotionSlide && (
            <button
              onClick={() => setActive(motionIndex)}
              aria-label={`Ver o produto em movimento: ${name}`}
              className={`relative h-20 w-20 overflow-hidden border ${
                showingMotion ? "border-gold-400" : "border-gold-400/20"
              }`}
            >
              <Image src={list[0]} alt={`${name} — em movimento`} fill className="object-cover" />
              <span className="absolute inset-0 flex items-center justify-center bg-ink/40">
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-7 w-7 text-white/90"
                  aria-hidden="true"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
