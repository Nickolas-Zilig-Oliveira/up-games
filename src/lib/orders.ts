import type { Coupon, Database, MovementType, Settings } from "./types";
import { uid } from "./db";

export function couponDiscount(coupon: Coupon | undefined, subtotal: number): { discount: number; error?: string } {
  if (!coupon || !coupon.active) return { discount: 0, error: "Cupom inválido ou expirado." };
  if (coupon.maxUses && coupon.uses >= coupon.maxUses) return { discount: 0, error: "Esse cupom já atingiu o limite de usos." };
  if (subtotal < coupon.minTotal) {
    return { discount: 0, error: `Esse cupom vale para compras a partir de R$ ${coupon.minTotal.toFixed(2).replace(".", ",")}.` };
  }
  const raw = coupon.kind === "percent" ? (subtotal * coupon.value) / 100 : coupon.value;
  return { discount: Math.min(Math.round(raw * 100) / 100, subtotal) };
}

export function shippingFor(settings: Settings, subtotal: number, delivery: "retirada" | "entrega") {
  if (delivery === "retirada") return 0;
  return subtotal >= settings.freeShippingOver ? 0 : settings.deliveryFee;
}

/** Registra movimento de estoque e atualiza o saldo do produto. */
export function moveStock(
  db: Database,
  productId: string,
  type: MovementType,
  qty: number,
  note?: string,
  by?: string,
) {
  const p = db.products.find((x) => x.id === productId);
  if (!p) return;
  const delta = type === "saida" || type === "venda" ? -Math.abs(qty) : type === "ajuste" ? qty - p.stock : Math.abs(qty);
  p.stock = Math.max(0, p.stock + delta);
  db.movements.push({
    id: `mov-${uid()}`,
    productId,
    type,
    qty: delta,
    balance: p.stock,
    note,
    by,
    createdAt: new Date().toISOString(),
  });
}
