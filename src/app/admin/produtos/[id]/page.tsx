import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { read } from "@/lib/db";
import { dateTimeBR } from "@/lib/format";
import { PageHeader, Panel } from "@/components/admin/ui";
import { ProductForm } from "@/components/admin/product-form";

const typeLabel = { entrada: "Entrada", saida: "Saída", ajuste: "Ajuste", venda: "Venda", cancelamento: "Devolução" };

export default async function EditProduct({ params }: PageProps<"/admin/produtos/[id]">) {
  const { id } = await params;
  const db = await read(["orders", "movements"]);
  const p = db.products.find((x) => x.id === id);
  if (!p) notFound();
  const moves = db.movements.filter((m) => m.productId === id).sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 12);
  const sold = db.orders
    .filter((o) => o.status !== "cancelado")
    .reduce((s, o) => s + o.items.filter((i) => i.productId === id).reduce((a, i) => a + i.qty, 0), 0);

  return (
    <>
      <PageHeader title={p.name} text={`${p.sku} · ${sold} unidades vendidas no total`}>
        <Link href={`/produto/${p.slug}`} target="_blank" className="btn btn-ghost btn-sm">
          <ExternalLink className="size-4" /> Ver na loja
        </Link>
      </PageHeader>
      <ProductForm categories={db.categories} platforms={db.settings.platforms} product={p} />
      <Panel title="Histórico de estoque" hint="Toda entrada, saída e venda deste produto." collapsible className="mt-6">
        {moves.length === 0 ? (
          <p className="text-sm text-fog">Nenhuma movimentação ainda.</p>
        ) : (
          <ul className="divide-y divide-line text-sm">
            {moves.map((m) => (
              <li key={m.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-2.5">
                <span className="w-24 font-semibold">{typeLabel[m.type]}</span>
                <span className={`tabular w-14 font-bold ${m.qty < 0 ? "text-bad" : "text-ok"}`}>{m.qty > 0 ? `+${m.qty}` : m.qty}</span>
                <span className="min-w-0 flex-1 truncate text-fog">{m.note}</span>
                <span className="tabular text-dim">saldo {m.balance}</span>
                <span className="text-dim">{dateTimeBR(m.createdAt)}</span>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </>
  );
}
