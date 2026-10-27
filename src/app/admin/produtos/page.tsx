import Link from "next/link";
import type { Metadata } from "next";
import { Plus, Star } from "lucide-react";
import { read } from "@/lib/db";
import { money, rarityLabel } from "@/lib/format";
import { PageHeader, Table, Empty } from "@/components/admin/ui";
import { ProductArt } from "@/components/product-art";
import { AdminSearch } from "@/components/admin/search";

export const metadata: Metadata = { title: "Produtos" };

export default async function AdminProducts({ searchParams }: PageProps<"/admin/produtos">) {
  const { q, categoria, status } = (await searchParams) as { q?: string; categoria?: string; status?: string };
  const db = await read();
  const cats = new Map(db.categories.map((c) => [c.id, c]));
  let list = [...db.products].sort((a, b) => b.createdAt.localeCompare(a.createdAt) || a.name.localeCompare(b.name));
  if (q) list = list.filter((p) => `${p.name} ${p.sku} ${p.platform}`.toLowerCase().includes(q.toLowerCase()));
  if (categoria) list = list.filter((p) => p.categoryId === categoria);
  if (status === "ativos") list = list.filter((p) => p.active);
  if (status === "ocultos") list = list.filter((p) => !p.active);

  return (
    <>
      <PageHeader title="Produtos" text={`${db.products.length} produtos cadastrados. Clique em um para editar preço, fotos, estoque e destaque.`}>
        <Link href="/admin/produtos/novo" className="btn btn-ember">
          <Plus className="size-4" /> Novo produto
        </Link>
      </PageHeader>

      <AdminSearch
        placeholder="Buscar por nome, código ou plataforma"
        filters={[
          { name: "categoria", label: "Todas as categorias", options: db.categories.map((c) => ({ value: c.id, label: c.name })) },
          { name: "status", label: "Ativos e ocultos", options: [{ value: "ativos", label: "Só ativos" }, { value: "ocultos", label: "Só ocultos" }] },
        ]}
      />

      {list.length === 0 ? (
        <Empty title="Nenhum produto" text="Nenhum produto bate com essa busca. Ajuste os filtros ou cadastre um novo." />
      ) : (
        <Table>
          <thead>
            <tr>
              <th>Produto</th>
              <th>Categoria</th>
              <th>Raridade</th>
              <th className="!text-right">Preço</th>
              <th className="!text-right">Estoque</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {list.map((p) => {
              const cat = cats.get(p.categoryId);
              return (
                <tr key={p.id}>
                  <td>
                    <Link href={`/admin/produtos/${p.id}`} className="flex items-center gap-3 hover:text-ember">
                      <span className="chamfer-sm size-11 shrink-0 overflow-hidden">
                        <ProductArt image={p.images[0]} name={p.name} platform={p.platform} rarity={p.rarity} icon={cat?.icon ?? "package"} size="sm" />
                      </span>
                      <span className="min-w-0">
                        <span className="flex items-center gap-1.5 font-semibold">
                          {p.name}
                          {p.featured && <Star className="size-3.5 fill-gold text-gold" aria-label="Em destaque" />}
                        </span>
                        <span className="block text-xs text-dim">{p.sku} · {p.platform}</span>
                      </span>
                    </Link>
                  </td>
                  <td className="text-fog">{cat?.name ?? "—"}</td>
                  <td data-rarity={p.rarity}><span className="rarity-text font-semibold">{rarityLabel[p.rarity]}</span></td>
                  <td className="tabular text-right font-semibold">{money(p.price)}</td>
                  <td className={`tabular text-right font-semibold ${p.stock === 0 ? "text-bad" : p.stock <= p.minStock ? "text-gold" : ""}`}>{p.stock}</td>
                  <td>
                    <span className={`text-xs font-semibold ${p.active ? "text-ok" : "text-dim"}`}>{p.active ? "Visível" : "Oculto"}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      )}
    </>
  );
}
