import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { apiUser } from "@/lib/auth";
import { dbFail, fail, ok, parse } from "@/lib/api";

const schema = z.object({
  productId: z.string().uuid(),
  type: z.enum(["entrada", "saida", "ajuste"]),
  qty: z.number().int().nonnegative("Quantidade inválida."),
  note: z.string().trim().max(200).optional(),
});

export async function POST(req: Request) {
  if (!(await apiUser("admin"))) return fail("Acesso restrito ao admin.", 403);
  const body = await parse(req, schema);
  if ("error" in body) return body.error;
  const { productId, type, qty, note } = body.data;
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("admin_adjust_stock", { p_product: productId, p_type: type, p_qty: qty, p_note: note ?? "" });
  if (error) return dbFail(error);
  return ok({ stock: data });
}
