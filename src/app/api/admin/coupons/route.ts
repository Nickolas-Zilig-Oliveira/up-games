import { createClient } from "@/lib/supabase/server";
import { apiUser } from "@/lib/auth";
import { dbFail, fail, ok, parse } from "@/lib/api";
import { mapCoupon } from "@/lib/db";
import { couponSchema } from "./schema";

export async function POST(req: Request) {
  if (!(await apiUser("admin"))) return fail("Acesso restrito ao admin.", 403);
  const body = await parse(req, couponSchema);
  if ("error" in body) return body.error;
  const { minTotal, maxUses, ...d } = body.data;
  if (d.kind === "percent" && d.value > 100) return fail("Desconto percentual vai até 100%.");
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("coupons")
    .insert({ ...d, min_total: minTotal, max_uses: maxUses ?? null })
    .select()
    .single();
  if (error) return error.code === "23505" ? fail("Esse código de cupom já existe.", 409) : dbFail(error);
  return ok({ coupon: mapCoupon(data) });
}
