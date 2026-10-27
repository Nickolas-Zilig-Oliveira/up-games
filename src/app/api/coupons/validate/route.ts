import { z } from "zod";
import { read } from "@/lib/db";
import { couponDiscount } from "@/lib/orders";
import { fail, ok, parse } from "@/lib/api";

export async function POST(req: Request) {
  const body = await parse(req, z.object({ code: z.string().trim().toUpperCase(), subtotal: z.number().nonnegative() }));
  if ("error" in body) return body.error;
  const coupon = (await read()).coupons.find((c) => c.code === body.data.code);
  const { discount, error } = couponDiscount(coupon, body.data.subtotal);
  return error ? fail(error) : ok({ code: coupon!.code, discount });
}
