import { z } from "zod";
import { mutate } from "@/lib/db";
import { apiUser } from "@/lib/auth";
import { moveStock } from "@/lib/orders";
import { fail, ok, parse } from "@/lib/api";

const schema = z.object({
  status: z.enum(["pendente", "pago", "separando", "enviado", "entregue", "cancelado"]),
  note: z.string().trim().max(300).optional(),
});

export async function PATCH(req: Request, ctx: RouteContext<"/api/admin/orders/[id]">) {
  const admin = await apiUser("admin");
  if (!admin) return fail("Acesso restrito ao admin.", 403);
  const { id } = await ctx.params;
  const body = await parse(req, schema);
  if ("error" in body) return body.error;
  const { status, note } = body.data;
  const error = await mutate((db) => {
    const o = db.orders.find((x) => x.id === id);
    if (!o) return "Pedido não encontrado.";
    if (o.status === status) return null;
    // Cancelar devolve ao estoque; reativar um cancelado retira de novo.
    if (status === "cancelado") {
      for (const it of o.items) moveStock(db, it.productId, "cancelamento", it.qty, `Pedido #${o.number} cancelado`, admin.name);
    } else if (o.status === "cancelado") {
      for (const it of o.items) moveStock(db, it.productId, "venda", it.qty, `Pedido #${o.number} reativado`, admin.name);
    }
    o.status = status;
    o.history.push({ status, at: new Date().toISOString(), note });
    return null;
  });
  return error ? fail(error, 404) : ok();
}
