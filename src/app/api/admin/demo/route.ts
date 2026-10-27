import { mutate } from "@/lib/db";
import { apiUser } from "@/lib/auth";
import { fail, ok } from "@/lib/api";

/** Remove pedidos e clientes de demonstração criados pelo seed. */
export async function DELETE() {
  if (!(await apiUser("admin"))) return fail("Acesso restrito ao admin.", 403);
  const removed = await mutate((db) => {
    const before = db.orders.length;
    db.orders = db.orders.filter((o) => !o.demo);
    db.users = db.users.filter((u) => !u.id.startsWith("usr-demo-"));
    return before - db.orders.length;
  });
  return ok({ removed });
}
