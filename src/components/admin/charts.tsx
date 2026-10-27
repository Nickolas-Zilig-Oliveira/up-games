"use client";

import { useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import { money } from "@/lib/format";

type Point = { date: string; revenue: number; orders: number };

const W = 760;
const H = 260;
const PAD = { t: 16, r: 12, b: 28, l: 56 };

function niceMax(v: number) {
  if (v <= 0) return 100;
  const p = Math.pow(10, Math.floor(Math.log10(v)));
  const n = v / p;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * p;
}

const short = new Intl.NumberFormat("pt-BR", { notation: "compact", maximumFractionDigits: 1 });
const dayFmt = (iso: string) => new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }).replace(".", "");

/** Faturamento diário: área + linha 2px, com crosshair e tooltip no hover. */
export function RevenueChart({ data }: { data: Point[] }) {
  const ref = useRef<SVGSVGElement>(null);
  const [hover, setHover] = useState<number | null>(null);
  const max = niceMax(Math.max(...data.map((d) => d.revenue)));
  const iw = W - PAD.l - PAD.r;
  const ih = H - PAD.t - PAD.b;
  const x = (i: number) => PAD.l + (data.length === 1 ? iw / 2 : (i / (data.length - 1)) * iw);
  const y = (v: number) => PAD.t + ih - (v / max) * ih;

  const { line, area } = useMemo(() => {
    const pts = data.map((d, i) => [x(i), y(d.revenue)] as const);
    const line = pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join("");
    const area = `${line}L${x(data.length - 1)},${PAD.t + ih}L${x(0)},${PAD.t + ih}Z`;
    return { line, area };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, max]);

  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => t * max);
  const every = Math.ceil(data.length / 6);

  function onMove(e: React.PointerEvent) {
    const svg = ref.current;
    if (!svg) return;
    const r = svg.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * W;
    const i = Math.round(((px - PAD.l) / iw) * (data.length - 1));
    setHover(Math.max(0, Math.min(data.length - 1, i)));
  }

  const h = hover !== null ? data[hover] : null;

  return (
    <div className="relative">
      <svg
        ref={ref}
        viewBox={`0 0 ${W} ${H}`}
        className="h-auto w-full touch-none"
        onPointerMove={onMove}
        onPointerLeave={() => setHover(null)}
        role="img"
        aria-label="Faturamento por dia"
      >
        <defs>
          <linearGradient id="rev-fill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#ff6b1a" stopOpacity="0.32" />
            <stop offset="1" stopColor="#ff6b1a" stopOpacity="0" />
          </linearGradient>
        </defs>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={PAD.l} x2={W - PAD.r} y1={y(t)} y2={y(t)} stroke="rgb(190 160 255 / 0.1)" strokeDasharray={t ? "3 4" : undefined} />
            <text x={PAD.l - 10} y={y(t)} dy="0.35em" textAnchor="end" className="fill-dim text-[12.5px]">
              {short.format(t)}
            </text>
          </g>
        ))}
        {data.map((d, i) =>
          i % every === 0 ? (
            <text key={d.date} x={x(i)} y={H - 8} textAnchor="middle" className="fill-dim text-[12.5px]">
              {dayFmt(d.date)}
            </text>
          ) : null,
        )}
        <motion.path d={area} fill="url(#rev-fill)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }} />
        <motion.path
          d={line}
          fill="none"
          stroke="#ff6b1a"
          strokeWidth={2}
          strokeLinejoin="round"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.9, ease: [0.2, 0.9, 0.1, 1] }}
        />
        {h && hover !== null && (
          <g>
            <line x1={x(hover)} x2={x(hover)} y1={PAD.t} y2={PAD.t + ih} stroke="rgb(244 239 255 / 0.35)" />
            <circle cx={x(hover)} cy={y(h.revenue)} r={5} fill="#ff6b1a" stroke="#271d4d" strokeWidth={2} />
          </g>
        )}
      </svg>
      {h && hover !== null && (
        <div
          className="pointer-events-none absolute top-0 z-10 -translate-x-1/2 bg-plate-2 px-3 py-2 text-xs shadow-xl"
          style={{ left: `${(x(hover) / W) * 100}%` }}
        >
          <p className="text-fog">{new Date(h.date).toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "short" })}</p>
          <p className="tabular text-sm font-bold text-chalk">{money(h.revenue)}</p>
          <p className="tabular text-fog">{h.orders} {h.orders === 1 ? "pedido" : "pedidos"}</p>
        </div>
      )}
    </div>
  );
}

/** Barras horizontais de uma só cor, com valor rotulado em cada linha. */
export function BarList({
  items,
  format = "money",
  color = "#ff6b1a",
}: {
  items: { label: string; value: number; sub?: string; color?: string }[];
  format?: "money" | "int";
  color?: string;
}) {
  const max = Math.max(1, ...items.map((i) => i.value));
  const [hover, setHover] = useState<number | null>(null);
  return (
    <ul className="space-y-3">
      {items.map((it, k) => (
        <li key={it.label} onPointerEnter={() => setHover(k)} onPointerLeave={() => setHover(null)} className="group">
          <div className="mb-1.5 flex items-baseline justify-between gap-3 text-sm">
            <span className={`truncate ${hover === k ? "text-chalk" : "text-fog"}`}>{it.label}</span>
            <span className="tabular shrink-0 font-semibold text-chalk">
              {format === "money" ? money(it.value) : it.value}
              {it.sub && <span className="ml-1.5 font-normal text-dim">{it.sub}</span>}
            </span>
          </div>
          <div className="h-2 bg-plate">
            <motion.div
              className="h-full rounded-r-[4px]"
              style={{ background: it.color ?? color, opacity: hover === null || hover === k ? 1 : 0.45 }}
              initial={{ width: 0 }}
              animate={{ width: `${(it.value / max) * 100}%` }}
              transition={{ type: "spring", stiffness: 120, damping: 22, delay: k * 0.04 }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
