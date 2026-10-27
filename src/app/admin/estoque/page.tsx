import Link from "next/link";
import type { Metadata } from "next";
import { read } from "@/lib/db";
import { dateTimeBR, money } from "@/lib/format";
import { PageHeader, Panel, Table } from "@/components/admin/ui";
import { AdminSearch } from "@/components/admin/search";
import { StockControl } from "@/components/admin/stock-control";

export const metadata: Metadata = { title: "Estoque" };

const typeLabel = { entrada: "Entrada", saida: "Saída", ajuste: "Ajuste", venda: "Venda", cancelamento: "Devolução" };

export default async function Estoque({ searchParams }: PageProps<"/admin/estoque">) {
  const { q, nivel } = (await searchParams) as { q?: string; nivel?: string };
  const db = await read();
  let list = db.products.filter((p) => p.active);
  if (q) list = list.filter((p) => `${p.name} ${p.sku}`.toLowerCase().includes(q.toLowerCase()));
  if (nivel === "baixo") list = list.filter((p) => p.stock > 0 && p.stock <= p.minStock);
  if (nivel === "zerado") list = list.filter((p) => p.stock === 0);
  list = [...list].sort((a, b) => a.stock - a.minStock - (b.stock - b.minStock));
  const names = new Map(db.products.map((p) => [p.id, p.name]));
  const moves = [...db.movements].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 25);
  const units = db.products.filter((p) => p.active).reduce((s, p) => s + p.stock, 0);
  const value = db.products.filter((p) => p.active).reduce((s, p) => s + p.stock * p.price, 0);

  return (
    <>
      <PageHeader title="Estoque" text={`${units} unidades na loja, somando ${money(value)} em preço de venda. Os itens mais perto de acabar aparecem primeiro.`} />
      <AdminSearch
        placeholder="Buscar produto"
        filters={[{ name: "nivel", label: "Todos os níveis", options: [{ value: "baixo", label: "Estoque baixo" }, { value: "zerado", label: "Esgotados" }] }]}
      />
      <Table>
        <thead>
          <tr>
            <th>Produto</th>
            <th>Nível</th>
            <th className="!text-right">Atual</th>
            <th>Registrar movimentação</th>
          </tr>
        </thead>
        <tbody>
          {list.map((p) => {
            const pct = Math.min(1, p.stock / Math.max(p.minStock * 3, 1));
            const tone = p.stock === 0 ? "var(--color-bad)" : p.stock <= p.minStock ? "var(--color-gold)" : "var(--color-ok)";
            return (
              <tr key={p.id}>
                <td>
                  <Link href={`/admin/produtos/${p.id}`} className="font-semibold hover:text-ember">{p.name}</Link>
                  <span className="block text-xs text-dim">{p.sku} · alerta em {p.minStock}</span>
                </td>
                <td className="w-40">
                  <div className="flex gap-[2px]">
                    {Array.from({ length: 8 }).map((_, k) => (
                      <span key={k} className="h-2 flex-1 -skew-x-[20deg]" style={{ background: k < Math.ceil(pct * 8) ? tone : "var(--color-plate)" }} />
                    ))}
                  </div>
                </td>
                <td className="tabular text-right text-lg font-bold" style={{ color: tone }}>{p.stock}</td>
                <td><StockControl productId={p.id} /></td>
              </tr>
            );
          })}
        </tbody>
      </Table>

      <Panel title="Últimas movimentações" className="mt-6">
        <ul className="divide-y divide-line text-sm">
          {moves.map((m) => (
            <li key={m.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-2.5">
              <span className="w-20 font-semibold">{typeLabel[m.type]}</span>
              <span className={`tabular w-12 font-bold ${m.qty < 0 ? "text-bad" : "text-ok"}`}>{m.qty > 0 ? `+${m.qty}` : m.qty}</span>
              <span className="min-w-0 flex-1 truncate">{names.get(m.productId) ?? "Produto removido"}</span>
              <span className="hidden truncate text-fog md:block md:max-w-[220px]">{m.note}</span>
              <span className="text-dim">{m.by}</span>
              <span className="text-dim">{dateTimeBR(m.createdAt)}</span>
            </li>
          ))}
        </ul>
      </Panel>
    </>
  );
}
