import { mutate, uid } from "@/lib/db";
import { apiUser } from "@/lib/auth";
import { moveStock } from "@/lib/orders";
import { slugify } from "@/lib/format";
import { fail, ok, parse } from "@/lib/api";
import { productSchema } from "./schema";
import type { Product } from "@/lib/types";

export async function POST(req: Request) {
  const admin = await apiUser("admin");
  if (!admin) return fail("Acesso restrito ao admin.", 403);
  const body = await parse(req, productSchema);
  if ("error" in body) return body.error;
  const { stock, ...data } = body.data;
  const product = await mutate((db) => {
    let slug = slugify(`${data.name} ${data.platform}`);
    if (db.products.some((p) => p.slug === slug)) slug = `${slug}-${uid().slice(0, 4)}`;
    const p: Product = {
      id: `prd-${uid()}`,
      slug,
      ...data,
      sku: data.sku || `UP-${1000 + db.products.length}`,
      stock: 0,
      createdAt: new Date().toISOString(),
    };
    db.products.push(p);
    if (stock > 0) moveStock(db, p.id, "entrada", stock, "Cadastro do produto", admin.name);
    return p;
  });
  return ok({ product });
}
