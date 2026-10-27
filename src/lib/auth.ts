import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "./supabase/server";
import { mapProfile } from "./db";
import type { PublicUser } from "./types";

/** Quem está logado (ou null). Busca o perfil com endereços e favoritos. */
export const currentUser = cache(async (): Promise<PublicUser | null> => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const uid = data?.claims?.sub;
  if (!uid) return null;
  const { data: profile } = await supabase
    .from("profiles")
    .select("*, addresses(*), favorites(product_id)")
    .eq("id", uid)
    .maybeSingle();
  return profile ? mapProfile(profile) : null;
});

export async function requireUser(next = "/minha-conta") {
  const user = await currentUser();
  if (!user) redirect(`/entrar?next=${encodeURIComponent(next)}`);
  return user;
}

export async function requireAdmin() {
  const user = await currentUser();
  if (!user) redirect("/entrar?next=/admin");
  if (user.role !== "admin") redirect("/");
  return user;
}

/** Para as rotas /api: devolve o usuário ou null, sem redirecionar. */
export async function apiUser(role?: "admin") {
  const user = await currentUser();
  if (!user) return null;
  if (role === "admin" && user.role !== "admin") return null;
  return user;
}
