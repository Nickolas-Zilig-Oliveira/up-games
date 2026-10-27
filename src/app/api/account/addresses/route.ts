import { z } from "zod";
import { mutate, uid } from "@/lib/db";
import { apiUser } from "@/lib/auth";
import { fail, ok, parse } from "@/lib/api";

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
  const address = { id: `adr-${uid()}`, ...body.data, state: body.data.state.toUpperCase() };
  await mutate((db) => {
    db.users.find((u) => u.id === me.id)!.addresses.push(address);
  });
  return ok({ address });
}

export async function DELETE(req: Request) {
  const me = await apiUser();
  if (!me) return fail("Entre na sua conta para continuar.", 401);
  const id = new URL(req.url).searchParams.get("id");
  await mutate((db) => {
    const u = db.users.find((x) => x.id === me.id)!;
    u.addresses = u.addresses.filter((a) => a.id !== id);
  });
  return ok();
}
