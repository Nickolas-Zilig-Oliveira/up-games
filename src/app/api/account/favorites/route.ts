import { z } from "zod";
import { mutate } from "@/lib/db";
import { apiUser } from "@/lib/auth";
import { fail, ok, parse } from "@/lib/api";

export async function POST(req: Request) {
  const me = await apiUser();
  if (!me) return fail("Entre na sua conta para salvar favoritos.", 401);
  const body = await parse(req, z.object({ productId: z.string() }));
  if ("error" in body) return body.error;
  const favorites = await mutate((db) => {
    const u = db.users.find((x) => x.id === me.id)!;
    const id = body.data.productId;
    u.favorites = u.favorites.includes(id) ? u.favorites.filter((f) => f !== id) : [...u.favorites, id];
    return u.favorites;
  });
  return ok({ favorites });
}
