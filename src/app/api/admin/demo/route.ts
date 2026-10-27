import { createClient } from "@/lib/supabase/server";
import { apiUser } from "@/lib/auth";
import { dbFail, fail, ok } from "@/lib/api";

/** Remove os pedidos de exemplo. Produtos, estoque e clientes reais não são tocados. */
export async function DELETE() {
  if (!(await apiUser("admin"))) return fail("Acesso restrito ao admin.", 403);
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("admin_clear_demo");
  if (error) return dbFail(error);
  return ok({ removed: data });
}
