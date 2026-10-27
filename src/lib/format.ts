import type { OrderStatus, Rarity } from "./types";

const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
export const money = (v: number) => brl.format(v);

export const dateBR = (iso: string) =>
  new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });

export const dateTimeBR = (iso: string) =>
  new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });

export function slugify(s: string) {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export const rarityLabel: Record<Rarity, string> = {
  comum: "Comum",
  raro: "Raro",
  epico: "Épico",
  lendario: "Lendário",
};

export const statusLabel: Record<OrderStatus, string> = {
  pendente: "Aguardando pagamento",
  pago: "Pago",
  separando: "Separando",
  enviado: "A caminho",
  entregue: "Entregue",
  cancelado: "Cancelado",
};

export const statusFlow: OrderStatus[] = ["pendente", "pago", "separando", "enviado", "entregue"];
