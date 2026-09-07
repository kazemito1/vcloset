"use client";

import Image from "next/image";
import { useRef, useState } from "react";

interface ProductGalleryProps {
  images: string[];
  name: string;
  videoUrl?: string | null;
}

export function ProductGallery({ images, name, videoUrl }: ProductGalleryProps) {
  const [active, setActive] = useState(0);
  const [zoomStyle, setZoomStyle] = useState<React.CSSProperties>({});
  const [zooming, setZooming] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const list = images.length > 0 ? images : ["/products/placeholder-aneis.svg"];
  // O vídeo entra como um slide extra depois das fotos.
  const videoIndex = videoUrl ? list.length : -1;
  const showingVideo = active === videoIndex;
  const slideCount = list.length + (videoUrl ? 1 : 0);

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
          showingVideo ? "" : "cursor-zoom-in"
        }`}
        onMouseEnter={() => !showingVideo && setZooming(true)}
        onMouseLeave={() => setZooming(false)}
        onMouseMove={showingVideo ? undefined : handleMouseMove}
      >
        {showingVideo && videoUrl ? (
          <video
            src={videoUrl}
            poster={list[0]}
            autoPlay
            loop
            muted
            playsInline
            className="h-full w-full object-cover"
          />
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
          {videoUrl && (
            <button
              onClick={() => setActive(videoIndex)}
              aria-label={`Ver vídeo de ${name}`}
              className={`relative h-20 w-20 overflow-hidden border ${
                showingVideo ? "border-gold-400" : "border-gold-400/20"
              }`}
            >
              <Image src={list[0]} alt={`${name} — vídeo`} fill className="object-cover" />
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
