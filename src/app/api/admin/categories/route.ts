import { mutate, uid } from "@/lib/db";
import { apiUser } from "@/lib/auth";
import { slugify } from "@/lib/format";
import { fail, ok, parse } from "@/lib/api";
import { categorySchema } from "./schema";


export async function POST(req: Request) {
  if (!(await apiUser("admin"))) return fail("Acesso restrito ao admin.", 403);
  const body = await parse(req, categorySchema);
  if ("error" in body) return body.error;
  const category = await mutate((db) => {
    const slug = slugify(body.data.name);
    if (db.categories.some((c) => c.slug === slug)) return null;
    const c = { id: `cat-${uid()}`, slug, ...body.data };
    db.categories.push(c);
    return c;
  });
  return category ? ok({ category }) : fail("Já existe uma categoria com esse nome.", 409);
}
