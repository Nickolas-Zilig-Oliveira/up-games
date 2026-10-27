import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { apiUser } from "@/lib/auth";
import { dbFail, fail, ok, parse } from "@/lib/api";

const schema = z.object({
  items: z.array(z.object({ productId: z.string().uuid(), qty: z.number().int().min(1).max(20) })).min(1, "Seu carrinho está vazio."),
  delivery: z.enum(["retirada", "entrega"]),
  payment: z.enum(["pix", "loja"]),
  coupon: z.string().trim().toUpperCase().optional(),
  phone: z.string().trim().min(8, "Informe um telefone para contato."),
  notes: z.string().trim().max(500).optional(),
  address: z
    .object({
      street: z.string(),
      number: z.string(),
      complement: z.string().optional(),
      district: z.string(),
      city: z.string(),
      state: z.string(),
      zip: z.string(),
    })
    .optional(),
});

/** O pedido inteiro (preços, estoque, cupom e frete) é calculado e gravado dentro do banco, de uma vez só. */
export async function POST(req: Request) {
  const me = await apiUser();
  if (!me) return fail("Entre na sua conta para finalizar a compra.", 401);
  const body = await parse(req, schema);
  if ("error" in body) return body.error;
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("place_order", { p_payload: body.data });
  if (error) return dbFail(error, 409);
  return ok(data);
}
