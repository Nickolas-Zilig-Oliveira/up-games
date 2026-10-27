"use client";

import { motion, useReducedMotion } from "motion/react";

const colors = ["#ff6b1a", "#ffc93c", "#8e4dff", "#3fa9ff", "#f4efff"];

/** Estrelinhas da logo que estouram uma única vez quando o pedido é confirmado. */
export function ConfettiBurst() {
  const reduce = useReducedMotion();
  if (reduce) return null;
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      {Array.from({ length: 22 }).map((_, i) => {
        const angle = (i / 22) * Math.PI * 2;
        const dist = 120 + (i % 5) * 40;
        return (
          <motion.svg
            key={i}
            viewBox="0 0 100 100"
            className="absolute left-[85%] top-1/2 size-3"
            style={{ color: colors[i % colors.length] }}
            initial={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 0.4 }}
            animate={{ x: Math.cos(angle) * dist, y: Math.sin(angle) * dist * 0.6, opacity: 0, rotate: 180, scale: 1.2 }}
            transition={{ duration: 1.3, ease: [0.2, 0.9, 0.1, 1], delay: 0.15 }}
          >
            <path d="M50 2 L60 40 L98 50 L60 60 L50 98 L40 60 L2 50 L40 40 Z" fill="currentColor" />
          </motion.svg>
        );
      })}
    </div>
  );
}
