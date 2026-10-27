"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

export function AuthForm({ mode, next }: { mode: "login" | "register"; next?: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const body = Object.fromEntries(new FormData(e.currentTarget));
    const res = await fetch(`/api/auth/${mode}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Não foi possível continuar. Tente de novo.");
      return;
    }
    const target = next && next.startsWith("/") ? next : data.user.role === "admin" ? "/admin" : "/minha-conta";
    router.push(target);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      {mode === "register" && (
        <>
          <div>
            <label className="label" htmlFor="name">Nome completo</label>
            <input id="name" name="name" className="field" autoComplete="name" required />
          </div>
          <div>
            <label className="label" htmlFor="phone">WhatsApp</label>
            <input id="phone" name="phone" className="field" autoComplete="tel" placeholder="(11) 90000-0000" />
          </div>
        </>
      )}
      <div>
        <label className="label" htmlFor="email">E-mail</label>
        <input id="email" name="email" type="email" className="field" autoComplete="email" required />
      </div>
      <div>
        <label className="label" htmlFor="password">Senha</label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={show ? "text" : "password"}
            className="field pr-12"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            required
          />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute right-0 top-0 grid size-[2.9rem] place-items-center text-dim hover:text-chalk"
            aria-label={show ? "Esconder senha" : "Mostrar senha"}
          >
            {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
        {mode === "register" && <p className="mt-1.5 text-xs text-dim">Mínimo de 6 caracteres.</p>}
      </div>
      {error && <p className="border-l-2 border-bad bg-bad/10 px-3 py-2 text-sm text-chalk" role="alert">{error}</p>}
      <button className="btn btn-ember h-14 w-full text-base" disabled={loading}>
        {loading ? "Aguarde…" : mode === "login" ? "Entrar" : "Criar conta"}
      </button>
      <p className="text-center text-sm text-fog">
        {mode === "login" ? (
          <>Ainda não tem conta? <Link href={`/cadastro${next ? `?next=${encodeURIComponent(next)}` : ""}`} className="font-semibold text-ember hover:text-gold">Criar conta</Link></>
        ) : (
          <>Já tem conta? <Link href={`/entrar${next ? `?next=${encodeURIComponent(next)}` : ""}`} className="font-semibold text-ember hover:text-gold">Entrar</Link></>
        )}
      </p>
    </form>
  );
}
