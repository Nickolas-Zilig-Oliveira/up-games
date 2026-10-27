import { z } from "zod";

export const couponSchema = z.object({
  code: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z0-9]{3,20}$/, "Use de 3 a 20 letras ou números, sem espaços."),
  kind: z.enum(["percent", "fixed"]),
  value: z.number().positive("O desconto precisa ser maior que zero."),
  minTotal: z.number().nonnegative().default(0),
  maxUses: z.number().int().positive().optional(),
  active: z.boolean().default(true),
});
