import Link from "next/link";
import { AlertTriangle, ArrowDownRight, ArrowUpRight } from "lucide-react";
import { read } from "@/lib/db";
import { dashboard } from "@/lib/analytics";
import { dateTimeBR, money, statusLabel } from "@/lib/format";
import { PageHeader, Panel } from "@/components/admin/ui";
import { BarList, RevenueChart } from "@/components/admin/charts";
import { StatusBadge } from "@/components/status-badge";
import type { OrderStatus } from "@/lib/types";

const ranges = [
  { days: 7, label: "7 dias" },
  { days: 30, label: "30 dias" },
  { days: 90, label: "90 dias" },
];

const statusColor: Record<OrderStatus, string> = {
  pendente: "#ffc93c",
  pago: "#3fa9ff",
  separando: "#b264ff",
  enviado: "#ff8f3f",
  entregue: "#3ddc97",
  cancelado: "#ff4d6d",
};

function Delta({ v }: { v: number }) {
  if (!isFinite(v) || v === 0) return <span className="text-xs text-dim">sem variação</span>;
  const up = v > 0;
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-semibold ${up ? "text-ok" : "text-bad"}`}>
      {up ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5" />}
      {Math.abs(v * 100).toFixed(0)}% vs. período anterior
    </span>
  );
}

export default async function AdminHome({ searchParams }: PageProps<"/admin">) {
  const { dias } = (await searchParams) as { dias?: string };
  const days = [7, 30, 90].includes(Number(dias)) ? Number(dias) : 30;
  const db = await read();
  const d = dashboard(db, days);
  const hasDemo = db.orders.some((o) => o.demo);

  const kpis = [
    { label: "Faturamento", value: money(d.revenue), delta: <Delta v={d.revenueDelta} /> },
    { label: "Pedidos", value: String(d.orders), delta: <Delta v={d.ordersDelta} /> },
    { label: "Ticket médio", value: money(d.ticket), delta: <span className="text-xs text-dim">por pedido</span> },
    { label: "Lucro estimado", value: money(d.profit), delta: <span className="text-xs text-dim">preço − custo cadastrado</span> },
  ];

  return (
    <>
      <PageHeader title="Visão geral" text="Como a loja está indo, o que precisa de atenção e o que está vendendo.">
        <div className="chamfer-sm flex bg-deep p-1" role="group" aria-label="Período">
          {ranges.map((r) => (
            <Link
              key={r.days}
              href={`/admin?dias=${r.days}`}
              className={`px-3 py-1.5 text-sm font-semibold ${days === r.days ? "bg-plate-2 text-chalk" : "text-fog hover:text-chalk"}`}
            >
              {r.label}
            </Link>
          ))}
        </div>
      </PageHeader>

      {hasDemo && (
        <p className="mb-6 border-l-2 border-gold bg-gold/10 px-4 py-3 text-sm text-chalk">
          Os pedidos e clientes atuais são de demonstração, para você ver o painel funcionando.{" "}
          <Link href="/admin/loja#demo" className="font-semibold text-gold underline-offset-4 hover:underline">Apagar dados de demonstração</Link>
        </p>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className="chamfer-sm bg-deep p-5">
            <p className="text-sm text-fog">{k.label}</p>
            <p className="tabular mt-2 text-2xl font-bold sm:text-3xl">{k.value}</p>
            <div className="mt-1.5">{k.delta}</div>
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_340px]">
        <Panel title={`Faturamento por dia — últimos ${days} dias`}>
          <RevenueChart data={d.series} />
        </Panel>
        <Panel title="Pedidos por status">
          <BarList
            format="int"
            items={d.byStatus.map((s) => ({ label: statusLabel[s.status], value: s.count, color: statusColor[s.status] }))}
          />
        </Panel>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Panel title="Mais vendidos" action={<Link href="/admin/produtos" className="text-xs font-semibold text-ember">Produtos</Link>}>
          {d.top.length ? (
            <BarList items={d.top.map((t) => ({ label: t.name, value: t.revenue, sub: `${t.qty} un.` }))} />
          ) : (
            <p className="text-sm text-fog">Sem vendas no período.</p>
          )}
        </Panel>
        <Panel title="Vendas por categoria">
          <BarList items={d.byCat.map((c) => ({ label: c.name, value: c.revenue }))} />
        </Panel>
        <Panel
          title="Estoque baixo"
          action={<Link href="/admin/estoque" className="text-xs font-semibold text-ember">Repor</Link>}
        >
          {d.lowStock.length === 0 ? (
            <p className="text-sm text-fog">Tudo abastecido.</p>
          ) : (
            <ul className="space-y-2">
              {d.lowStock.slice(0, 7).map((p) => (
                <li key={p.id} className="flex items-center gap-3 text-sm">
                  <AlertTriangle className={`size-4 shrink-0 ${p.stock === 0 ? "text-bad" : "text-gold"}`} />
                  <Link href={`/admin/produtos/${p.id}`} className="truncate hover:text-ember">{p.name}</Link>
                  <span className={`tabular ml-auto shrink-0 font-semibold ${p.stock === 0 ? "text-bad" : "text-gold"}`}>
                    {p.stock === 0 ? "esgotado" : `${p.stock} un.`}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-4 border-t border-line pt-3 text-xs text-dim">Valor em estoque (custo): <b className="tabular text-chalk">{money(d.stockValue)}</b></p>
        </Panel>
      </div>

      <Panel title="Últimos pedidos" className="mt-4" action={<Link href="/admin/pedidos" className="text-xs font-semibold text-ember">Ver todos</Link>}>
        <ul className="divide-y divide-line">
          {d.recent.map((o) => (
            <li key={o.id}>
              <Link href={`/admin/pedidos/${o.id}`} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-3 text-sm hover:text-ember">
                <span className="tabular font-bold">#{o.number}</span>
                <span className="min-w-0 flex-1 truncate">{o.customer.name}</span>
                <span className="text-dim">{dateTimeBR(o.createdAt)}</span>
                <StatusBadge status={o.status} />
                <span className="tabular w-24 text-right font-semibold">{money(o.total)}</span>
              </Link>
            </li>
          ))}
        </ul>
      </Panel>
    </>
  );
}
