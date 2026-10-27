import { mutate } from "@/lib/db";
import { apiUser } from "@/lib/auth";
import { slugify } from "@/lib/format";
import { fail, ok, parse } from "@/lib/api";
import { categorySchema } from "../schema";

export async function PATCH(req: Request, ctx: RouteContext<"/api/admin/categories/[id]">) {
  if (!(await apiUser("admin"))) return fail("Acesso restrito ao admin.", 403);
  const { id } = await ctx.params;
  const body = await parse(req, categorySchema);
  if ("error" in body) return body.error;
  await mutate((db) => {
    const c = db.categories.find((x) => x.id === id);
    if (c) Object.assign(c, body.data, { slug: slugify(body.data.name) });
  });
  return ok();
}

export async function DELETE(_req: Request, ctx: RouteContext<"/api/admin/categories/[id]">) {
  if (!(await apiUser("admin"))) return fail("Acesso restrito ao admin.", 403);
  const { id } = await ctx.params;
  const error = await mutate((db) => {
    const inUse = db.products.filter((p) => p.categoryId === id).length;
    if (inUse) return `Essa categoria tem ${inUse} produto(s). Mova-os para outra categoria antes de excluir.`;
    db.categories = db.categories.filter((c) => c.id !== id);
    return null;
  });
  return error ? fail(error, 409) : ok();
}
