import { z } from "zod";

export const bannerSchema = z.object({
  title: z.string().trim().min(2, "Dê um título ao banner."),
  subtitle: z.string().trim().max(200).default(""),
  buttonLabel: z.string().trim().max(30).default("Ver agora"),
  link: z
    .string()
    .trim()
    .min(1, "Informe para onde o banner leva (ex.: /loja).")
    .refine((v) => v.startsWith("/") || /^https?:\/\//.test(v), "O link deve começar com / ou https://"),
  image: z.string().trim().nullable().optional(),
  position: z.number().int().optional(),
  active: z.boolean().default(true),
});
