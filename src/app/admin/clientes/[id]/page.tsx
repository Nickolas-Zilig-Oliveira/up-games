import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { read } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { dateBR, dateTimeBR, money } from "@/lib/format";
import { PageHeader, Panel } from "@/components/admin/ui";
import { StatusBadge } from "@/components/status-badge";
import { RoleToggle } from "@/components/admin/role-toggle";
import { WhatsIcon } from "@/components/icons";

export default async function Cliente({ params }: PageProps<"/admin/clientes/[id]">) {
  const { id } = await params;
  const me = await requireAdmin();
  const db = await read(["orders", "users"]);
  const u = db.users.find((x) => x.id === id);
  if (!u) notFound();
  const orders = db.orders.filter((o) => o.userId === u.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const valid = orders.filter((o) => o.status !== "cancelado");
  const spent = valid.reduce((s, o) => s + o.total, 0);
  const phone = u.phone?.replace(/\D/g, "");
  const wa = phone ? `https://wa.me/${phone.length <= 11 ? `55${phone}` : phone}?text=${encodeURIComponent(`Olá, ${u.name.split(" ")[0]}! Aqui é da Up Games.`)}` : null;

  return (
    <>
      <Link href="/admin/clientes" className="mb-4 inline-flex items-center gap-2 text-sm text-fog hover:text-chalk">
        <ArrowLeft className="size-4" /> Clientes
      </Link>
      <PageHeader title={u.name} text={`${u.email} · cliente desde ${dateBR(u.createdAt)}`}>
        {wa && (
          <a href={wa} target="_blank" rel="noreferrer" className="btn btn-sm bg-[#25d366] text-[#06260f]">
            <WhatsIcon className="size-4" /> Chamar no WhatsApp
          </a>
        )}
      </PageHeader>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {[
          ["Total gasto", money(spent)],
          ["Pedidos", String(valid.length)],
          ["Ticket médio", money(valid.length ? spent / valid.length : 0)],
        ].map(([l, v]) => (
          <div key={l} className="chamfer-sm bg-deep p-4 sm:p-5">
            <p className="text-sm text-fog">{l}</p>
            <p className="tabular mt-1 text-xl font-bold sm:text-3xl">{v}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_340px]">
        <Panel title="Pedidos">
          {orders.length === 0 ? (
            <p className="text-sm text-fog">Esse cliente ainda não comprou.</p>
          ) : (
            <ul className="divide-y divide-line">
              {orders.map((o) => (
                <li key={o.id}>
                  <Link href={`/admin/pedidos/${o.id}`} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-3 text-sm hover:text-ember">
                    <span className="tabular font-bold">#{o.number}</span>
                    <span className="text-dim">{dateTimeBR(o.createdAt)}</span>
                    <StatusBadge status={o.status} />
                    <span className="tabular ml-auto font-semibold">{money(o.total)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>
        <div className="space-y-4">
          <Panel title="Contato">
            <p className="text-sm">{u.email}</p>
            <p className="text-sm text-fog">{u.phone || "Sem telefone cadastrado"}</p>
          </Panel>
          <Panel title="Endereços">
            {u.addresses.length === 0 ? (
              <p className="text-sm text-fog">Nenhum endereço salvo.</p>
            ) : (
              <ul className="space-y-3 text-sm">
                {u.addresses.map((a) => (
                  <li key={a.id}>
                    <p className="font-semibold">{a.label}</p>
                    <p className="text-fog">{a.street}, {a.number} {a.complement} — {a.district}, {a.city}/{a.state} · {a.zip}</p>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
          <Panel title="Acesso ao painel" hint="Admins podem ver e mudar tudo no painel.">
            {u.id === me.id ? <span className="text-sm font-semibold text-gold">Esta é a sua conta</span> : <RoleToggle id={u.id} role={u.role} />}
          </Panel>
        </div>
      </div>
    </>
  );
}
