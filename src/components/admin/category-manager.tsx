"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Pencil, Plus, Trash2, X } from "lucide-react";
import type { Category } from "@/lib/types";
import { api } from "@/lib/client";
import { useToast } from "../providers";
import { CategoryIcon, categoryIcons } from "../icons";

function IconPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-1">
      {Object.keys(categoryIcons).map((k) => (
        <button
          key={k}
          type="button"
          onClick={() => onChange(k)}
          aria-pressed={value === k}
          aria-label={`Ícone ${k}`}
          className={`grid size-9 place-items-center ${value === k ? "bg-ember text-void" : "bg-plate text-fog hover:text-chalk"}`}
        >
          <CategoryIcon name={k} className="size-4" />
        </button>
      ))}
    </div>
  );
}

export function CategoryManager({ categories, counts }: { categories: Category[]; counts: Record<string, number> }) {
  const router = useRouter();
  const toast = useToast();
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("gamepad");
  const [editing, setEditing] = useState<{ id: string; name: string; icon: string } | null>(null);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    const r = await api("/api/admin/categories", "POST", { name, icon });
    if (!r.ok) return toast(r.error, "bad");
    setName("");
    toast("Categoria criada.");
    router.refresh();
  }

  async function save() {
    if (!editing) return;
    const r = await api(`/api/admin/categories/${editing.id}`, "PATCH", { name: editing.name, icon: editing.icon });
    if (!r.ok) return toast(r.error, "bad");
    setEditing(null);
    toast("Categoria salva.");
    router.refresh();
  }

  async function remove(id: string) {
    const r = await api(`/api/admin/categories/${id}`, "DELETE");
    if (!r.ok) return toast(r.error, "bad");
    toast("Categoria excluída.");
    router.refresh();
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
      <ul className="space-y-2">
        {categories.map((c) =>
          editing?.id === c.id ? (
            <li key={c.id} className="chamfer-sm space-y-3 bg-plate p-4">
              <input className="field" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} autoFocus />
              <IconPicker value={editing.icon} onChange={(v) => setEditing({ ...editing, icon: v })} />
              <div className="flex gap-2">
                <button onClick={save} className="btn btn-ember btn-sm"><Check className="size-4" /> Salvar</button>
                <button onClick={() => setEditing(null)} className="btn btn-ghost btn-sm"><X className="size-4" /> Cancelar</button>
              </div>
            </li>
          ) : (
            <li key={c.id} className="chamfer-sm flex items-center gap-4 bg-deep p-4">
              <CategoryIcon name={c.icon} className="size-5 text-ember" />
              <span className="flex-1 font-semibold">{c.name}</span>
              <span className="tabular text-sm text-fog">{counts[c.id] ?? 0} produtos</span>
              <button onClick={() => setEditing({ id: c.id, name: c.name, icon: c.icon })} className="grid size-10 place-items-center text-fog hover:text-chalk" aria-label={`Editar ${c.name}`}>
                <Pencil className="size-4" />
              </button>
              <button onClick={() => remove(c.id)} className="grid size-10 place-items-center text-fog hover:text-bad" aria-label={`Excluir ${c.name}`}>
                <Trash2 className="size-4" />
              </button>
            </li>
          ),
        )}
      </ul>
      <form onSubmit={create} className="chamfer-sm h-fit space-y-4 bg-deep p-5">
        <h2 className="font-semibold">Nova categoria</h2>
        <div>
          <label className="label" htmlFor="c-name">Nome</label>
          <input id="c-name" className="field" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex.: Cartões e gift cards" />
        </div>
        <div>
          <span className="label">Ícone</span>
          <IconPicker value={icon} onChange={setIcon} />
        </div>
        <button className="btn btn-ember w-full"><Plus className="size-4" /> Criar categoria</button>
      </form>
    </div>
  );
}
