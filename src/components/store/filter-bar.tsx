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

  const chip = (on: boolean) =>
    `shrink-0 whitespace-nowrap rounded-md border px-3 py-2 text-[0.8rem] font-semibold leading-5 sm:px-2.5 sm:py-1 transition-colors ${
      on ? "border-chalk bg-chalk text-void" : "border-line-strong text-fog hover:border-chalk hover:text-chalk"
    }`;

  return (
    <div className="mx-auto max-w-[1320px] px-4 sm:px-6">
      <div className="relative border-b border-line">
        <nav className="scrollbar-none -mx-4 flex gap-6 overflow-x-auto px-4 sm:mx-0 sm:gap-8 sm:px-0" aria-label="Categoria">
          {[{ value: "", label: "Tudo", count: total }, ...categories].map((c) => {
            const on = categoria === c.value;
            return (
              <button
                key={c.value || "tudo"}
                onClick={() => set({ categoria: c.value })}
                aria-pressed={on}
                className={`relative flex shrink-0 items-baseline gap-1.5 pb-3 pt-1 transition-colors ${on ? "text-chalk" : "text-dim hover:text-chalk"}`}
              >
                <span className="display text-[1.35rem] sm:text-[1.6rem]">{c.label}</span>
                <span className="tabular text-xs font-semibold">{c.count}</span>
                {on && <span className="absolute inset-x-0 -bottom-px h-[3px] bg-ember" />}
              </button>
            );
          })}
        </nav>
        <div className={`absolute inset-x-0 -bottom-px h-[3px] origin-left bg-ember/50 transition-all duration-300 ${pending ? "w-full opacity-100" : "w-0 opacity-0"}`} />
      </div>

      <div className="scrollbar-none -mx-4 mt-3 flex items-center gap-1.5 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        {platforms.map((p) => (
          <button key={p.value} onClick={() => set({ plataforma: plataforma === p.value ? "" : p.value })} aria-pressed={plataforma === p.value} className={chip(plataforma === p.value)}>
            {p.label}
          </button>
        ))}
        <span className="mx-1.5 h-4 w-px shrink-0 bg-line-strong" aria-hidden />
        {conditions.slice(1).map(([v, l]) => (
          <button key={v} onClick={() => set({ condicao: condicao === v ? "" : v })} aria-pressed={condicao === v} className={chip(condicao === v)}>
            {l}
          </button>
        ))}
        {filtered && (
          <button onClick={() => start(() => router.push(pathname, { scroll: false }))} className="flex shrink-0 items-center gap-1 pl-2 text-[0.8rem] font-semibold text-ember hover:text-gold">
            <X className="size-3.5" /> Limpar
          </button>
        )}
        <select className="field ml-auto h-8 w-auto shrink-0 !py-0 text-[0.8rem]" value={ordem} onChange={(e) => set({ ordem: e.target.value })} aria-label="Ordenar por">
          {sorts.map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
