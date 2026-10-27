import Link from "next/link";
import type { Metadata } from "next";
import { X } from "lucide-react";
import { catalog, filterProducts, type SortKey } from "@/lib/queries";
import { ProductCard } from "@/components/product-card";
import { SortSelect } from "@/components/store/sort-select";

export const metadata: Metadata = { title: "Loja" };

type Search = { categoria?: string; plataforma?: string; q?: string; ordem?: SortKey; condicao?: string };

function href(current: Search, patch: Partial<Search>) {
  const next = { ...current, ...patch };
  const qs = new URLSearchParams(Object.entries(next).filter(([, v]) => v) as [string, string][]).toString();
  return qs ? `/loja?${qs}` : "/loja";
}

export default async function Loja({ searchParams }: PageProps<"/loja">) {
  const sp = (await searchParams) as Search;
  const { products, categories, settings } = await catalog();
  const list = filterProducts(products, sp);
  const category = categories.find((c) => c.slug === sp.categoria);
  const title = sp.q ? `“${sp.q}”` : category?.name ?? sp.plataforma ?? "Toda a loja";
  const platforms = settings.platforms.filter((pl) => products.some((p) => p.platform === pl));
  const active = [
    sp.categoria && { label: category?.name ?? sp.categoria, clear: { categoria: undefined } },
    sp.plataforma && { label: sp.plataforma, clear: { plataforma: undefined } },
    sp.condicao && { label: sp.condicao === "novo" ? "Novos" : "Seminovos", clear: { condicao: undefined } },
    sp.q && { label: `Busca: ${sp.q}`, clear: { q: undefined } },
  ].filter(Boolean) as { label: string; clear: Partial<Search> }[];

  const chip = (on: boolean) =>
    `chamfer-sm whitespace-nowrap px-3 py-2 text-sm font-medium transition-colors ${
      on ? "bg-ember text-void" : "bg-deep text-fog hover:bg-plate hover:text-chalk"
    }`;

  return (
    <div className="mx-auto max-w-[1320px] px-4 pb-10 pt-8 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6">
        <div>
          <h1 className="display text-[clamp(3rem,8vw,6.5rem)]">{title}</h1>
          <p className="mt-2 text-fog">
            {list.length} {list.length === 1 ? "item encontrado" : "itens encontrados"}
          </p>
        </div>
        <SortSelect value={sp.ordem ?? "destaques"} />
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[230px_1fr]">
        <aside className="space-y-7">
          <div>
            <h2 className="mb-3 text-sm font-semibold text-chalk">Categoria</h2>
            <div className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 lg:mx-0 lg:flex-col lg:px-0">
              <Link href={href(sp, { categoria: undefined })} className={chip(!sp.categoria)}>
                Todas
              </Link>
              {categories.map((c) => (
                <Link key={c.id} href={href(sp, { categoria: c.slug })} className={chip(sp.categoria === c.slug)}>
                  {c.name}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <h2 className="mb-3 text-sm font-semibold text-chalk">Plataforma</h2>
            <div className="flex flex-wrap gap-2">
              {platforms.map((pl) => (
                <Link
                  key={pl}
                  href={href(sp, { plataforma: sp.plataforma === pl ? undefined : pl })}
                  className={chip(sp.plataforma === pl)}
                >
                  {pl}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <h2 className="mb-3 text-sm font-semibold text-chalk">Condição</h2>
            <div className="flex gap-2">
              {[
                ["novo", "Novos"],
                ["seminovo", "Seminovos"],
              ].map(([v, l]) => (
                <Link key={v} href={href(sp, { condicao: sp.condicao === v ? undefined : v })} className={chip(sp.condicao === v)}>
                  {l}
                </Link>
              ))}
            </div>
          </div>
        </aside>

        <div>
          {active.length > 0 && (
            <div className="mb-5 flex flex-wrap items-center gap-2">
              {active.map((a) => (
                <Link
                  key={a.label}
                  href={href(sp, a.clear)}
                  className="flex items-center gap-1.5 border border-line px-3 py-1.5 text-sm text-fog hover:border-ember hover:text-chalk"
                >
                  {a.label} <X className="size-3.5" />
                </Link>
              ))}
              <Link href="/loja" className="ml-1 text-sm font-semibold text-ember hover:text-gold">
                Limpar filtros
              </Link>
            </div>
          )}
          {list.length === 0 ? (
            <div className="chamfer flex flex-col items-center gap-4 bg-deep px-6 py-20 text-center">
              <p className="display text-4xl">Nada por aqui</p>
              <p className="max-w-[46ch] text-fog">
                Não achamos itens com esses filtros. Tente outra plataforma, ou chama no WhatsApp que a gente procura para você.
              </p>
              <Link href="/loja" className="btn btn-ember">
                Ver toda a loja
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3">
              {list.map((p) => (
                <ProductCard key={p.id} p={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
