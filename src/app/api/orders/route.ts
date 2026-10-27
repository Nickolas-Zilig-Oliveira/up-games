import { z } from "zod";
import { mutate, uid } from "@/lib/db";
import { apiUser } from "@/lib/auth";
import { couponDiscount, moveStock, shippingFor } from "@/lib/orders";
import { fail, ok, parse } from "@/lib/api";
import type { Order } from "@/lib/types";

const schema = z.object({
  items: z.array(z.object({ productId: z.string(), qty: z.number().int().min(1).max(20) })).min(1, "Seu carrinho está vazio."),
  delivery: z.enum(["retirada", "entrega"]),
  payment: z.enum(["pix", "loja"]),
  coupon: z.string().trim().toUpperCase().optional(),
  phone: z.string().trim().min(8, "Informe um telefone para contato."),
  notes: z.string().trim().max(500).optional(),
  address: z
    .object({
      street: z.string().min(2),
      number: z.string().min(1),
      complement: z.string().optional(),
      district: z.string().min(2),
      city: z.string().min(2),
      state: z.string().length(2),
      zip: z.string().min(8),
    })
    .optional(),
});

export async function POST(req: Request) {
  const me = await apiUser();
  if (!me) return fail("Entre na sua conta para finalizar a compra.", 401);
  const body = await parse(req, schema);
  if ("error" in body) return body.error;
  const input = body.data;
  if (input.delivery === "entrega" && !input.address) return fail("Escolha um endereço de entrega.");

  const result = await mutate((db): { order: Order } | { error: string } => {
    const items = [];
    for (const it of input.items) {
      const p = db.products.find((x) => x.id === it.productId && x.active);
      if (!p) return { error: "Um item do carrinho não está mais disponível." };
      if (p.stock < it.qty) return { error: `Só temos ${p.stock} unidade(s) de ${p.name} no momento.` };
      items.push({ productId: p.id, name: p.name, price: p.price, qty: it.qty, image: p.images[0], platform: p.platform });
    }
    const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
    let discount = 0;
    let coupon: string | undefined;
    if (input.coupon) {
      const c = db.coupons.find((x) => x.code === input.coupon);
      const r = couponDiscount(c, subtotal);
      if (r.error) return { error: r.error };
      discount = r.discount;
      coupon = c!.code;
      c!.uses += 1;
    }
    const shipping = shippingFor(db.settings, subtotal, input.delivery);
    const now = new Date().toISOString();
    const order: Order = {
      id: `ord-${uid()}`,
      number: db.counters.order++,
      userId: me.id,
      customer: { name: me.name, email: me.email, phone: input.phone },
      items,
      subtotal,
      discount,
      shipping,
      total: Math.max(0, subtotal - discount + shipping),
      coupon,
      status: "pendente",
      payment: input.payment,
      delivery: input.delivery,
      address: input.delivery === "entrega" ? input.address : undefined,
      notes: input.notes,
      history: [{ status: "pendente", at: now }],
      createdAt: now,
    };
    for (const it of items) moveStock(db, it.productId, "venda", it.qty, `Pedido #${order.number}`, me.name);
    const u = db.users.find((x) => x.id === me.id);
    if (u && !u.phone) u.phone = input.phone;
    db.orders.push(order);
    return { order };
  });
  if ("error" in result) return fail(result.error, 409);
  return ok({ id: result.order.id, number: result.order.number });
}
