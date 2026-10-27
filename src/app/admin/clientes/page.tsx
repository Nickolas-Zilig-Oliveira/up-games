import type { Metadata } from "next";
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
  const db = await read();
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
      <PageHeader title="Clientes" text={`${db.users.filter((u) => u.role === "customer").length} clientes cadastrados, ordenados por quanto já compraram.`} />
      <AdminSearch placeholder="Buscar por nome, e-mail ou telefone" />
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
                <span className="font-semibold">{u.name}</span>
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
    </>
  );
}
