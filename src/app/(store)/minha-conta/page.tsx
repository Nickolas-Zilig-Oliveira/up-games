import Link from "next/link";
import type { Metadata } from "next";
import { ArrowUpRight, Heart, MapPin, Package } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { read } from "@/lib/db";
import { dateBR, money } from "@/lib/format";
import { StatusBadge } from "@/components/status-badge";

export const metadata: Metadata = { title: "Minha conta" };

export default async function AccountHome() {
  const user = await requireUser();
  const db = await read();
  const orders = db.orders.filter((o) => o.userId === user.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const open = orders.filter((o) => !["entregue", "cancelado"].includes(o.status));

  const tiles = [
    { href: "/minha-conta/pedidos", icon: Package, value: orders.length, label: "pedidos feitos" },
    { href: "/minha-conta/favoritos", icon: Heart, value: user.favorites.length, label: "itens favoritos" },
    { href: "/minha-conta/dados", icon: MapPin, value: user.addresses.length, label: "endereços salvos" },
  ];

  return (
    <div className="space-y-10">
      <div className="grid gap-3 sm:grid-cols-3">
        {tiles.map((t) => (
          <Link key={t.href} href={t.href} className="chamfer-sm group flex items-center gap-4 bg-deep p-5 transition-colors hover:bg-plate">
            <t.icon className="size-6 text-ember" />
            <div>
              <p className="tabular display text-4xl">{t.value}</p>
              <p className="text-sm text-fog">{t.label}</p>
            </div>
            <ArrowUpRight className="ml-auto size-5 text-dim group-hover:text-chalk" />
          </Link>
        ))}
      </div>

      <section>
        <h2 className="mb-4 text-lg font-bold">Pedidos em andamento</h2>
        {open.length === 0 ? (
          <div className="chamfer-sm bg-deep p-6 text-fog">
            Nenhum pedido em andamento. <Link href="/loja" className="font-semibold text-ember hover:text-gold">Bora escolher o próximo jogo?</Link>
          </div>
        ) : (
          <ul className="space-y-2">
            {open.map((o) => (
              <li key={o.id}>
                <Link href={`/minha-conta/pedidos/${o.id}`} className="chamfer-sm flex flex-wrap items-center gap-4 bg-deep p-4 hover:bg-plate">
                  <span className="tabular font-bold">#{o.number}</span>
                  <span className="text-sm text-fog">{dateBR(o.createdAt)}</span>
                  <StatusBadge status={o.status} />
                  <span className="tabular ml-auto font-semibold">{money(o.total)}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
