import { createClient } from "@/lib/supabase/server";
import { apiUser } from "@/lib/auth";
import { dbFail, fail, ok, parse } from "@/lib/api";
import { getSettings } from "@/lib/db";
import { productSchema } from "../schema";

export async function PATCH(req: Request, ctx: RouteContext<"/api/admin/products/[id]">) {
  if (!(await apiUser("admin"))) return fail("Acesso restrito ao admin.", 403);
  const { id } = await ctx.params;
  const body = await parse(req, productSchema.partial(), { partial: true });
  if ("error" in body) return body.error;
  const { stock, comparePrice, cost, categoryId, minStock, ...rest } = body.data;
  const supabase = await createClient();

  const patch: Record<string, unknown> = { ...rest };
  if ("comparePrice" in body.data) patch.compare_price = comparePrice || null;
  if ("cost" in body.data) patch.cost = cost || null;
  if (categoryId !== undefined) patch.category_id = categoryId;
  if (minStock !== undefined) patch.min_stock = minStock;

  if (Object.keys(patch).length) {
    const { data, error } = await supabase.from("products").update(patch).eq("id", id).select("id");
    if (error) return dbFail(error);
    if (!data?.length) return fail("Produto não encontrado.", 404);
  }
  if (stock !== undefined) {
    const { data: current } = await supabase.from("products").select("stock").eq("id", id).maybeSingle();
    if (!current) return fail("Produto não encontrado.", 404);
    if (current.stock !== stock) {
      const { error } = await supabase.rpc("admin_adjust_stock", { p_product: id, p_type: "ajuste", p_qty: stock, p_note: "Ajuste na edição do produto" });
      if (error) return dbFail(error);
    }
  }
  return ok();
}

export async function DELETE(_req: Request, ctx: RouteContext<"/api/admin/products/[id]">) {
  if (!(await apiUser("admin"))) return fail("Acesso restrito ao admin.", 403);
  const { id } = await ctx.params;
  const supabase = await createClient();

  // Produto que já vendeu fica oculto, para não quebrar o histórico dos pedidos.
  const { count } = await supabase.from("order_items").select("id", { count: "exact", head: true }).eq("product_id", id);
  const archived = (count ?? 0) > 0;
  const { error } = archived
    ? await supabase.from("products").update({ active: false, featured: false }).eq("id", id)
    : await supabase.from("products").delete().eq("id", id);
  if (error) return dbFail(error);

  const settings = await getSettings();
  if (settings.dropIds.includes(id)) {
    await supabase.from("settings").upsert({ id: 1, data: { ...settings, dropIds: settings.dropIds.filter((d) => d !== id) } });
  }
  return ok({ archived });
}
