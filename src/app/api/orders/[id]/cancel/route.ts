import { createClient } from "@/lib/supabase/server";
import { apiUser } from "@/lib/auth";
import { dbFail, fail, ok } from "@/lib/api";

export async function POST(_req: Request, ctx: RouteContext<"/api/orders/[id]/cancel">) {
  const me = await apiUser();
  if (!me) return fail("Entre na sua conta para continuar.", 401);
  const { id } = await ctx.params;
  const supabase = await createClient();
  const { error } = await supabase.rpc("cancel_my_order", { p_id: id });
  if (error) return dbFail(error);
  return ok();
}
