import { z } from "zod";
import { mutate } from "@/lib/db";
import { apiUser } from "@/lib/auth";
import { fail, ok, parse } from "@/lib/api";

export async function PATCH(req: Request, ctx: RouteContext<"/api/admin/users/[id]">) {
  const admin = await apiUser("admin");
  if (!admin) return fail("Acesso restrito ao admin.", 403);
  const { id } = await ctx.params;
  if (id === admin.id) return fail("Você não pode alterar o próprio acesso.");
  const body = await parse(req, z.object({ role: z.enum(["admin", "customer"]) }));
  if ("error" in body) return body.error;
  await mutate((db) => {
    const u = db.users.find((x) => x.id === id);
    if (u) u.role = body.data.role;
  });
  return ok();
}
