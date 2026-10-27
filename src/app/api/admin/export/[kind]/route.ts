import { apiUser } from "@/lib/auth";
import { read } from "@/lib/db";
import { statusLabel } from "@/lib/format";
import { fail } from "@/lib/api";

const cell = (v: unknown) => {
  const s = v === null || v === undefined ? "" : String(v);
  return /[";\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
const brl = (n: number | undefined) => (n === undefined ? "" : n.toFixed(2).replace(".", ","));
const when = (iso: string) => new Date(iso).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });

/** Planilha CSV (separador ponto e vírgula, abre direto no Excel em português). */
export async function GET(_req: Request, ctx: RouteContext<"/api/admin/export/[kind]">) {
  if (!(await apiUser("admin"))) return fail("Acesso restrito ao admin.", 403);
  const { kind } = await ctx.params;
  let header: string[];
  let rows: unknown[][];

  if (kind === "pedidos") {
    const db = await read(["orders"]);
    header = ["Pedido", "Data", "Cliente", "E-mail", "Telefone", "Itens", "Subtotal", "Desconto", "Entrega", "Total", "Cupom", "Status", "Pagamento", "Recebimento"];
    rows = db.orders.map((o) => [
      o.number, when(o.createdAt), o.customer.name, o.customer.email, o.customer.phone ?? "",
      o.items.map((i) => `${i.qty}x ${i.name}`).join(" | "),
      brl(o.subtotal), brl(o.discount), brl(o.shipping), brl(o.total), o.coupon ?? "",
      statusLabel[o.status], o.payment === "pix" ? "Pix" : "Na hora", o.delivery === "retirada" ? "Retirada" : "Entrega",
    ]);
  } else if (kind === "produtos") {
    const db = await read();
    const cats = new Map(db.categories.map((c) => [c.id, c.name]));
    header = ["Código", "Nome", "Categoria", "Plataforma", "Condição", "Preço", "Custo", "Estoque", "Aviso em", "Visível", "Destaque"];
    rows = db.products.map((p) => [p.sku, p.name, cats.get(p.categoryId) ?? "", p.platform, p.condition, brl(p.price), brl(p.cost), p.stock, p.minStock, p.active ? "Sim" : "Não", p.featured ? "Sim" : "Não"]);
  } else if (kind === "clientes") {
    const db = await read(["orders", "users"]);
    header = ["Nome", "E-mail", "Telefone", "Acesso", "Cliente desde", "Pedidos", "Total gasto"];
    rows = db.users.map((u) => {
      const mine = db.orders.filter((o) => o.userId === u.id && o.status !== "cancelado");
      return [u.name, u.email, u.phone ?? "", u.role === "admin" ? "Admin" : "Cliente", when(u.createdAt), mine.length, brl(mine.reduce((s, o) => s + o.total, 0))];
    });
  } else {
    return fail("Relatório desconhecido.", 404);
  }

  const csv = "﻿" + [header, ...rows].map((r) => r.map(cell).join(";")).join("\r\n");
  const day = new Date().toISOString().slice(0, 10);
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="up-games-${kind}-${day}.csv"`,
    },
  });
}
