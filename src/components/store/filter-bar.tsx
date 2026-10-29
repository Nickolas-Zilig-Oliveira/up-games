"use client";

import { useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { X } from "lucide-react";

type Option = { value: string; label: string; count: number };

const sorts = [
  ["destaques", "Destaques"],
  ["menor-preco", "Menor preço"],
  ["maior-preco", "Maior preço"],
  ["novidades", "Novidades"],
  ["nome", "Nome (A–Z)"],
];

const conditions = [
  ["", "Todos"],
  ["novo", "Novos"],
  ["seminovo", "Seminovos"],
];

/** Filtros do catálogo: um painel compacto, com categoria em destaque e o resto discreto. */
export function FilterBar({ categories, platforms, total }: { categories: Option[]; platforms: Option[]; total: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const [pending, start] = useTransition();

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

  const label = "mb-1 block text-[0.7rem] font-bold uppercase tracking-wider text-dim";

  return (
    <div className="mx-auto max-w-[1320px] px-4 sm:px-6">
      <div className="chamfer-sm relative overflow-hidden bg-deep p-3 sm:p-4" style={{ "--cut": "14px" } as React.CSSProperties}>
        <div className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-end lg:gap-6">
          <div className="min-w-0">
            <span className={label} id="f-cat">Categoria</span>
            <nav className="scrollbar-none -mx-3 flex gap-2 overflow-x-auto px-3 sm:mx-0 sm:px-0" aria-labelledby="f-cat">
              {[{ value: "", label: "Tudo", count: total }, ...categories].map((c) => {
                const on = categoria === c.value;
                return (
                  <button
                    key={c.value || "tudo"}
                    onClick={() => set({ categoria: c.value })}
                    aria-pressed={on}
                    className={`chamfer-sm flex shrink-0 items-center gap-2 px-4 py-2.5 text-[0.95rem] font-bold transition-colors ${
                      on ? "bg-ember text-void" : "bg-plate/70 text-chalk hover:bg-plate-2"
                    }`}
                  >
                    {c.label}
                    <span className={`tabular text-xs font-semibold ${on ? "opacity-80" : "text-dim"}`}>{c.count}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="flex flex-wrap items-center gap-2 lg:justify-end">
            <select
              className="field h-10 w-auto min-w-[150px] text-sm"
              value={ordem}
              onChange={(e) => set({ ordem: e.target.value })}
              aria-label="Ordenar por"
            >
              {sorts.map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
            {filtered && (
              <button
                onClick={() => start(() => router.push(pathname, { scroll: false }))}
                className="flex h-10 items-center gap-1 px-2 text-sm font-semibold text-ember hover:text-gold"
              >
                <X className="size-4" /> Limpar
              </button>
            )}
          </div>
        </div>

        <div className="mt-3 grid gap-3 border-t border-line/60 pt-3 sm:mt-4 sm:grid-cols-[1fr_auto] sm:items-end sm:gap-6 sm:pt-4">
          <div className="min-w-0">
            <span className={label} id="f-plat">Plataforma</span>
            <div className="scrollbar-none -mx-3 flex gap-1.5 overflow-x-auto px-3 sm:mx-0 sm:px-0" role="group" aria-labelledby="f-plat">
              {platforms.map((p) => {
                const on = plataforma === p.value;
                return (
                  <button
                    key={p.value}
                    onClick={() => set({ plataforma: on ? "" : p.value })}
                    aria-pressed={on}
                    className={`shrink-0 rounded-full px-3 py-1.5 text-sm font-semibold transition-colors ${
                      on ? "bg-chalk text-void" : "bg-plate/60 text-fog hover:bg-plate-2 hover:text-chalk"
                    }`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <span className={label} id="f-cond">Condição</span>
            <div className="inline-flex rounded-full bg-plate/60 p-0.5" role="group" aria-labelledby="f-cond">
              {conditions.map(([v, l]) => (
                <button
                  key={v}
                  onClick={() => set({ condicao: v })}
                  aria-pressed={condicao === v}
                  className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors ${condicao === v ? "bg-chalk text-void" : "text-fog hover:text-chalk"}`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className={`absolute inset-x-0 bottom-0 h-[2px] origin-left bg-ember transition-all duration-300 ${pending ? "w-full opacity-100" : "w-0 opacity-0"}`} />
      </div>
    </div>
  );
}
