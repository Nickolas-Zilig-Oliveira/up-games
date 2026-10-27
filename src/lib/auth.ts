import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { read } from "./db";
import type { PublicUser, User } from "./types";

const COOKIE = "up_session";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 dias
const SECRET = process.env.AUTH_SECRET || "up-games-dev-secret-troque-em-producao";

function sign(payload: string) {
  return createHmac("sha256", SECRET).update(payload).digest("base64url");
}

export function createToken(userId: string) {
  const payload = Buffer.from(JSON.stringify({ uid: userId, exp: Date.now() + MAX_AGE * 1000 })).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

function parseToken(token: string | undefined): string | null {
  if (!token) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  const expected = Buffer.from(sign(payload));
  const given = Buffer.from(sig);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString()) as { uid: string; exp: number };
    return data.exp > Date.now() ? data.uid : null;
  } catch {
    return null;
  }
}

export async function setSession(userId: string) {
  (await cookies()).set(COOKIE, createToken(userId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function clearSession() {
  (await cookies()).delete(COOKIE);
}

export const toPublic = ({ passwordHash: _omit, ...u }: User): PublicUser => u;

export async function currentUser(): Promise<PublicUser | null> {
  const uid = parseToken((await cookies()).get(COOKIE)?.value);
  if (!uid) return null;
  const user = (await read()).users.find((u) => u.id === uid);
  return user ? toPublic(user) : null;
}

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

/** Para route handlers: devolve o usuário ou null, sem redirecionar. */
export async function apiUser(role?: "admin") {
  const user = await currentUser();
  if (!user) return null;
  if (role === "admin" && user.role !== "admin") return null;
  return user;
}
