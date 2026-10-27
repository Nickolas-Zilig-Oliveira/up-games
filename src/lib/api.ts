import { NextResponse } from "next/server";
import type { ZodType } from "zod";

export const ok = (data: unknown = { ok: true }, status = 200) => NextResponse.json(data, { status });
export const fail = (error: string, status = 400) => NextResponse.json({ error }, { status });

/**
 * Valida o corpo JSON. Com `partial`, descarta campos que não vieram na
 * requisição — assim defaults do schema não sobrescrevem dados num PATCH.
 */
export async function parse<T>(
  req: Request,
  schema: ZodType<T>,
  opts: { partial?: boolean } = {},
): Promise<{ data: T } | { error: Response }> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return { error: fail("Corpo da requisição inválido.") };
  }
  const result = schema.safeParse(body);
  if (!result.success) {
    const issue = result.error.issues[0];
    return { error: fail(issue?.message ?? "Dados inválidos.") };
  }
  if (opts.partial && body && typeof body === "object") {
    const sent = new Set(Object.keys(body));
    const data = Object.fromEntries(Object.entries(result.data as object).filter(([k]) => sent.has(k)));
    return { data: data as T };
  }
  return { data: result.data };
}
