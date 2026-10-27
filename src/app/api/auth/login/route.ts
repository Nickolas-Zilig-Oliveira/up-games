import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { currentUser } from "@/lib/auth";
import { fail, ok, parse } from "@/lib/api";

const schema = z.object({
  email: z.string().trim().toLowerCase().email("Digite um e-mail válido."),
  password: z.string().min(1, "Digite sua senha."),
});

export async function POST(req: Request) {
  const body = await parse(req, schema);
  if ("error" in body) return body.error;
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email: body.data.email, password: body.data.password });
  if (error) return fail("E-mail ou senha incorretos.", 401);
  const user = await currentUser();
  return ok({ user });
}
