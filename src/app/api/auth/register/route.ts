import { z } from "zod";
import { mutate, uid } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import { setSession, toPublic } from "@/lib/auth";
import { fail, ok, parse } from "@/lib/api";
import type { User } from "@/lib/types";

const ADMIN_EMAILS = ["adminup@gmail.com"];

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
  const user = await mutate((db) => {
    if (db.users.some((u) => u.email === email)) return null;
    const u: User = {
      id: `usr-${uid()}`,
      name,
      email,
      phone,
      passwordHash: hashPassword(password),
      role: ADMIN_EMAILS.includes(email) ? "admin" : "customer",
      addresses: [],
      favorites: [],
      createdAt: new Date().toISOString(),
    };
    db.users.push(u);
    return u;
  });
  if (!user) return fail("Já existe uma conta com esse e-mail. Entre com sua senha.", 409);
  await setSession(user.id);
  return ok({ user: toPublic(user) });
}
