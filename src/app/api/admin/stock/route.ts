import { z } from "zod";
import { mutate } from "@/lib/db";
import { apiUser } from "@/lib/auth";
import { moveStock } from "@/lib/orders";
import { fail, ok, parse } from "@/lib/api";

const schema = z.object({
  productId: z.string(),
  type: z.enum(["entrada", "saida", "ajuste"]),
  qty: z.number().int().nonnegative("Quantidade inválida."),
  note: z.string().trim().max(200).optional(),
});

export async function POST(req: Request) {
  const admin = await apiUser("admin");
  if (!admin) return fail("Acesso restrito ao admin.", 403);
  const body = await parse(req, schema);
  if ("error" in body) return body.error;
  const { productId, type, qty, note } = body.data;
  if (type !== "ajuste" && qty === 0) return fail("Informe uma quantidade maior que zero.");
  const stock = await mutate((db) => {
    moveStock(db, productId, type, qty, note, admin.name);
    return db.products.find((p) => p.id === productId)?.stock;
  });
  return stock === undefined ? fail("Produto não encontrado.", 404) : ok({ stock });
}
