import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { currentUser } from "@/lib/auth";
import { dbFail, fail, ok, parse } from "@/lib/api";

const schema = z.object({
  name: z.string().trim().min(2, "Digite seu nome."),
  email: z.string().trim().toLowerCase().email("Digite um e-mail válido."),
  phone: z.string().trim().optional(),
  password: z.string().min(6, "A senha precisa ter pelo menos 6 caracteres."),
});

export async function POST(req: Request) {
  const body = await parse(req, schema);
  if ("error" in body) return body.error;
  const { name, email, phone, password } = body.data;
  const supabase = await createClient();
  const { error } = await supabase.rpc("register_user", { p_email: email, p_password: password, p_name: name, p_phone: phone ?? "" });
  if (error) return dbFail(error, error.message.startsWith("Já existe") ? 409 : 400);
  const login = await supabase.auth.signInWithPassword({ email, password });
  if (login.error) return fail("Conta criada, mas não foi possível entrar. Tente entrar com sua senha.", 500);
  return ok({ user: await currentUser() });
}
