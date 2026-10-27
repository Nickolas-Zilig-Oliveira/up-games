import { z } from "zod";

export const productSchema = z.object({
  name: z.string().trim().min(2, "Dê um nome ao produto."),
  sku: z.string().trim().optional().default(""),
  description: z.string().trim().default(""),
  price: z.number({ error: "Informe o preço." }).positive("O preço precisa ser maior que zero."),
  comparePrice: z.number().nonnegative().optional(),
  cost: z.number().nonnegative().optional(),
  categoryId: z.string().min(1, "Escolha uma categoria."),
  platform: z.string().min(1, "Escolha a plataforma."),
  condition: z.enum(["novo", "seminovo"]),
  rarity: z.enum(["comum", "raro", "epico", "lendario"]),
  stock: z.number().int().nonnegative().default(0),
  minStock: z.number().int().nonnegative().default(2),
  images: z.array(z.string()).default([]),
  featured: z.boolean().default(false),
  active: z.boolean().default(true),
});
