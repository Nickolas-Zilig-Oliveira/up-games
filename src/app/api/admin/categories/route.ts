import { createClient } from "@/lib/supabase/server";
import { apiUser } from "@/lib/auth";
import { slugify } from "@/lib/format";
import { dbFail, fail, ok, parse } from "@/lib/api";
import { mapCategory } from "@/lib/db";
import { categorySchema } from "./schema";

export async function POST(req: Request) {
  if (!(await apiUser("admin"))) return fail("Acesso restrito ao admin.", 403);
  const body = await parse(req, categorySchema);
  if ("error" in body) return body.error;
  const supabase = await createClient();
  const { count } = await supabase.from("categories").select("id", { count: "exact", head: true });
  const { data, error } = await supabase
    .from("categories")
    .insert({ name: body.data.name, icon: body.data.icon, slug: slugify(body.data.name), position: (count ?? 0) + 1 })
    .select()
    .single();
  if (error) return error.code === "23505" ? fail("Já existe uma categoria com esse nome.", 409) : dbFail(error);
  return ok({ category: mapCategory(data) });
}
