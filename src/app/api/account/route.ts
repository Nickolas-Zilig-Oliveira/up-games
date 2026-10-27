import { z } from "zod";
import { mutate } from "@/lib/db";
import { apiUser } from "@/lib/auth";
import { hashPassword, verifyPassword } from "@/lib/password";
import { fail, ok, parse } from "@/lib/api";

const schema = z.object({
  name: z.string().trim().min(2, "Digite seu nome.").optional(),
  phone: z.string().trim().optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6, "A nova senha precisa ter pelo menos 6 caracteres.").optional(),
});

export async function PATCH(req: Request) {
  const me = await apiUser();
  if (!me) return fail("Entre na sua conta para continuar.", 401);
  const body = await parse(req, schema);
  if ("error" in body) return body.error;
  const { name, phone, currentPassword, newPassword } = body.data;
  const result = await mutate((db) => {
    const u = db.users.find((x) => x.id === me.id)!;
    if (newPassword) {
      if (!currentPassword || !verifyPassword(currentPassword, u.passwordHash)) return "Senha atual incorreta.";
      u.passwordHash = hashPassword(newPassword);
    }
    if (name) u.name = name;
    if (phone !== undefined) u.phone = phone;
    return null;
  });
  return result ? fail(result) : ok();
}
