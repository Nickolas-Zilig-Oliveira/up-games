import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

/**
 * Cliente do Supabase com a sessão de quem está acessando (cookies).
 * Usa só a chave pública: quem decide o que cada pessoa pode ver ou mudar são as
 * regras de segurança por linha (RLS) do banco.
 */
/**
 * fetch com tempo-limite e uma nova tentativa: se o banco demorar ou a rede oscilar,
 * a página não pode simplesmente chegar vazia.
 */
async function resilientFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const attempt = async (ms: number) => {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), ms);
    init?.signal?.addEventListener("abort", () => ctrl.abort());
    try {
      return await fetch(input, { ...init, signal: ctrl.signal });
    } finally {
      clearTimeout(timer);
    }
  };
  // Só leituras são repetidas: repetir uma gravação (ex.: fazer pedido) poderia duplicá-la.
  const method = (init?.method ?? (input instanceof Request ? input.method : "GET")).toUpperCase();
  if (method !== "GET" && method !== "HEAD") return attempt(15000);
  try {
    const res = await attempt(8000);
    if (res.status < 500) return res;
  } catch {
    // cai para a segunda tentativa
  }
  return attempt(12000);
}

export const createClient = cache(async () => {
  const jar = await cookies();
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
    global: { fetch: resilientFetch },
    cookies: {
      getAll: () => jar.getAll(),
      setAll: (list) => {
        try {
          for (const { name, value, options } of list) jar.set(name, value, options);
        } catch {
          // Chamado de um Server Component: quem renova a sessão é o proxy.
        }
      },
    },
  });
});
