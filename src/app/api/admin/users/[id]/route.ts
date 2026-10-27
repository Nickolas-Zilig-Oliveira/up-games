import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { apiUser } from "@/lib/auth";
import { dbFail, fail, ok, parse } from "@/lib/api";

export async function PATCH(req: Request, ctx: RouteContext<"/api/admin/users/[id]">) {
  const admin = await apiUser("admin");
  if (!admin) return fail("Acesso restrito ao admin.", 403);
  const { id } = await ctx.params;
  if (id === admin.id) return fail("Você não pode alterar o próprio acesso.");
  const body = await parse(req, z.object({ role: z.enum(["admin", "customer"]) }));
  if ("error" in body) return body.error;
  const supabase = await createClient();
  const { error } = await supabase.from("profiles").update({ role: body.data.role }).eq("id", id);
  if (error) return dbFail(error);
  return ok();
}
