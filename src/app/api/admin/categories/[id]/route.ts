import { createClient } from "@/lib/supabase/server";
import { apiUser } from "@/lib/auth";
import { slugify } from "@/lib/format";
import { dbFail, fail, ok, parse } from "@/lib/api";
import { categorySchema } from "../schema";

export async function PATCH(req: Request, ctx: RouteContext<"/api/admin/categories/[id]">) {
  if (!(await apiUser("admin"))) return fail("Acesso restrito ao admin.", 403);
  const { id } = await ctx.params;
  const body = await parse(req, categorySchema);
  if ("error" in body) return body.error;
  const supabase = await createClient();
  const { error } = await supabase.from("categories").update({ name: body.data.name, icon: body.data.icon, slug: slugify(body.data.name) }).eq("id", id);
  if (error) return error.code === "23505" ? fail("Já existe uma categoria com esse nome.", 409) : dbFail(error);
  return ok();
}

export async function DELETE(_req: Request, ctx: RouteContext<"/api/admin/categories/[id]">) {
  if (!(await apiUser("admin"))) return fail("Acesso restrito ao admin.", 403);
  const { id } = await ctx.params;
  const supabase = await createClient();
  const { count } = await supabase.from("products").select("id", { count: "exact", head: true }).eq("category_id", id);
  if (count) return fail(`Essa categoria tem ${count} produto(s). Mova-os para outra categoria antes de excluir.`, 409);
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) return dbFail(error);
  return ok();
}
