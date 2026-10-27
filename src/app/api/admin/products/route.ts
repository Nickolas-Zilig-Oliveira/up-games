import { createClient } from "@/lib/supabase/server";
import { apiUser } from "@/lib/auth";
import { slugify } from "@/lib/format";
import { dbFail, fail, ok, parse } from "@/lib/api";
import { mapProduct } from "@/lib/db";
import { productSchema } from "./schema";

export async function POST(req: Request) {
  if (!(await apiUser("admin"))) return fail("Acesso restrito ao admin.", 403);
  const body = await parse(req, productSchema);
  if ("error" in body) return body.error;
  const { stock, comparePrice, cost, categoryId, minStock, ...d } = body.data;
  const supabase = await createClient();

  const base = slugify(`${d.name} ${d.platform}`);
  let product = null;
  for (let attempt = 0; attempt < 4 && !product; attempt++) {
    const slug = attempt === 0 ? base : `${base}-${crypto.randomUUID().slice(0, 4)}`;
    const { data, error } = await supabase
      .from("products")
      .insert({
        ...d,
        slug,
        sku: d.sku || `UP-${Date.now().toString(36).slice(-5).toUpperCase()}`,
        compare_price: comparePrice || null,
        cost: cost || null,
        category_id: categoryId,
        min_stock: minStock,
        stock: 0,
      })
      .select()
      .single();
    if (!error) product = data;
    else if (error.code !== "23505") return dbFail(error);
  }
  if (!product) return fail("Não foi possível criar o produto. Tente outro nome.", 409);

  if (stock > 0) {
    const { error } = await supabase.rpc("admin_adjust_stock", { p_product: product.id, p_type: "entrada", p_qty: stock, p_note: "Cadastro do produto" });
    if (error) return dbFail(error);
  }
  return ok({ product: mapProduct({ ...product, stock }) });
}
