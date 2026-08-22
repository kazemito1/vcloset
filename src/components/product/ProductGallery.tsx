"use client";

import Image from "next/image";
import { useRef, useState } from "react";

interface ProductGalleryProps {
  images: string[];
  name: string;
}

export function ProductGallery({ images, name }: ProductGalleryProps) {
  const [active, setActive] = useState(0);
  const [zoomStyle, setZoomStyle] = useState<React.CSSProperties>({});
  const [zooming, setZooming] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const list = images.length > 0 ? images : ["/products/placeholder-aneis.svg"];

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
        className="relative aspect-[3/4] cursor-zoom-in overflow-hidden bg-white"
        onMouseEnter={() => setZooming(true)}
        onMouseLeave={() => setZooming(false)}
        onMouseMove={handleMouseMove}
      >
        <Image
          src={list[active]}
          alt={name}
          fill
          className="object-cover transition-transform duration-200 ease-out"
          style={{ ...zoomStyle, transform: zooming ? "scale(2)" : "scale(1)" }}
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
        />
      </div>
      {list.length > 1 && (
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
        </div>
      )}
    </div>
  );
}
