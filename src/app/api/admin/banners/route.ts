import { createClient } from "@/lib/supabase/server";
import { apiUser } from "@/lib/auth";
import { dbFail, fail, ok, parse } from "@/lib/api";
import { mapBanner } from "@/lib/db";
import { bannerSchema } from "./schema";

export async function POST(req: Request) {
  if (!(await apiUser("admin"))) return fail("Acesso restrito ao admin.", 403);
  const body = await parse(req, bannerSchema);
  if ("error" in body) return body.error;
  const { buttonLabel, image, position, ...d } = body.data;
  const supabase = await createClient();
  const { count } = await supabase.from("banners").select("id", { count: "exact", head: true });
  const { data, error } = await supabase
    .from("banners")
    .insert({ ...d, button_label: buttonLabel, image: image || null, position: position ?? (count ?? 0) + 1 })
    .select()
    .single();
  if (error) return dbFail(error);
  return ok({ banner: mapBanner(data) });
}
