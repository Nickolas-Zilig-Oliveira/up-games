import { promises as fs } from "node:fs";
import path from "node:path";
import { UPLOAD_DIR, uid } from "@/lib/db";
import { apiUser } from "@/lib/auth";
import { fail, ok } from "@/lib/api";

const TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
};
const MAX = 6 * 1024 * 1024;

export async function POST(req: Request) {
  if (!(await apiUser("admin"))) return fail("Acesso restrito ao admin.", 403);
  const form = await req.formData();
  const files = form.getAll("files").filter((f): f is File => f instanceof File);
  if (!files.length) return fail("Escolha pelo menos uma imagem.");
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  const urls: string[] = [];
  for (const file of files) {
    const ext = TYPES[file.type];
    if (!ext) return fail(`${file.name}: use JPG, PNG, WEBP, GIF ou AVIF.`);
    if (file.size > MAX) return fail(`${file.name} passa de 6 MB. Reduza a imagem e tente de novo.`);
    const name = `${Date.now().toString(36)}-${uid()}.${ext}`;
    await fs.writeFile(path.join(UPLOAD_DIR, name), Buffer.from(await file.arrayBuffer()));
    urls.push(`/api/uploads/${name}`);
  }
  return ok({ urls });
}
