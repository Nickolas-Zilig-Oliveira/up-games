import { createClient } from "@/lib/supabase/server";
import { ok } from "@/lib/api";

export async function POST() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return ok();
}
