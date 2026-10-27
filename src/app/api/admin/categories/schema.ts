import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().trim().min(2, "Dê um nome à categoria."),
  icon: z.string().default("gamepad"),
});
