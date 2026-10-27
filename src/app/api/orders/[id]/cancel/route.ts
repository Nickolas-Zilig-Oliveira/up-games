import { mutate } from "@/lib/db";
import { apiUser } from "@/lib/auth";
import { moveStock } from "@/lib/orders";
import { fail, ok } from "@/lib/api";

export async function POST(_req: Request, ctx: RouteContext<"/api/orders/[id]/cancel">) {
  const me = await apiUser();
  if (!me) return fail("Entre na sua conta para continuar.", 401);
  const { id } = await ctx.params;
  const error = await mutate((db) => {
    const o = db.orders.find((x) => x.id === id && x.userId === me.id);
    if (!o) return "Pedido não encontrado.";
    if (o.status !== "pendente") return "Só dá para cancelar pedidos que ainda aguardam pagamento.";
    o.status = "cancelado";
    o.history.push({ status: "cancelado", at: new Date().toISOString(), note: "Cancelado pelo cliente" });
    for (const it of o.items) moveStock(db, it.productId, "cancelamento", it.qty, `Pedido #${o.number} cancelado`, me.name);
    return null;
  });
  return error ? fail(error) : ok();
}
