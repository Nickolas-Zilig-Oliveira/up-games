import { createClient } from "@/lib/supabase/server";
import { apiUser } from "@/lib/auth";
import { dbFail, fail, ok } from "@/lib/api";

const TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
};
const MAX = 6 * 1024 * 1024;

/** Envia fotos para o Supabase Storage (pasta pública "products"). Só o admin consegue. */
export async function POST(req: Request) {
  if (!(await apiUser("admin"))) return fail("Acesso restrito ao admin.", 403);
  const form = await req.formData();
  const files = form.getAll("files").filter((f): f is File => f instanceof File);
  if (!files.length) return fail("Escolha pelo menos uma imagem.");
  const supabase = await createClient();
  const urls: string[] = [];
  for (const file of files) {
    const ext = TYPES[file.type];
    if (!ext) return fail(`${file.name}: use JPG, PNG, WEBP, GIF ou AVIF.`);
    if (file.size > MAX) return fail(`${file.name} passa de 6 MB. Reduza a imagem e tente de novo.`);
    const name = `${Date.now().toString(36)}-${crypto.randomUUID().slice(0, 8)}.${ext}`;
    const { error } = await supabase.storage.from("products").upload(name, file, { contentType: file.type, cacheControl: "31536000" });
    if (error) return dbFail({ message: error.message });
    urls.push(supabase.storage.from("products").getPublicUrl(name).data.publicUrl);
  }
  return ok({ urls });
}
