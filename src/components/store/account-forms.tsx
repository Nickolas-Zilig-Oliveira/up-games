"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import type { Address } from "@/lib/types";
import { useToast } from "../providers";

async function send(url: string, method: string, body?: unknown) {
  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, data };
}

export function ProfileForm({ name, phone, email }: { name: string; phone: string; email: string }) {
  const toast = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  return (
    <form
      className="space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        setLoading(true);
        const f = Object.fromEntries(new FormData(e.currentTarget));
        const r = await send("/api/account", "PATCH", f);
        setLoading(false);
        if (!r.ok) return toast(r.data.error, "bad");
        toast("Dados salvos.");
        router.refresh();
      }}
    >
      <div>
        <label className="label">E-mail</label>
        <input className="field opacity-60" value={email} disabled />
      </div>
      <div>
        <label className="label" htmlFor="pf-name">Nome</label>
        <input id="pf-name" name="name" className="field" defaultValue={name} />
      </div>
      <div>
        <label className="label" htmlFor="pf-phone">WhatsApp</label>
        <input id="pf-phone" name="phone" className="field" defaultValue={phone} />
      </div>
      <button className="btn btn-ember" disabled={loading}>{loading ? "Salvando…" : "Salvar dados"}</button>
    </form>
  );
}

export function PasswordForm() {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  return (
    <form
      className="space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        const form = e.currentTarget;
        setLoading(true);
        const f = Object.fromEntries(new FormData(form));
        const r = await send("/api/account", "PATCH", f);
        setLoading(false);
        if (!r.ok) return toast(r.data.error, "bad");
        form.reset();
        toast("Senha alterada.");
      }}
    >
      <div>
        <label className="label" htmlFor="pw-cur">Senha atual</label>
        <input id="pw-cur" name="currentPassword" type="password" className="field" autoComplete="current-password" required />
      </div>
      <div>
        <label className="label" htmlFor="pw-new">Nova senha</label>
        <input id="pw-new" name="newPassword" type="password" className="field" autoComplete="new-password" minLength={6} required />
      </div>
      <button className="btn btn-ghost" disabled={loading}>{loading ? "Alterando…" : "Alterar senha"}</button>
    </form>
  );
}

export function Addresses({ initial }: { initial: Address[] }) {
  const [list, setList] = useState(initial);
  const [adding, setAdding] = useState(initial.length === 0);
  const toast = useToast();

  async function lookupZip(form: HTMLFormElement, zip: string) {
    const digits = zip.replace(/\D/g, "");
    if (digits.length !== 8) return;
    try {
      const d = await (await fetch(`https://viacep.com.br/ws/${digits}/json/`)).json();
      if (d.erro) return;
      const set = (n: string, v: string) => {
        const el = form.elements.namedItem(n) as HTMLInputElement | null;
        if (el && v) el.value = v;
      };
      set("street", d.logradouro);
      set("district", d.bairro);
      set("city", d.localidade);
      set("state", d.uf);
    } catch {}
  }

  return (
    <div className="space-y-3">
      {list.map((a) => (
        <div key={a.id} className="chamfer-sm flex items-start gap-4 bg-deep p-4">
          <div className="flex-1 text-sm">
            <p className="font-semibold">{a.label}</p>
            <p className="text-fog">
              {a.street}, {a.number} {a.complement} — {a.district}, {a.city}/{a.state} · {a.zip}
            </p>
          </div>
          <button
            onClick={async () => {
              const r = await send(`/api/account/addresses?id=${a.id}`, "DELETE");
              if (r.ok) setList((l) => l.filter((x) => x.id !== a.id));
            }}
            className="text-dim hover:text-bad"
            aria-label={`Remover endereço ${a.label}`}
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      ))}
      {adding ? (
        <form
          className="chamfer-sm grid grid-cols-6 gap-3 bg-deep p-5"
          onSubmit={async (e) => {
            e.preventDefault();
            const form = e.currentTarget;
            const r = await send("/api/account/addresses", "POST", Object.fromEntries(new FormData(form)));
            if (!r.ok) return toast(r.data.error, "bad");
            setList((l) => [...l, r.data.address]);
            setAdding(false);
            toast("Endereço salvo.");
          }}
        >
          <div className="col-span-6"><label className="label">Nome do endereço</label><input name="label" className="field" placeholder="Casa, Trabalho…" /></div>
          <div className="col-span-2"><label className="label">CEP</label><input name="zip" className="field" inputMode="numeric" onBlur={(e) => lookupZip(e.currentTarget.form!, e.target.value)} /></div>
          <div className="col-span-4"><label className="label">Rua</label><input name="street" className="field" /></div>
          <div className="col-span-2"><label className="label">Número</label><input name="number" className="field" /></div>
          <div className="col-span-4"><label className="label">Complemento</label><input name="complement" className="field" /></div>
          <div className="col-span-3"><label className="label">Bairro</label><input name="district" className="field" /></div>
          <div className="col-span-2"><label className="label">Cidade</label><input name="city" className="field" defaultValue="São Paulo" /></div>
          <div className="col-span-1"><label className="label">UF</label><input name="state" className="field" defaultValue="SP" maxLength={2} /></div>
          <div className="col-span-6 flex gap-2">
            <button className="btn btn-ember btn-sm">Salvar endereço</button>
            {list.length > 0 && <button type="button" onClick={() => setAdding(false)} className="btn btn-ghost btn-sm">Cancelar</button>}
          </div>
        </form>
      ) : (
        <button onClick={() => setAdding(true)} className="btn btn-ghost btn-sm">
          <Plus className="size-4" /> Adicionar endereço
        </button>
      )}
    </div>
  );
}
