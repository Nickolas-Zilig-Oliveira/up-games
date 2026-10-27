import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

/**
 * Cliente do Supabase com a sessão de quem está acessando (cookies).
 * Usa só a chave pública: quem decide o que cada pessoa pode ver ou mudar são as
 * regras de segurança por linha (RLS) do banco.
 */
export const createClient = cache(async () => {
  const jar = await cookies();
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
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
