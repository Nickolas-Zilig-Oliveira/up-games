import { createClient } from "@/lib/supabase/server";
import { apiUser } from "@/lib/auth";
import { dbFail, fail, ok, parse } from "@/lib/api";
import { couponSchema } from "../schema";

export async function PATCH(req: Request, ctx: RouteContext<"/api/admin/coupons/[id]">) {
  if (!(await apiUser("admin"))) return fail("Acesso restrito ao admin.", 403);
  const { id } = await ctx.params;
  const body = await parse(req, couponSchema.partial(), { partial: true });
  if ("error" in body) return body.error;
  const { minTotal, maxUses, ...rest } = body.data;
  const patch: Record<string, unknown> = { ...rest };
  if (minTotal !== undefined) patch.min_total = minTotal;
  if ("maxUses" in body.data) patch.max_uses = maxUses ?? null;
  const supabase = await createClient();
  const { error } = await supabase.from("coupons").update(patch).eq("id", id);
  if (error) return dbFail(error);
  return ok();
}

export async function DELETE(_req: Request, ctx: RouteContext<"/api/admin/coupons/[id]">) {
  if (!(await apiUser("admin"))) return fail("Acesso restrito ao admin.", 403);
  const { id } = await ctx.params;
  const supabase = await createClient();
  const { error } = await supabase.from("coupons").delete().eq("id", id);
  if (error) return dbFail(error);
  return ok();
}
