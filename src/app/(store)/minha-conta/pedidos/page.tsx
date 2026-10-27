import Link from "next/link";
import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { read } from "@/lib/db";
import { dateBR, money } from "@/lib/format";
import { StatusBadge } from "@/components/status-badge";

export const metadata: Metadata = { title: "Meus pedidos" };

export default async function Orders() {
  const user = await requireUser("/minha-conta/pedidos");
  const orders = (await read(["orders"])).orders
    .filter((o) => o.userId === user.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  if (!orders.length) {
    return (
      <div className="chamfer flex flex-col items-center gap-4 bg-deep px-6 py-16 text-center">
        <p className="display text-4xl">Nenhum pedido ainda</p>
        <p className="text-fog">Quando você comprar, cada pedido aparece aqui com o status atualizado.</p>
        <Link href="/loja" className="btn btn-ember">Ver a loja</Link>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {orders.map((o) => (
        <li key={o.id}>
          <Link href={`/minha-conta/pedidos/${o.id}`} className="chamfer-sm grid gap-3 bg-deep p-5 transition-colors hover:bg-plate sm:grid-cols-[auto_1fr_auto] sm:items-center sm:gap-6">
            <div>
              <p className="tabular text-lg font-bold">Pedido #{o.number}</p>
              <p className="text-sm text-fog">{dateBR(o.createdAt)}</p>
            </div>
            <p className="truncate text-sm text-fog">
              {o.items.map((i) => `${i.qty}× ${i.name}`).join(", ")}
            </p>
            <div className="flex items-center gap-4 sm:justify-end">
              <StatusBadge status={o.status} />
              <span className="tabular font-bold">{money(o.total)}</span>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
