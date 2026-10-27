import Link from "next/link";
import type { Metadata } from "next";
import { Plus, Star } from "lucide-react";
import { read } from "@/lib/db";
import { money } from "@/lib/format";
import { PageHeader, Table, Empty } from "@/components/admin/ui";
import { ProductArt } from "@/components/product-art";
import { AdminSearch } from "@/components/admin/search";
import { StockStepper } from "@/components/admin/stock-stepper";

export const metadata: Metadata = { title: "Produtos e estoque" };

export default async function AdminProducts({ searchParams }: PageProps<"/admin/produtos">) {
  const { q, categoria, estoque } = (await searchParams) as { q?: string; categoria?: string; estoque?: string };
  const db = await read();
  const cats = new Map(db.categories.map((c) => [c.id, c]));
  let list = [...db.products].sort((a, b) => a.name.localeCompare(b.name));
  if (q) list = list.filter((p) => `${p.name} ${p.sku} ${p.platform}`.toLowerCase().includes(q.toLowerCase()));
  if (categoria) list = list.filter((p) => p.categoryId === categoria);
  if (estoque === "baixo") list = list.filter((p) => p.stock <= p.minStock).sort((a, b) => a.stock - b.stock);
  if (estoque === "zerado") list = list.filter((p) => p.stock === 0);

  return (
    <>
      <PageHeader title="Produtos e estoque" text="Tudo o que a loja vende. Ajuste o estoque aqui mesmo com − e +; clique em Editar para mudar preço, fotos e descrição.">
        <Link href="/admin/produtos/novo" className="btn btn-ember">
          <Plus className="size-4" /> Novo produto
        </Link>
      </PageHeader>

      <AdminSearch
        placeholder="Buscar produto"
        filters={[
          { name: "categoria", label: "Todas as categorias", options: db.categories.map((c) => ({ value: c.id, label: c.name })) },
          { name: "estoque", label: "Todo o estoque", options: [{ value: "baixo", label: "Acabando" }, { value: "zerado", label: "Esgotados" }] },
        ]}
      />

      {list.length === 0 ? (
        <Empty title="Nenhum produto" text="Nenhum produto bate com essa busca. Ajuste os filtros ou cadastre um novo." />
      ) : (
        <>
        <ul className="space-y-2 md:hidden">
          {list.map((p) => {
            const cat = cats.get(p.categoryId);
            return (
              <li key={p.id} className={`chamfer-sm bg-deep p-3 ${p.active ? "" : "opacity-50"}`}>
                <div className="flex items-center gap-3">
                  <span className="chamfer-sm size-14 shrink-0 overflow-hidden">
                    <ProductArt image={p.images[0]} name={p.name} platform={p.platform} rarity={p.rarity} icon={cat?.icon ?? 'package'} size="sm" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="line-clamp-2 font-semibold leading-snug">{p.name}</span>
                    <span className="block text-xs text-dim">{p.platform}{!p.active && ' · oculto na loja'}</span>
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <span className="tabular text-lg font-bold">{money(p.price)}</span>
                  <StockStepper productId={p.id} stock={p.stock} min={p.minStock} />
                  <Link href={`/admin/produtos/${p.id}`} className="btn btn-ghost btn-sm">Editar</Link>
                </div>
              </li>
            );
          })}
        </ul>
        <div className="hidden md:block">
<Table>
          <thead>
            <tr>
              <th>Produto</th>
              <th>Categoria</th>
              <th className="!text-right">Preço</th>
              <th className="!text-center">Estoque</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {list.map((p) => {
              const cat = cats.get(p.categoryId);
              return (
                <tr key={p.id} className={p.active ? "" : "opacity-50"}>
                  <td>
                    <div className="flex items-center gap-3">
                      <span className="chamfer-sm size-11 shrink-0 overflow-hidden">
                        <ProductArt image={p.images[0]} name={p.name} platform={p.platform} rarity={p.rarity} icon={cat?.icon ?? "package"} size="sm" />
                      </span>
                      <span className="min-w-0">
                        <span className="flex items-center gap-1.5 font-semibold">
                          {p.name}
                          {p.featured && <Star className="size-3.5 fill-gold text-gold" aria-label="Em destaque" />}
                        </span>
                        <span className="block text-xs text-dim">
                          {p.platform}
                          {!p.active && " · oculto na loja"}
                        </span>
                      </span>
                    </div>
                  </td>
                  <td className="text-fog">{cat?.name ?? "—"}</td>
                  <td className="tabular text-right font-semibold">{money(p.price)}</td>
                  <td className="text-center">
                    <StockStepper productId={p.id} stock={p.stock} min={p.minStock} />
                  </td>
                  <td className="text-right">
                    <Link href={`/admin/produtos/${p.id}`} className="btn btn-ghost btn-sm">Editar</Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
        </div>
      </>
      )}
    </>
  );
}
