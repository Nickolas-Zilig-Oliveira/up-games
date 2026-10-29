"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import type { Coupon } from "@/lib/types";
import { money } from "@/lib/format";
import { api } from "@/lib/client";
import { useToast } from "../providers";

export function CouponManager({ coupons }: { coupons: Coupon[] }) {
  const router = useRouter();
  const toast = useToast();
  const [form, setForm] = useState({ code: "", kind: "percent", value: "", minTotal: "", maxUses: "" });
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function create(e: React.FormEvent) {
    e.preventDefault();
    const r = await api("/api/admin/coupons", "POST", {
      code: form.code,
      kind: form.kind,
      value: Number(form.value.replace(",", ".")),
      minTotal: Number(form.minTotal.replace(",", ".")) || 0,
      maxUses: form.maxUses ? Number(form.maxUses) : undefined,
    });
    if (!r.ok) return toast(r.error, "bad");
    setForm({ code: "", kind: "percent", value: "", minTotal: "", maxUses: "" });
    toast("Cupom criado.");
    router.refresh();
  }

  async function toggle(c: Coupon) {
    const r = await api(`/api/admin/coupons/${c.id}`, "PATCH", { active: !c.active });
    if (!r.ok) return toast(r.error, "bad");
    router.refresh();
  }

  async function remove(c: Coupon) {
    const r = await api(`/api/admin/coupons/${c.id}`, "DELETE");
    if (!r.ok) return toast(r.error, "bad");
    toast(`Cupom ${c.code} excluído.`);
    router.refresh();
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
      <ul className="space-y-2">
        {coupons.length === 0 && <li className="chamfer-sm bg-deep p-5 text-sm text-fog">Nenhum cupom ainda. Crie o primeiro ao lado.</li>}
        {coupons.map((c) => (
          <li key={c.id} className={`chamfer-sm flex flex-wrap items-center gap-x-5 gap-y-2 bg-deep p-4 ${c.active ? "" : "opacity-60"}`}>
            <span className="display text-3xl tracking-wide text-gold">{c.code}</span>
            <span className="text-sm">
              <b>{c.kind === "percent" ? `${c.value}% off` : `${money(c.value)} off`}</b>
              <span className="block text-fog">{c.minTotal ? `acima de ${money(c.minTotal)}` : "sem valor mínimo"}</span>
            </span>
            <span className="tabular text-sm text-fog">
              {c.uses} {c.uses === 1 ? "uso" : "usos"}
              {c.maxUses ? ` de ${c.maxUses}` : ""}
            </span>
            <label className="ml-auto flex cursor-pointer items-center gap-2 text-sm">
              <input type="checkbox" checked={c.active} onChange={() => toggle(c)} className="size-4 accent-[var(--color-ember)]" />
              Ativo
            </label>
            <button onClick={() => remove(c)} className="grid size-10 place-items-center text-fog hover:text-bad" aria-label={`Excluir ${c.code}`}>
              <Trash2 className="size-4" />
            </button>
          </li>
        ))}
      </ul>
      <form onSubmit={create} className="chamfer-sm h-fit space-y-4 bg-deep p-5">
        <h2 className="font-semibold">Novo cupom</h2>
        <div>
          <label className="label" htmlFor="cp-code">Código</label>
          <input id="cp-code" className="field uppercase" value={form.code} onChange={set("code")} placeholder="Ex.: BLACKUP" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label" htmlFor="cp-kind">Tipo</label>
            <select id="cp-kind" className="field" value={form.kind} onChange={set("kind")}>
              <option value="percent">Porcentagem</option>
              <option value="fixed">Valor fixo</option>
            </select>
          </div>
          <div>
            <label className="label" htmlFor="cp-val">{form.kind === "percent" ? "Desconto (%)" : "Desconto (R$)"}</label>
            <input id="cp-val" className="field tabular" inputMode="decimal" value={form.value} onChange={set("value")} />
          </div>
          <div>
            <label className="label" htmlFor="cp-min">Compra mínima (R$)</label>
            <input id="cp-min" className="field tabular" inputMode="decimal" value={form.minTotal} onChange={set("minTotal")} placeholder="0" />
          </div>
          <div>
            <label className="label" htmlFor="cp-max">Limite de usos</label>
            <input id="cp-max" className="field tabular" inputMode="numeric" value={form.maxUses} onChange={set("maxUses")} placeholder="Ilimitado" />
          </div>
        </div>
        <button className="btn btn-ember w-full"><Plus className="size-4" /> Criar cupom</button>
      </form>
    </div>
  );
}
