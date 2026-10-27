import { mutate, uid } from "@/lib/db";
import { apiUser } from "@/lib/auth";
import { fail, ok, parse } from "@/lib/api";
import { couponSchema } from "./schema";


export async function POST(req: Request) {
  if (!(await apiUser("admin"))) return fail("Acesso restrito ao admin.", 403);
  const body = await parse(req, couponSchema);
  if ("error" in body) return body.error;
  if (body.data.kind === "percent" && body.data.value > 100) return fail("Desconto percentual vai até 100%.");
  const coupon = await mutate((db) => {
    if (db.coupons.some((c) => c.code === body.data.code)) return null;
    const c = { id: `cpn-${uid()}`, uses: 0, ...body.data };
    db.coupons.push(c);
    return c;
  });
  return coupon ? ok({ coupon }) : fail("Esse código de cupom já existe.", 409);
}
