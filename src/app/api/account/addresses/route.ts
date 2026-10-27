import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { apiUser } from "@/lib/auth";
import { dbFail, fail, ok, parse } from "@/lib/api";
import { mapAddress } from "@/lib/db";

const schema = z.object({
  label: z.string().trim().min(1, "Dê um nome ao endereço (ex.: Casa)."),
  zip: z.string().trim().min(8, "Digite o CEP."),
  street: z.string().trim().min(2, "Digite a rua."),
  number: z.string().trim().min(1, "Digite o número."),
  complement: z.string().trim().optional(),
  district: z.string().trim().min(2, "Digite o bairro."),
  city: z.string().trim().min(2, "Digite a cidade."),
  state: z.string().trim().length(2, "Use a sigla do estado (ex.: SP)."),
});

export async function POST(req: Request) {
  const me = await apiUser();
  if (!me) return fail("Entre na sua conta para continuar.", 401);
  const body = await parse(req, schema);
  if ("error" in body) return body.error;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("addresses")
    .insert({ ...body.data, complement: body.data.complement || null, state: body.data.state.toUpperCase(), user_id: me.id })
    .select()
    .single();
  if (error) return dbFail(error);
  return ok({ address: mapAddress(data) });
}

export async function DELETE(req: Request) {
  const me = await apiUser();
  if (!me) return fail("Entre na sua conta para continuar.", 401);
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return fail("Endereço não informado.");
  const supabase = await createClient();
  const { error } = await supabase.from("addresses").delete().eq("id", id).eq("user_id", me.id);
  if (error) return dbFail(error);
  return ok();
}
