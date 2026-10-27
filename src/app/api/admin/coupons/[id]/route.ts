import { mutate } from "@/lib/db";
import { apiUser } from "@/lib/auth";
import { fail, ok, parse } from "@/lib/api";
import { couponSchema } from "../schema";

export async function PATCH(req: Request, ctx: RouteContext<"/api/admin/coupons/[id]">) {
  if (!(await apiUser("admin"))) return fail("Acesso restrito ao admin.", 403);
  const { id } = await ctx.params;
  const body = await parse(req, couponSchema.partial(), { partial: true });
  if ("error" in body) return body.error;
  await mutate((db) => {
    const c = db.coupons.find((x) => x.id === id);
    if (c) Object.assign(c, body.data);
  });
  return ok();
}

export async function DELETE(_req: Request, ctx: RouteContext<"/api/admin/coupons/[id]">) {
  if (!(await apiUser("admin"))) return fail("Acesso restrito ao admin.", 403);
  const { id } = await ctx.params;
  await mutate((db) => {
    db.coupons = db.coupons.filter((c) => c.id !== id);
  });
  return ok();
}
