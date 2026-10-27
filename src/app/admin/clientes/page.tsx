import Link from "next/link";
import type { Metadata } from "next";
import { Download } from "lucide-react";
import { read } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { dateBR, money } from "@/lib/format";
import { PageHeader, Table } from "@/components/admin/ui";
import { AdminSearch } from "@/components/admin/search";
import { RoleToggle } from "@/components/admin/role-toggle";

export const metadata: Metadata = { title: "Clientes" };

export default async function Clientes({ searchParams }: PageProps<"/admin/clientes">) {
  const { q } = (await searchParams) as { q?: string };
  const me = await requireAdmin();
  const db = await read(["orders", "users"]);
  let users = db.users.map((u) => {
    const orders = db.orders.filter((o) => o.userId === u.id && o.status !== "cancelado");
    return {
      ...u,
      orders: orders.length,
      spent: orders.reduce((s, o) => s + o.total, 0),
      last: orders.map((o) => o.createdAt).sort().pop(),
    };
  });
  if (q) users = users.filter((u) => `${u.name} ${u.email} ${u.phone ?? ""}`.toLowerCase().includes(q.toLowerCase()));
  users.sort((a, b) => b.spent - a.spent);

  return (
    <>
      <PageHeader title="Clientes" text={`${db.users.filter((u) => u.role === "customer").length} clientes cadastrados, ordenados por quanto já compraram.`}>
        <a href="/api/admin/export/clientes" className="btn btn-ghost btn-sm"><Download className="size-4" /> Exportar planilha</a>
      </PageHeader>
      <AdminSearch placeholder="Buscar por nome, e-mail ou telefone" />
      <>
        <ul className="space-y-2 md:hidden">
          {users.map((u) => (
            <li key={u.id} className="chamfer-sm bg-deep p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <Link href={`/admin/clientes/${u.id}`} className="block truncate font-semibold hover:text-ember">{u.name}</Link>
                  <p className="truncate text-sm text-dim">{u.email}</p>
                  {u.phone && <p className="text-sm text-fog">{u.phone}</p>}
                </div>
                <div className="shrink-0 text-right">
                  <p className="tabular font-bold">{money(u.spent)}</p>
                  <p className="text-xs text-dim">{u.orders} {u.orders === 1 ? 'pedido' : 'pedidos'}</p>
                </div>
              </div>
              <div className="mt-3">{u.id === me.id ? <span className="text-xs font-semibold text-gold">Você (admin)</span> : <RoleToggle id={u.id} role={u.role} />}</div>
            </li>
          ))}
        </ul>
        <div className="hidden md:block">
<Table>
        <thead>
          <tr>
            <th>Cliente</th>
            <th>Telefone</th>
            <th className="!text-right">Pedidos</th>
            <th className="!text-right">Total gasto</th>
            <th>Última compra</th>
            <th>Acesso</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td>
                <Link href={`/admin/clientes/${u.id}`} className="font-semibold hover:text-ember">{u.name}</Link>
                <span className="block text-xs text-dim">{u.email} · desde {dateBR(u.createdAt)}</span>
              </td>
              <td className="text-fog">{u.phone || "—"}</td>
              <td className="tabular text-right">{u.orders}</td>
              <td className="tabular text-right font-semibold">{money(u.spent)}</td>
              <td className="text-fog">{u.last ? dateBR(u.last) : "—"}</td>
              <td>{u.id === me.id ? <span className="text-xs font-semibold text-gold">Você (admin)</span> : <RoleToggle id={u.id} role={u.role} />}</td>
            </tr>
          ))}
        </tbody>
      </Table>
        </div>
      </>
    </>
  );
}
