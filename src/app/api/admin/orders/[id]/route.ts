import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { apiUser } from "@/lib/auth";
import { dbFail, fail, ok, parse } from "@/lib/api";

const schema = z.object({
  status: z.enum(["pendente", "pago", "separando", "enviado", "entregue", "cancelado"]),
  note: z.string().trim().max(300).optional(),
});

export async function PATCH(req: Request, ctx: RouteContext<"/api/admin/orders/[id]">) {
  if (!(await apiUser("admin"))) return fail("Acesso restrito ao admin.", 403);
  const { id } = await ctx.params;
  const body = await parse(req, schema);
  if ("error" in body) return body.error;
  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_set_order_status", { p_id: id, p_status: body.data.status, p_note: body.data.note ?? "" });
  if (error) return dbFail(error);
  return ok();
}
