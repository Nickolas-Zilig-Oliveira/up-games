import Link from "next/link";
import { ArrowDownRight, ArrowUpRight, Boxes, Plus, ReceiptText } from "lucide-react";
import { read } from "@/lib/db";
import { dashboard } from "@/lib/analytics";
import { dateTimeBR, money } from "@/lib/format";
import { PageHeader, Panel } from "@/components/admin/ui";
import { BarList, RevenueChart } from "@/components/admin/charts";
import { StatusBadge } from "@/components/status-badge";

const ranges = [
  { days: 7, label: "7 dias" },
  { days: 30, label: "30 dias" },
  { days: 90, label: "90 dias" },
];

function Delta({ v }: { v: number }) {
  if (!isFinite(v) || v === 0) return null;
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
  const db = await read(["orders"]);
  const d = dashboard(db, days);
  const hasDemo = db.orders.some((o) => o.demo);
  const waiting = db.orders.filter((o) => o.status === "pendente" || o.status === "pago").length;

  const actions = [
    {
      href: "/admin/pedidos?status=pendente",
      icon: ReceiptText,
      title: waiting ? `${waiting} ${waiting === 1 ? "pedido" : "pedidos"} para atender` : "Nenhum pedido esperando",
      text: waiting ? "Confirme o pagamento e separe os itens." : "Tudo em dia por aqui.",
      hot: waiting > 0,
    },
    {
      href: "/admin/produtos?estoque=baixo",
      icon: Boxes,
      title: d.lowStock.length ? `${d.lowStock.length} ${d.lowStock.length === 1 ? "produto" : "produtos"} acabando` : "Estoque em dia",
      text: d.lowStock.length ? "Veja quais repor." : "Nada com estoque baixo.",
      hot: d.lowStock.length > 0,
    },
    { href: "/admin/produtos/novo", icon: Plus, title: "Cadastrar produto", text: "Nome, preço, fotos e estoque.", hot: false },
  ];

  return (
    <>
      <PageHeader title="Início" text="O que precisa da sua atenção e como a loja está vendendo.">
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

      <div className="grid gap-3 md:grid-cols-3">
        {actions.map((a) => (
          <Link
            key={a.href}
            href={a.href}
            className={`chamfer-sm group flex items-center gap-4 p-5 transition-colors ${a.hot ? "bg-ember/15 ring-1 ring-inset ring-ember/50 hover:bg-ember/25" : "bg-deep hover:bg-plate"}`}
          >
            <a.icon className={`size-6 shrink-0 ${a.hot ? "text-ember" : "text-dim"}`} />
            <span>
              <span className="block font-semibold">{a.title}</span>
              <span className="block text-sm text-fog">{a.text}</span>
            </span>
            <ArrowUpRight className="ml-auto size-5 shrink-0 text-dim transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-chalk" />
          </Link>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {[
          { label: "Vendas", value: money(d.revenue), delta: <Delta v={d.revenueDelta} /> },
          { label: "Pedidos", value: String(d.orders), delta: <Delta v={d.ordersDelta} /> },
          { label: "Ticket médio", value: money(d.ticket), delta: <span className="text-xs text-dim">valor médio por pedido</span> },
        ].map((k, i) => (
          <div key={k.label} className={`chamfer-sm bg-deep p-4 sm:p-5 ${i === 0 ? "col-span-2 sm:col-span-1" : ""}`}>
            <p className="text-sm text-fog">{k.label}</p>
            <p className="tabular mt-1.5 text-xl font-bold sm:text-3xl">{k.value}</p>
            <div className="mt-1 min-h-4">{k.delta}</div>
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_340px]">
        <Panel title={`Vendas por dia — últimos ${days} dias`}>
          <RevenueChart data={d.series} />
        </Panel>
        <Panel title="Mais vendidos">
          {d.top.length ? (
            <BarList items={d.top.map((t) => ({ label: t.name, value: t.revenue, sub: `${t.qty} un.` }))} />
          ) : (
            <p className="text-sm text-fog">Ainda não há vendas neste período.</p>
          )}
        </Panel>
      </div>

      <Panel title="Últimos pedidos" className="mt-4" action={<Link href="/admin/pedidos" className="text-xs font-semibold text-ember">Ver todos</Link>}>
        <ul className="divide-y divide-line">
          {d.recent.map((o) => (
            <li key={o.id}>
              <Link href={`/admin/pedidos/${o.id}`} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-3 text-sm hover:text-ember">
                <span className="tabular font-bold">#{o.number}</span>
                <span className="min-w-0 flex-1 truncate">{o.customer.name}</span>
                <span className="hidden text-dim sm:inline">{dateTimeBR(o.createdAt)}</span>
                <StatusBadge status={o.status} />
                <span className="tabular w-24 text-right font-semibold">{money(o.total)}</span>
              </Link>
            </li>
          ))}
        </ul>
      </Panel>

      {hasDemo && (
        <p className="mt-6 text-sm text-dim">
          Os pedidos e clientes de exemplo ajudam a ver o painel funcionando.{" "}
          <Link href="/admin/loja#demo" className="font-semibold text-gold underline-offset-4 hover:underline">Apagar exemplos</Link>
        </p>
      )}
    </>
  );
}
