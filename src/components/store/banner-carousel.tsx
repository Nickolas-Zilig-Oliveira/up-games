"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Banner } from "@/lib/types";
import { BannerSlide } from "./banner-slide";

/** Carrossel de banners: desliza com o dedo, troca sozinho a cada 6s e pausa quando alguém interage. */
export function BannerCarousel({ banners }: { banners: Banner[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const paused = useRef(false);

  const go = useCallback((i: number) => {
    const el = ref.current;
    if (!el) return;
    const n = el.children.length;
    el.scrollTo({ left: ((i + n) % n) * el.clientWidth, behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (banners.length < 2) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const t = setInterval(() => {
      if (!paused.current && !document.hidden) go(((ref.current?.scrollLeft ?? 0) / (ref.current?.clientWidth || 1) + 1) | 0);
    }, 6000);
    return () => clearInterval(t);
  }, [banners.length, go]);

  return (
    <div
      className="relative"
      onPointerEnter={() => (paused.current = true)}
      onPointerLeave={() => (paused.current = false)}
      onTouchStart={() => (paused.current = true)}
    >
      <div
        ref={ref}
        onScroll={(e) => setIndex(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}
        className="scrollbar-none flex snap-x snap-mandatory overflow-x-auto"
        aria-roledescription="carrossel"
        aria-label="Destaques da loja"
      >
        {banners.map((b) => (
          <div key={b.id} className="w-full shrink-0 snap-center">
            <BannerSlide {...b} />
          </div>
        ))}
      </div>

      {banners.length > 1 && (
        <>
          <button onClick={() => go(index - 1)} aria-label="Banner anterior" className="chamfer-sm absolute left-3 top-1/2 hidden size-11 -translate-y-1/2 place-items-center bg-black/50 text-white backdrop-blur hover:bg-ember sm:grid">
            <ChevronLeft className="size-5" />
          </button>
          <button onClick={() => go(index + 1)} aria-label="Próximo banner" className="chamfer-sm absolute right-3 top-1/2 hidden size-11 -translate-y-1/2 place-items-center bg-black/50 text-white backdrop-blur hover:bg-ember sm:grid">
            <ChevronRight className="size-5" />
          </button>
          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2 bg-black/45 px-3 py-2 backdrop-blur">
            {banners.map((b, i) => (
              <button key={b.id} onClick={() => go(i)} aria-label={`Ir para o banner ${i + 1}`} aria-current={i === index} className={`h-2 -skew-x-[20deg] transition-all ${i === index ? "w-8 bg-ember" : "w-3 bg-white/60"}`} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
