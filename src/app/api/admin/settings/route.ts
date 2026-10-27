import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getSettings } from "@/lib/db";
import { apiUser } from "@/lib/auth";
import { dbFail, fail, ok, parse } from "@/lib/api";

const schema = z
  .object({
    storeName: z.string().trim().min(1),
    heroTitle: z.string().trim().min(3, "O título do topo não pode ficar vazio."),
    heroSubtitle: z.string().trim(),
    announcement: z.string().trim(),
    announcementActive: z.boolean(),
    whatsapp: z.string().trim().regex(/^\d{10,13}$/, "WhatsApp: só números, com DDI e DDD (ex.: 5511988022398)."),
    phone: z.string().trim(),
    email: z.string().trim(),
    address: z.string().trim(),
    mapsUrl: z.string().trim(),
    instagram: z.string().trim(),
    tiktok: z.string().trim(),
    hours: z.array(z.object({ day: z.string(), open: z.string(), close: z.string(), closed: z.boolean().optional() })),
    deliveryFee: z.number().nonnegative(),
    freeShippingOver: z.number().nonnegative(),
    dropIds: z.array(z.string()).max(8, "O drop aceita no máximo 8 produtos."),
    tradeInTitle: z.string().trim(),
    tradeInText: z.string().trim(),
    platforms: z.array(z.string().trim().min(1)).min(1),
  })
  .partial();

export async function PATCH(req: Request) {
  if (!(await apiUser("admin"))) return fail("Acesso restrito ao admin.", 403);
  const body = await parse(req, schema, { partial: true });
  if ("error" in body) return body.error;
  const current = await getSettings();
  const supabase = await createClient();
  const { error } = await supabase.from("settings").upsert({ id: 1, data: { ...current, ...body.data } });
  if (error) return dbFail(error);
  return ok();
}
