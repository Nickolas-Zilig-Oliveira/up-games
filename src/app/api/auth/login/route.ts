import { z } from "zod";
import { read } from "@/lib/db";
import { verifyPassword } from "@/lib/password";
import { setSession, toPublic } from "@/lib/auth";
import { fail, ok, parse } from "@/lib/api";

const schema = z.object({
  email: z.string().trim().toLowerCase().email("Digite um e-mail válido."),
  password: z.string().min(1, "Digite sua senha."),
});

export async function POST(req: Request) {
  const body = await parse(req, schema);
  if ("error" in body) return body.error;
  const user = (await read()).users.find((u) => u.email === body.data.email);
  if (!user || !verifyPassword(body.data.password, user.passwordHash)) {
    return fail("E-mail ou senha incorretos.", 401);
  }
  await setSession(user.id);
  return ok({ user: toPublic(user) });
}
