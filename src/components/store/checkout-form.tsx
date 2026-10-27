"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { QrCode, Store, Ticket, Truck, Wallet, X } from "lucide-react";
import type { Address } from "@/lib/types";
import { money } from "@/lib/format";
import { useCart, useToast } from "../providers";
import { ProductArt } from "../product-art";

type NewAddress = Omit<Address, "id" | "label">;
const emptyAddress: NewAddress = { zip: "", street: "", number: "", complement: "", district: "", city: "São Paulo", state: "SP" };

function Option({
  active,
  onClick,
  icon,
  title,
  text,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`chamfer-sm flex flex-1 items-start gap-3 p-4 text-left transition-colors ${
        active ? "bg-ember/15 ring-1 ring-inset ring-ember" : "bg-deep hover:bg-plate"
      }`}
    >
      <span className={active ? "text-ember" : "text-dim"}>{icon}</span>
      <span>
        <span className="block font-semibold">{title}</span>
        <span className="mt-0.5 block text-sm text-fog">{text}</span>
      </span>
    </button>
  );
}

export function CheckoutForm({
  user,
  deliveryFee,
  freeShippingOver,
  storeAddress,
}: {
  user: { name: string; phone: string; addresses: Address[] };
  deliveryFee: number;
  freeShippingOver: number;
  storeAddress: string;
}) {
  const { lines, subtotal, clear } = useCart();
  const router = useRouter();
  const toast = useToast();
  const [delivery, setDelivery] = useState<"retirada" | "entrega">("retirada");
  const [payment, setPayment] = useState<"pix" | "loja">("pix");
  const [phone, setPhone] = useState(user.phone);
  const [addrId, setAddrId] = useState(user.addresses[0]?.id ?? "nova");
  const [addr, setAddr] = useState<NewAddress>(emptyAddress);
  const [notes, setNotes] = useState("");
  const [couponInput, setCouponInput] = useState("");
  const [coupon, setCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const shipping = delivery === "entrega" && subtotal < freeShippingOver ? deliveryFee : 0;
  const discount = coupon ? Math.min(coupon.discount, subtotal) : 0;
  const total = Math.max(0, subtotal - discount + shipping);

  async function applyCoupon() {
    if (!couponInput.trim()) return;
    const res = await fetch("/api/coupons/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: couponInput, subtotal }),
    });
    const data = await res.json();
    if (!res.ok) {
      toast(data.error, "bad");
      return;
    }
    setCoupon(data);
    toast(`Cupom ${data.code} aplicado.`);
  }

  async function lookupZip(zip: string) {
    const digits = zip.replace(/\D/g, "");
    if (digits.length !== 8) return;
    try {
      const r = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      const d = await r.json();
      if (!d.erro) setAddr((a) => ({ ...a, street: d.logradouro || a.street, district: d.bairro || a.district, city: d.localidade || a.city, state: d.uf || a.state }));
    } catch {}
  }

  async function submit() {
    setError("");
    const chosen = addrId === "nova" ? addr : user.addresses.find((a) => a.id === addrId);
    if (phone.replace(/\D/g, "").length < 10) {
      setError("Informe um WhatsApp com DDD para falarmos sobre o pedido.");
      return;
    }
    if (delivery === "entrega" && (!chosen || !chosen.street || !chosen.number || !chosen.district || chosen.zip.replace(/\D/g, "").length !== 8)) {
      setError("Preencha CEP, rua, número e bairro para a entrega.");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: lines.map((l) => ({ productId: l.productId, qty: l.qty })),
        delivery,
        payment,
        phone,
        notes: notes || undefined,
        coupon: coupon?.code,
        address: delivery === "entrega" && chosen ? { ...chosen, id: undefined, label: undefined } : undefined,
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Não foi possível finalizar. Confira os dados e tente de novo.");
      return;
    }
    clear();
    router.push(`/minha-conta/pedidos/${data.id}?novo=1`);
  }

  if (lines.length === 0) {
    return (
      <div className="chamfer flex flex-col items-center gap-4 bg-deep px-6 py-20 text-center">
        <p className="display text-4xl">Carrinho vazio</p>
        <p className="text-fog">Adicione itens para finalizar a compra.</p>
        <Link href="/loja" className="btn btn-ember">Ver a loja</Link>
      </div>
    );
  }

  const set = (k: keyof NewAddress) => (e: React.ChangeEvent<HTMLInputElement>) => setAddr((a) => ({ ...a, [k]: e.target.value }));

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_400px]">
      <div className="space-y-10">
        <section>
          <h2 className="mb-4 text-lg font-bold">Contato</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Nome</label>
              <input className="field opacity-70" value={user.name} disabled />
            </div>
            <div>
              <label className="label" htmlFor="phone">WhatsApp para contato</label>
              <input id="phone" className="field" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(11) 90000-0000" />
            </div>
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-lg font-bold">Como você quer receber?</h2>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Option active={delivery === "retirada"} onClick={() => setDelivery("retirada")} icon={<Store className="size-5" />} title="Retirar na loja" text="Grátis, no mesmo dia" />
            <Option
              active={delivery === "entrega"}
              onClick={() => setDelivery("entrega")}
              icon={<Truck className="size-5" />}
              title="Entrega"
              text={subtotal >= freeShippingOver ? "Grátis neste pedido" : `${money(deliveryFee)} · grátis acima de ${money(freeShippingOver)}`}
            />
          </div>
          <AnimatePresence initial={false}>
            {delivery === "retirada" ? (
              <motion.p key="ret" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-4 text-sm text-fog">
                Retirada em: {storeAddress}
              </motion.p>
            ) : (
              <motion.div key="ent" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                <div className="space-y-3 pt-5">
                  {user.addresses.map((a) => (
                    <label key={a.id} className={`chamfer-sm flex cursor-pointer gap-3 p-4 ${addrId === a.id ? "bg-plate ring-1 ring-inset ring-ember" : "bg-deep"}`}>
                      <input type="radio" name="addr" checked={addrId === a.id} onChange={() => setAddrId(a.id)} className="mt-1 accent-[var(--color-ember)]" />
                      <span className="text-sm">
                        <b>{a.label}</b>
                        <span className="block text-fog">{a.street}, {a.number} {a.complement} — {a.district}, {a.city}/{a.state}</span>
                      </span>
                    </label>
                  ))}
                  {user.addresses.length > 0 && (
                    <label className={`chamfer-sm flex cursor-pointer gap-3 p-4 ${addrId === "nova" ? "bg-plate ring-1 ring-inset ring-ember" : "bg-deep"}`}>
                      <input type="radio" name="addr" checked={addrId === "nova"} onChange={() => setAddrId("nova")} className="accent-[var(--color-ember)]" />
                      <span className="text-sm font-semibold">Usar outro endereço</span>
                    </label>
                  )}
                  {addrId === "nova" && (
                    <div className="grid grid-cols-6 gap-3 pt-2">
                      <div className="col-span-2">
                        <label className="label">CEP</label>
                        <input className="field" value={addr.zip} onChange={set("zip")} onBlur={(e) => lookupZip(e.target.value)} inputMode="numeric" />
                      </div>
                      <div className="col-span-4">
                        <label className="label">Rua</label>
                        <input className="field" value={addr.street} onChange={set("street")} />
                      </div>
                      <div className="col-span-2">
                        <label className="label">Número</label>
                        <input className="field" value={addr.number} onChange={set("number")} />
                      </div>
                      <div className="col-span-4">
                        <label className="label">Complemento</label>
                        <input className="field" value={addr.complement} onChange={set("complement")} />
                      </div>
                      <div className="col-span-3">
                        <label className="label">Bairro</label>
                        <input className="field" value={addr.district} onChange={set("district")} />
                      </div>
                      <div className="col-span-2">
                        <label className="label">Cidade</label>
                        <input className="field" value={addr.city} onChange={set("city")} />
                      </div>
                      <div className="col-span-1">
                        <label className="label">UF</label>
                        <input className="field" value={addr.state} onChange={set("state")} maxLength={2} />
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        <section>
          <h2 className="mb-4 text-lg font-bold">Pagamento</h2>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Option active={payment === "pix"} onClick={() => setPayment("pix")} icon={<QrCode className="size-5" />} title="Pix" text="Enviamos a chave pelo WhatsApp após o pedido" />
            <Option
              active={payment === "loja"}
              onClick={() => setPayment("loja")}
              icon={<Wallet className="size-5" />}
              title={delivery === "retirada" ? "Pagar na retirada" : "Pagar na entrega"}
              text="Dinheiro, débito ou crédito"
            />
          </div>
        </section>

        <section>
          <label className="label" htmlFor="notes">Observações (opcional)</label>
          <textarea id="notes" className="field" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Ex.: é presente, prefiro retirar depois das 18h" />
        </section>
      </div>

      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="chamfer edge">
          <div className="chamfer bg-deep p-6">
            <h2 className="mb-4 text-lg font-bold">Resumo</h2>
            <ul className="space-y-3">
              {lines.map((l) => (
                <li key={l.productId} className="flex items-center gap-3">
                  <div className="chamfer-sm size-14 shrink-0 overflow-hidden">
                    <ProductArt image={l.image} name={l.name} platform={l.platform} rarity={l.rarity} icon={l.categoryIcon} size="sm" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{l.name}</p>
                    <p className="text-xs text-dim">{l.qty} × {money(l.price)}</p>
                  </div>
                  <span className="tabular text-sm font-semibold">{money(l.qty * l.price)}</span>
                </li>
              ))}
            </ul>

            <div className="mt-5 border-t border-line pt-5">
              {coupon ? (
                <div className="flex items-center justify-between bg-ok/10 px-3 py-2 text-sm">
                  <span className="flex items-center gap-2"><Ticket className="size-4 text-ok" /> {coupon.code}</span>
                  <button onClick={() => setCoupon(null)} aria-label="Remover cupom" className="text-fog hover:text-chalk"><X className="size-4" /></button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    className="field h-11 uppercase"
                    placeholder="Cupom de desconto"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && applyCoupon()}
                  />
                  <button onClick={applyCoupon} className="btn btn-ghost h-11">Aplicar</button>
                </div>
              )}
            </div>

            <dl className="mt-5 space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-fog">Subtotal</dt><dd className="tabular">{money(subtotal)}</dd></div>
              {discount > 0 && <div className="flex justify-between text-ok"><dt>Desconto</dt><dd className="tabular">−{money(discount)}</dd></div>}
              <div className="flex justify-between"><dt className="text-fog">Entrega</dt><dd className="tabular">{shipping ? money(shipping) : "Grátis"}</dd></div>
              <div className="flex items-baseline justify-between border-t border-line pt-3">
                <dt className="font-semibold">Total</dt>
                <dd className="tabular text-3xl font-bold">{money(total)}</dd>
              </div>
            </dl>

            {error && <p className="mt-4 border-l-2 border-bad bg-bad/10 px-3 py-2 text-sm" role="alert">{error}</p>}
            <button onClick={submit} disabled={loading} className="btn btn-ember mt-5 h-14 w-full text-base">
              {loading ? "Enviando pedido…" : "Confirmar pedido"}
            </button>
            <p className="mt-3 text-center text-xs text-dim">Os itens ficam reservados assim que você confirma.</p>
          </div>
        </div>
      </aside>
    </div>
  );
}
