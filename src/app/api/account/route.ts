import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { apiUser } from "@/lib/auth";
import { dbFail, fail, ok, parse } from "@/lib/api";

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
  const supabase = await createClient();

  if (newPassword) {
    const check = currentPassword ? await supabase.auth.signInWithPassword({ email: me.email, password: currentPassword }) : null;
    if (!check || check.error) return fail("Senha atual incorreta.");
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) return fail("Não foi possível trocar a senha. Tente uma senha diferente.");
  }
  const patch: Record<string, string | null> = {};
  if (name) patch.name = name;
  if (phone !== undefined) patch.phone = phone || null;
  if (Object.keys(patch).length) {
    const { error } = await supabase.from("profiles").update(patch).eq("id", me.id);
    if (error) return dbFail(error);
  }
  return ok();
}
