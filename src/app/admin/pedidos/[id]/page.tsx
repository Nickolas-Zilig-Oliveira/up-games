import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { read } from "@/lib/db";
import { dateTimeBR, money, statusLabel } from "@/lib/format";
import { PageHeader, Panel } from "@/components/admin/ui";
import { StatusBadge } from "@/components/status-badge";
import { OrderStatusControl } from "@/components/admin/order-status";
import { WhatsIcon } from "@/components/icons";

export default async function AdminOrder({ params }: PageProps<"/admin/pedidos/[id]">) {
  const { id } = await params;
  const db = await read(["orders"]);
  const o = db.orders.find((x) => x.id === id);
  if (!o) notFound();
  const phone = o.customer.phone?.replace(/\D/g, "");
  const wa = phone ? `https://wa.me/${phone.length <= 11 ? `55${phone}` : phone}?text=${encodeURIComponent(`Olá, ${o.customer.name.split(" ")[0]}! Aqui é da Up Games, sobre o seu pedido #${o.number}.`)}` : null;

  return (
    <>
      <Link href="/admin/pedidos" className="mb-4 inline-flex items-center gap-2 text-sm text-fog hover:text-chalk">
        <ArrowLeft className="size-4" /> Pedidos
      </Link>
      <PageHeader title={`Pedido #${o.number}`} text={`Feito em ${dateTimeBR(o.createdAt)}`}>
        <StatusBadge status={o.status} />
      </PageHeader>

      <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <Panel title="Itens">
            <ul className="divide-y divide-line">
              {o.items.map((i) => (
                <li key={i.productId} className="flex items-center justify-between gap-4 py-3 text-sm">
                  <div>
                    <Link href={`/admin/produtos/${i.productId}`} className="font-semibold hover:text-ember">{i.name}</Link>
                    <p className="text-dim">{i.platform} · {i.qty} × {money(i.price)}</p>
                  </div>
                  <span className="tabular font-semibold">{money(i.qty * i.price)}</span>
                </li>
              ))}
            </ul>
            <dl className="mt-3 space-y-1.5 border-t border-line pt-3 text-sm">
              <div className="flex justify-between"><dt className="text-fog">Subtotal</dt><dd className="tabular">{money(o.subtotal)}</dd></div>
              {o.discount > 0 && <div className="flex justify-between text-ok"><dt>Cupom {o.coupon}</dt><dd className="tabular">−{money(o.discount)}</dd></div>}
              <div className="flex justify-between"><dt className="text-fog">Entrega</dt><dd className="tabular">{o.shipping ? money(o.shipping) : "Grátis"}</dd></div>
              <div className="flex justify-between pt-1 text-lg font-bold"><dt>Total</dt><dd className="tabular">{money(o.total)}</dd></div>
            </dl>
          </Panel>
          <Panel title="Histórico">
            <ol className="space-y-3 text-sm">
              {[...o.history].reverse().map((h, k) => (
                <li key={k} className="flex gap-3">
                  <span className="mt-1.5 size-2 shrink-0 rotate-45 bg-ember" />
                  <div>
                    <p className="font-semibold">{statusLabel[h.status]}</p>
                    <p className="text-dim">{dateTimeBR(h.at)}{h.note && ` · ${h.note}`}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Panel>
        </div>
        <div className="space-y-4">
          <Panel title="Atualizar status">
            <OrderStatusControl id={o.id} status={o.status} />
          </Panel>
          <Panel title="Cliente">
            <p className="font-semibold">{o.customer.name}</p>
            <p className="text-sm text-fog">{o.customer.email}</p>
            {o.customer.phone && <p className="text-sm text-fog">{o.customer.phone}</p>}
            {wa && (
              <a href={wa} target="_blank" rel="noreferrer" className="btn btn-sm mt-4 bg-[#25d366] text-[#06260f]">
                <WhatsIcon className="size-4" /> Chamar no WhatsApp
              </a>
            )}
          </Panel>
          <Panel title={o.delivery === "retirada" ? "Retirada na loja" : "Endereço de entrega"}>
            <p className="text-sm text-fog">
              {o.delivery === "retirada"
                ? "O cliente vai buscar na loja."
                : o.address && `${o.address.street}, ${o.address.number} ${o.address.complement ?? ""} — ${o.address.district}, ${o.address.city}/${o.address.state} · CEP ${o.address.zip}`}
            </p>
            <p className="mt-3 text-sm">Pagamento: <b>{o.payment === "pix" ? "Pix" : o.delivery === "retirada" ? "Na retirada" : "Na entrega"}</b></p>
            {o.notes && <p className="mt-3 border-l-2 border-gold pl-3 text-sm">{o.notes}</p>}
          </Panel>
        </div>
      </div>
    </>
  );
}
