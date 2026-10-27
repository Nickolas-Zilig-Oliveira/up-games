import { mutate } from "@/lib/db";
import { apiUser } from "@/lib/auth";
import { moveStock } from "@/lib/orders";
import { fail, ok, parse } from "@/lib/api";
import { productSchema } from "../schema";

export async function PATCH(req: Request, ctx: RouteContext<"/api/admin/products/[id]">) {
  const admin = await apiUser("admin");
  if (!admin) return fail("Acesso restrito ao admin.", 403);
  const { id } = await ctx.params;
  const body = await parse(req, productSchema.partial(), { partial: true });
  if ("error" in body) return body.error;
  const { stock, ...data } = body.data;
  const found = await mutate((db) => {
    const p = db.products.find((x) => x.id === id);
    if (!p) return false;
    Object.assign(p, data);
    if (stock !== undefined && stock !== p.stock) moveStock(db, p.id, "ajuste", stock, "Ajuste na edição do produto", admin.name);
    return true;
  });
  return found ? ok() : fail("Produto não encontrado.", 404);
}

export async function DELETE(_req: Request, ctx: RouteContext<"/api/admin/products/[id]">) {
  if (!(await apiUser("admin"))) return fail("Acesso restrito ao admin.", 403);
  const { id } = await ctx.params;
  const archived = await mutate((db) => {
    // Produtos com vendas ficam arquivados para não quebrar o histórico.
    const sold = db.orders.some((o) => o.items.some((i) => i.productId === id));
    if (sold) {
      const p = db.products.find((x) => x.id === id);
      if (p) p.active = false;
    } else {
      db.products = db.products.filter((x) => x.id !== id);
      db.movements = db.movements.filter((m) => m.productId !== id);
    }
    db.settings.dropIds = db.settings.dropIds.filter((d) => d !== id);
    return sold;
  });
  return ok({ archived });
}
