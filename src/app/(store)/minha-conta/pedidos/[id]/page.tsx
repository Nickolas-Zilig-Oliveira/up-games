import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Check } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { read } from "@/lib/db";
import { dateTimeBR, money, statusFlow, statusLabel } from "@/lib/format";
import { StatusBadge } from "@/components/status-badge";
import { WhatsIcon } from "@/components/icons";
import { CancelOrderButton } from "@/components/store/cancel-order";
import { ConfettiBurst } from "@/components/store/confetti";

export const metadata = { title: "Pedido" };

export default async function OrderPage({ params, searchParams }: PageProps<"/minha-conta/pedidos/[id]">) {
  const { id } = await params;
  const { novo } = (await searchParams) as { novo?: string };
  const user = await requireUser(`/minha-conta/pedidos/${id}`);
  const db = await read();
  const o = db.orders.find((x) => x.id === id && (x.userId === user.id || user.role === "admin"));
  if (!o) notFound();
  const s = db.settings;
  const stepIdx = statusFlow.indexOf(o.status);
  const waText = encodeURIComponent(
    `Olá, Up Games! Fiz o pedido #${o.number} no site (${money(o.total)}). ${o.payment === "pix" ? "Pode me passar a chave Pix?" : ""}`,
  );

  return (
    <div className="space-y-8">
      <Link href="/minha-conta/pedidos" className="inline-flex items-center gap-2 text-sm text-fog hover:text-chalk">
        <ArrowLeft className="size-4" /> Todos os pedidos
      </Link>

      {novo && o.status === "pendente" && (
        <div className="chamfer relative overflow-hidden bg-gradient-to-r from-ember/25 to-violet/20 p-6 sm:p-8">
          <ConfettiBurst />
          <p className="display text-5xl sm:text-6xl">Pedido feito!</p>
          <p className="mt-3 max-w-[60ch] text-chalk/90">
            {o.payment === "pix"
              ? "Chama a gente no WhatsApp para receber a chave Pix. Assim que o pagamento cair, separamos seus itens."
              : o.delivery === "retirada"
                ? "Seus itens já estão reservados. É só passar na loja e pagar na retirada."
                : "Seus itens estão reservados. Você paga quando o pedido chegar."}
          </p>
          <a href={`https://wa.me/${s.whatsapp}?text=${waText}`} target="_blank" rel="noreferrer" className="btn btn-ember mt-6">
            <WhatsIcon className="size-5" /> Falar com a loja no WhatsApp
          </a>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-4">
        <h2 className="display text-5xl">Pedido #{o.number}</h2>
        <StatusBadge status={o.status} />
        <span className="text-sm text-dim">{dateTimeBR(o.createdAt)}</span>
      </div>

      {o.status !== "cancelado" && (
        <ol className="grid grid-cols-5 gap-1.5">
          {statusFlow.map((st, k) => {
            const done = k <= stepIdx;
            return (
              <li key={st}>
                <div className={`h-2 -skew-x-[20deg] ${done ? "bg-ember" : "bg-plate"}`} />
                <p className={`mt-2 flex items-center gap-1 text-xs font-semibold sm:text-sm ${done ? "text-chalk" : "text-dim"}`}>
                  {done && <Check className="hidden size-3.5 text-ember sm:block" />}
                  {statusLabel[st]}
                </p>
              </li>
            );
          })}
        </ol>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="chamfer-sm bg-deep p-5">
          <ul className="divide-y divide-line">
            {o.items.map((i) => (
              <li key={i.productId} className="flex items-center justify-between gap-4 py-3">
                <div>
                  <p className="font-semibold">{i.name}</p>
                  <p className="text-sm text-dim">{i.platform} · {i.qty} × {money(i.price)}</p>
                </div>
                <span className="tabular font-semibold">{money(i.qty * i.price)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-4 space-y-1.5 border-t border-line pt-4 text-sm">
            <div className="flex justify-between"><dt className="text-fog">Subtotal</dt><dd className="tabular">{money(o.subtotal)}</dd></div>
            {o.discount > 0 && <div className="flex justify-between text-ok"><dt>Desconto {o.coupon && `(${o.coupon})`}</dt><dd className="tabular">−{money(o.discount)}</dd></div>}
            <div className="flex justify-between"><dt className="text-fog">Entrega</dt><dd className="tabular">{o.shipping ? money(o.shipping) : "Grátis"}</dd></div>
            <div className="flex justify-between pt-2 text-lg font-bold"><dt>Total</dt><dd className="tabular">{money(o.total)}</dd></div>
          </dl>
        </div>
        <div className="space-y-4 text-sm">
          <div className="chamfer-sm bg-deep p-5">
            <p className="mb-1 font-semibold">{o.delivery === "retirada" ? "Retirada na loja" : "Entrega"}</p>
            <p className="text-fog">
              {o.delivery === "retirada"
                ? s.address
                : o.address && `${o.address.street}, ${o.address.number} ${o.address.complement ?? ""} — ${o.address.district}, ${o.address.city}/${o.address.state}`}
            </p>
          </div>
          <div className="chamfer-sm bg-deep p-5">
            <p className="mb-1 font-semibold">Pagamento</p>
            <p className="text-fog">{o.payment === "pix" ? "Pix" : o.delivery === "retirada" ? "Na retirada" : "Na entrega"}</p>
          </div>
          {o.notes && (
            <div className="chamfer-sm bg-deep p-5">
              <p className="mb-1 font-semibold">Observações</p>
              <p className="text-fog">{o.notes}</p>
            </div>
          )}
          {o.status === "pendente" && o.userId === user.id && <CancelOrderButton id={o.id} />}
        </div>
      </div>
    </div>
  );
}
