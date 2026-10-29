"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ProductArt } from "../product-art";

export function Gallery(props: { images: string[]; name: string; platform: string; rarity: string; icon: string }) {
  const { images, ...art } = props;
  const [i, setI] = useState(0);
  const [zoom, setZoom] = useState({ on: false, x: 50, y: 50 });

  return (
    <div className="lg:sticky lg:top-24 lg:self-start">
      <div className="chamfer p-[2px]" style={{ background: "linear-gradient(160deg, var(--r), transparent 55%)", "--cut": "26px" } as React.CSSProperties}>
        <div
          className="chamfer relative aspect-[5/4] overflow-hidden bg-deep sm:aspect-square"
          style={{ "--cut": "26px" } as React.CSSProperties}
          onMouseMove={(e) => {
            if (!images.length) return;
            const r = e.currentTarget.getBoundingClientRect();
            setZoom({ on: true, x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
          }}
          onMouseLeave={() => setZoom((z) => ({ ...z, on: false }))}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={i}
              className="h-full w-full"
              initial={{ opacity: 0, scale: 1.03 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              style={{
                transformOrigin: `${zoom.x}% ${zoom.y}%`,
              }}
            >
              <div
                className="h-full w-full transition-transform duration-200"
                style={{ transform: zoom.on ? "scale(1.8)" : "none", transformOrigin: `${zoom.x}% ${zoom.y}%` }}
              >
                <ProductArt image={images[i]} {...art} size="lg" />
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      {images.length > 1 && (
        <div className="scrollbar-none mt-3 flex gap-2 overflow-x-auto">
          {images.map((src, k) => (
            <button
              key={src}
              onClick={() => setI(k)}
              className={`chamfer-sm size-16 shrink-0 bg-photo sm:size-20 p-1 transition-[opacity,box-shadow] ${k === i ? "opacity-100 shadow-[inset_0_0_0_2px_var(--color-ember)]" : "opacity-60 hover:opacity-100"}`}
              aria-label={`Ver imagem ${k + 1}`}
              aria-current={k === i}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="h-full w-full object-contain" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
