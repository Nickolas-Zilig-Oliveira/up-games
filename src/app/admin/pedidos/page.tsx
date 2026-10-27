import Link from "next/link";
import type { Metadata } from "next";
import { read } from "@/lib/db";
import { dateTimeBR, money, statusLabel } from "@/lib/format";
import { PageHeader, Table, Empty } from "@/components/admin/ui";
import { AdminSearch } from "@/components/admin/search";
import { StatusBadge } from "@/components/status-badge";
import type { OrderStatus } from "@/lib/types";

export const metadata: Metadata = { title: "Pedidos" };

export default async function AdminOrders({ searchParams }: PageProps<"/admin/pedidos">) {
  const { q, status } = (await searchParams) as { q?: string; status?: OrderStatus };
  const db = await read();
  let list = [...db.orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  if (status) list = list.filter((o) => o.status === status);
  if (q) {
    const s = q.toLowerCase().replace("#", "");
    list = list.filter((o) => `${o.number} ${o.customer.name} ${o.customer.email}`.toLowerCase().includes(s));
  }
  const counts = Object.fromEntries(Object.keys(statusLabel).map((s) => [s, db.orders.filter((o) => o.status === s).length]));

  return (
    <>
      <PageHeader title="Pedidos" text="Acompanhe e atualize cada pedido. O cliente vê a mudança na hora, na área Minha conta." />
      <div className="scrollbar-none mb-4 flex gap-2 overflow-x-auto">
        <Link href="/admin/pedidos" className={`chamfer-sm whitespace-nowrap px-3 py-2 text-sm font-semibold ${!status ? "bg-ember text-void" : "bg-deep text-fog hover:text-chalk"}`}>
          Todos <span className="tabular ml-1 opacity-70">{db.orders.length}</span>
        </Link>
        {(Object.keys(statusLabel) as OrderStatus[]).map((s) => (
          <Link key={s} href={`/admin/pedidos?status=${s}`} className={`chamfer-sm whitespace-nowrap px-3 py-2 text-sm font-semibold ${status === s ? "bg-ember text-void" : "bg-deep text-fog hover:text-chalk"}`}>
            {statusLabel[s]} <span className="tabular ml-1 opacity-70">{counts[s]}</span>
          </Link>
        ))}
      </div>
      <AdminSearch placeholder="Buscar por número, nome ou e-mail do cliente" />
      {list.length === 0 ? (
        <Empty title="Nenhum pedido" text="Nenhum pedido com esse filtro." />
      ) : (
        <>
        <ul className="space-y-2 md:hidden">
          {list.map((o) => (
            <li key={o.id}>
              <Link href={`/admin/pedidos/${o.id}`} className="chamfer-sm block bg-deep p-4 active:bg-plate">
                <div className="flex items-center justify-between gap-3">
                  <span className="tabular text-lg font-bold">#{o.number}</span>
                  <StatusBadge status={o.status} />
                </div>
                <p className="mt-1 font-medium">{o.customer.name}</p>
                <p className="truncate text-sm text-fog">{o.items.map((i) => `${i.qty}× ${i.name}`).join(", ")}</p>
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span className="text-dim">{dateTimeBR(o.createdAt)} · {o.delivery === 'retirada' ? 'Retirada' : 'Entrega'}</span>
                  <span className="tabular font-bold">{money(o.total)}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
        <div className="hidden md:block">
<Table>
          <thead>
            <tr>
              <th>Pedido</th>
              <th>Cliente</th>
              <th>Itens</th>
              <th>Entrega</th>
              <th>Status</th>
              <th className="!text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {list.map((o) => (
              <tr key={o.id}>
                <td>
                  <Link href={`/admin/pedidos/${o.id}`} className="tabular font-bold hover:text-ember">#{o.number}</Link>
                  <span className="block text-xs text-dim">{dateTimeBR(o.createdAt)}</span>
                </td>
                <td>
                  <span className="font-medium">{o.customer.name}</span>
                  <span className="block text-xs text-dim">{o.customer.email}</span>
                </td>
                <td className="max-w-[220px] truncate text-fog">{o.items.map((i) => `${i.qty}× ${i.name}`).join(", ")}</td>
                <td className="text-fog">{o.delivery === "retirada" ? "Retirada" : "Entrega"} · {o.payment === "pix" ? "Pix" : "Na hora"}</td>
                <td><StatusBadge status={o.status} /></td>
                <td className="tabular text-right font-semibold">{money(o.total)}</td>
              </tr>
            ))}
          </tbody>
        </Table>
        </div>
      </>
      )}
    </>
  );
}
