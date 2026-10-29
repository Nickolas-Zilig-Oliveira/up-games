import Link from "next/link";
import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import { catalog, filterProducts, type SortKey } from "@/lib/queries";
import { ProductCard } from "@/components/product-card";
import { FilterBar } from "@/components/store/filter-bar";
import { DragRow } from "@/components/store/drag-row";
import { CategoryIcon } from "@/components/icons";

export const metadata: Metadata = { title: "Loja" };

type Search = { categoria?: string; plataforma?: string; q?: string; ordem?: SortKey; condicao?: string };

export default async function Loja({ searchParams }: PageProps<"/loja">) {
  const sp = (await searchParams) as Search;
  const { products, categories, settings } = await catalog();
  const list = filterProducts(products, sp);
  const category = categories.find((c) => c.slug === sp.categoria);
  const filtered = !!(sp.categoria || sp.plataforma || sp.q || sp.condicao);
  const title = sp.q ? `“${sp.q}”` : category?.name ?? sp.plataforma ?? "Toda a loja";

  // Sem filtro: uma fileira por categoria. Com filtro: uma fileira só com o resultado.
  const rows = filtered
    ? [{ id: "resultado", name: null as string | null, slug: "", icon: "", items: list }]
    : categories
        .map((c) => ({ id: c.id, name: c.name as string | null, slug: c.slug, icon: c.icon, items: list.filter((p) => p.categoryId === c.id) }))
        .filter((r) => r.items.length > 0);

  return (
    <div>
      <div className="mx-auto flex max-w-[1320px] flex-wrap items-end justify-between gap-x-6 gap-y-1 px-4 pb-5 pt-7 sm:px-6 lg:pt-9">
        <h1 className="display t-section">{title}</h1>
        <p className="pb-1 text-sm text-fog">
          <span className="font-semibold text-chalk">{list.length}</span> {list.length === 1 ? "item" : "itens"}
          {list.length !== products.length && ` de ${products.length}`}
        </p>
      </div>

      <FilterBar
        total={products.length}
        categories={categories
          .map((c) => ({ value: c.slug, label: c.name, count: products.filter((p) => p.categoryId === c.id).length }))
          .filter((c) => c.count > 0 || c.value === sp.categoria)}
        platforms={settings.platforms
          .map((pl) => ({ value: pl, label: pl, count: products.filter((p) => p.platform === pl).length }))
          .filter((p) => p.count > 0)}
      />

      <div className="mx-auto max-w-[1320px] space-y-12 px-4 pb-10 pt-8 sm:px-6">
        {list.length === 0 ? (
          <div className="chamfer flex flex-col items-center gap-4 bg-deep px-6 py-20 text-center">
            <p className="display t-section">Nada por aqui</p>
            <p className="max-w-[46ch] text-fog">
              Não achamos itens com esses filtros. Limpe os filtros ou chame no WhatsApp que a gente procura para você.
            </p>
            <Link href="/loja" className="btn btn-ember">Ver toda a loja</Link>
          </div>
        ) : (
          rows.map((r) => (
            <section key={r.id} aria-label={r.name ?? "Resultado"}>
              {r.name && (
                <div className="mb-4 flex items-center justify-between gap-4">
                  <h2 className="display t-tool flex items-center gap-3">
                    <span className="chamfer-sm grid size-10 shrink-0 place-items-center bg-ember/15">
                      <CategoryIcon name={r.icon} className="size-5 text-ember" />
                    </span>
                    {r.name}
                    <span className="tabular rounded-full bg-plate/70 px-2.5 py-0.5 font-sans text-xs font-bold text-fog">{r.items.length}</span>
                  </h2>
                  <Link href={`/loja?categoria=${r.slug}`} className="flex shrink-0 items-center gap-1 text-sm font-semibold text-ember hover:text-gold">
                    Ver tudo <ArrowUpRight className="size-4" />
                  </Link>
                </div>
              )}
              <DragRow label={r.name ?? "Resultado da busca"}>
                {r.items.map((p) => (
                  <ProductCard key={p.id} p={p} />
                ))}
              </DragRow>
            </section>
          ))
        )}
      </div>
    </div>
  );
}
