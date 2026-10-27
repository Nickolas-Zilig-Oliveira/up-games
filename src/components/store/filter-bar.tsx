"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import { Search, X } from "lucide-react";

type Option = { value: string; label: string; count: number };

const sorts = [
  ["destaques", "Destaques"],
  ["menor-preco", "Menor preço"],
  ["maior-preco", "Maior preço"],
  ["novidades", "Novidades"],
  ["nome", "Nome (A–Z)"],
];

/** Filtros do catálogo numa barra fixa no topo — sem sidebar. */
export function FilterBar({ categories, platforms, total }: { categories: Option[]; platforms: Option[]; total: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const [pending, start] = useTransition();
  const [q, setQ] = useState(sp.get("q") ?? "");

  const categoria = sp.get("categoria") ?? "";
  const plataforma = sp.get("plataforma") ?? "";
  const condicao = sp.get("condicao") ?? "";
  const ordem = sp.get("ordem") ?? "destaques";
  const filtered = !!(categoria || plataforma || condicao || sp.get("q"));

  function set(patch: Record<string, string>) {
    const next = new URLSearchParams(sp.toString());
    for (const [k, v] of Object.entries(patch)) {
      if (v && !(k === "ordem" && v === "destaques")) next.set(k, v);
      else next.delete(k);
    }
    const qs = next.toString();
    start(() => router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false }));
  }

  useEffect(() => {
    const t = setTimeout(() => {
      if ((sp.get("q") ?? "") !== q.trim()) set({ q: q.trim() });
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const chip = (on: boolean) =>
    `chamfer-sm whitespace-nowrap px-3.5 py-2 text-sm font-semibold transition-colors ${
      on ? "bg-ember text-void" : "bg-plate/70 text-fog hover:bg-plate-2 hover:text-chalk"
    }`;

  return (
    <div className="z-30 border-y sm:sticky sm:top-[72px] border-line bg-void/90 backdrop-blur-xl">
      <div className="mx-auto max-w-[1320px] px-4 sm:px-6">
        <nav className="scrollbar-none -mx-4 flex gap-7 overflow-x-auto px-4 pt-3 sm:mx-0 sm:px-0" aria-label="Categorias">
          {[{ value: "", label: "Tudo", count: total }, ...categories].map((c) => {
            const on = categoria === c.value;
            return (
              <button
                key={c.value || "tudo"}
                onClick={() => set({ categoria: c.value })}
                aria-pressed={on}
                className={`relative flex shrink-0 items-baseline gap-1.5 pb-3 transition-colors ${on ? "text-chalk" : "text-dim hover:text-fog"}`}
              >
                <span className="display text-[1.7rem] sm:text-[2.1rem]">{c.label}</span>
                <span className="tabular text-xs font-semibold">{c.count}</span>
                {on && (
                  <motion.span layoutId="cat-underline" className="absolute inset-x-0 bottom-0 h-[3px] bg-ember" transition={{ type: "spring", stiffness: 500, damping: 40 }} />
                )}
              </button>
            );
          })}
        </nav>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-line/60 py-3">
          <div className="scrollbar-none -mx-4 flex max-w-full gap-1.5 overflow-x-auto px-4 sm:mx-0 sm:px-0" role="group" aria-label="Plataforma">
            {platforms.map((p) => (
              <button key={p.value} onClick={() => set({ plataforma: plataforma === p.value ? "" : p.value })} aria-pressed={plataforma === p.value} className={chip(plataforma === p.value)}>
                {p.label}
              </button>
            ))}
          </div>

          <div className="ml-auto flex flex-wrap items-center gap-2">
            <div className="chamfer-sm flex bg-plate/70 p-0.5" role="group" aria-label="Condição">
              {[
                ["", "Todos"],
                ["novo", "Novos"],
                ["seminovo", "Seminovos"],
              ].map(([v, l]) => (
                <button key={v} onClick={() => set({ condicao: v })} aria-pressed={condicao === v} className={`px-3 py-1.5 text-sm font-semibold transition-colors ${condicao === v ? "bg-plate-2 text-chalk" : "text-fog hover:text-chalk"}`}>
                  {l}
                </button>
              ))}
            </div>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-dim" />
              <input className="field h-10 w-44 pl-9 text-sm" placeholder="Buscar" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Buscar na loja" />
            </div>
            <select className="field h-10 w-auto min-w-[150px] text-sm" value={ordem} onChange={(e) => set({ ordem: e.target.value })} aria-label="Ordenar por">
              {sorts.map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
            {filtered && (
              <button
                onClick={() => {
                  setQ("");
                  start(() => router.push(pathname, { scroll: false }));
                }}
                className="flex items-center gap-1 text-sm font-semibold text-ember hover:text-gold"
              >
                <X className="size-4" /> Limpar
              </button>
            )}
          </div>
        </div>
      </div>
      <div className={`h-[2px] origin-left bg-ember transition-all duration-300 ${pending ? "w-full opacity-100" : "w-0 opacity-0"}`} />
    </div>
  );
}
