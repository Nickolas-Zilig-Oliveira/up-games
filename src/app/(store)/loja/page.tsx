import Link from "next/link";
import type { Metadata } from "next";
import { catalog, filterProducts, type SortKey } from "@/lib/queries";
import { ProductCard } from "@/components/product-card";
import { FilterBar } from "@/components/store/filter-bar";

export const metadata: Metadata = { title: "Loja" };

type Search = { categoria?: string; plataforma?: string; q?: string; ordem?: SortKey; condicao?: string };

export default async function Loja({ searchParams }: PageProps<"/loja">) {
  const sp = (await searchParams) as Search;
  const { products, categories, settings } = await catalog();
  const list = filterProducts(products, sp);
  const category = categories.find((c) => c.slug === sp.categoria);
  const title = sp.q ? `“${sp.q}”` : category?.name ?? sp.plataforma ?? "Toda a loja";

  return (
    <div>
      <div className="mx-auto max-w-[1320px] px-4 pb-8 pt-10 sm:px-6">
        <h1 className="display text-[clamp(3.4rem,10vw,8.5rem)]">{title}</h1>
        <p className="mt-3 text-fog">
          {list.length} {list.length === 1 ? "item" : "itens"}
          {list.length !== products.length && ` de ${products.length}`}
        </p>
      </div>

      <FilterBar
        total={products.length}
        categories={categories.map((c) => ({ value: c.slug, label: c.name, count: products.filter((p) => p.categoryId === c.id).length }))}
        platforms={settings.platforms
          .map((pl) => ({ value: pl, label: pl, count: products.filter((p) => p.platform === pl).length }))
          .filter((p) => p.count > 0)}
      />

      <div className="mx-auto max-w-[1320px] px-4 pb-10 pt-8 sm:px-6">
        {list.length === 0 ? (
          <div className="chamfer flex flex-col items-center gap-4 bg-deep px-6 py-20 text-center">
            <p className="display text-4xl">Nada por aqui</p>
            <p className="max-w-[46ch] text-fog">
              Não achamos itens com esses filtros. Limpe os filtros ou chame no WhatsApp que a gente procura para você.
            </p>
            <Link href="/loja" className="btn btn-ember">Ver toda a loja</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
            {list.map((p) => (
              <ProductCard key={p.id} p={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
