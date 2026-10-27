import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { dbFail, ok, parse } from "@/lib/api";

export async function POST(req: Request) {
  const body = await parse(req, z.object({ code: z.string().trim().toUpperCase(), subtotal: z.number().nonnegative() }));
  if ("error" in body) return body.error;
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("validate_coupon", { p_code: body.data.code, p_subtotal: body.data.subtotal });
  if (error) return dbFail(error);
  return ok(data);
}
