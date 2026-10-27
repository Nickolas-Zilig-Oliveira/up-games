import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { apiUser } from "@/lib/auth";
import { dbFail, fail, ok, parse } from "@/lib/api";

export async function POST(req: Request) {
  const me = await apiUser();
  if (!me) return fail("Entre na sua conta para salvar favoritos.", 401);
  const body = await parse(req, z.object({ productId: z.string().uuid() }));
  if ("error" in body) return body.error;
  const supabase = await createClient();
  const id = body.data.productId;
  const has = me.favorites.includes(id);
  const { error } = has
    ? await supabase.from("favorites").delete().eq("user_id", me.id).eq("product_id", id)
    : await supabase.from("favorites").insert({ user_id: me.id, product_id: id });
  if (error) return dbFail(error);
  return ok({ favorites: has ? me.favorites.filter((f) => f !== id) : [...me.favorites, id] });
}
