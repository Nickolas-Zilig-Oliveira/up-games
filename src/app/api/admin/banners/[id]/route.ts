import { createClient } from "@/lib/supabase/server";
import { apiUser } from "@/lib/auth";
import { dbFail, fail, ok, parse } from "@/lib/api";
import { bannerSchema } from "../schema";

export async function PATCH(req: Request, ctx: RouteContext<"/api/admin/banners/[id]">) {
  if (!(await apiUser("admin"))) return fail("Acesso restrito ao admin.", 403);
  const { id } = await ctx.params;
  const body = await parse(req, bannerSchema.partial(), { partial: true });
  if ("error" in body) return body.error;
  const { buttonLabel, image, ...rest } = body.data;
  const patch: Record<string, unknown> = { ...rest };
  if (buttonLabel !== undefined) patch.button_label = buttonLabel;
  if ("image" in body.data) patch.image = image || null;
  const supabase = await createClient();
  const { error } = await supabase.from("banners").update(patch).eq("id", id);
  if (error) return dbFail(error);
  return ok();
}

export async function DELETE(_req: Request, ctx: RouteContext<"/api/admin/banners/[id]">) {
  if (!(await apiUser("admin"))) return fail("Acesso restrito ao admin.", 403);
  const { id } = await ctx.params;
  const supabase = await createClient();
  const { error } = await supabase.from("banners").delete().eq("id", id);
  if (error) return dbFail(error);
  return ok();
}
