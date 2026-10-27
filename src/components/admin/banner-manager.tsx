"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, ImagePlus, Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
import type { Banner } from "@/lib/types";
import { api } from "@/lib/client";
import { useToast } from "../providers";
import { BannerSlide } from "../store/banner-slide";

type Draft = { id?: string; title: string; subtitle: string; buttonLabel: string; link: string; image: string; active: boolean };
const empty: Draft = { title: "", subtitle: "", buttonLabel: "Ver agora", link: "/loja", image: "", active: true };

const quickLinks = [
  ["/loja", "Toda a loja"],
  ["/loja?categoria=jogos", "Jogos"],
  ["/loja?categoria=consoles", "Consoles"],
  ["/#troca", "Troca de jogos"],
  ["/#visite", "Onde estamos"],
];

export function BannerManager({ banners }: { banners: Banner[] }) {
  const router = useRouter();
  const toast = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  async function upload(files: FileList) {
    setUploading(true);
    const body = new FormData();
    body.append("files", files[0]);
    const res = await fetch("/api/upload", { method: "POST", body });
    const data = await res.json();
    setUploading(false);
    if (!res.ok) return toast(data.error, "bad");
    setDraft((d) => d && { ...d, image: data.urls[0] });
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!draft) return;
    setSaving(true);
    const payload = { title: draft.title, subtitle: draft.subtitle, buttonLabel: draft.buttonLabel, link: draft.link, image: draft.image || null, active: draft.active };
    const r = draft.id ? await api(`/api/admin/banners/${draft.id}`, "PATCH", payload) : await api("/api/admin/banners", "POST", payload);
    setSaving(false);
    if (!r.ok) return toast(r.error, "bad");
    toast(draft.id ? "Banner salvo." : "Banner criado.");
    setDraft(null);
    router.refresh();
  }

  async function move(i: number, dir: -1 | 1) {
    const a = banners[i];
    const b = banners[i + dir];
    if (!b) return;
    const [r1, r2] = await Promise.all([
      api(`/api/admin/banners/${a.id}`, "PATCH", { position: b.position }),
      api(`/api/admin/banners/${b.id}`, "PATCH", { position: a.position }),
    ]);
    if (!r1.ok || !r2.ok) return toast("Não foi possível mudar a ordem.", "bad");
    router.refresh();
  }

  async function toggle(b: Banner) {
    const r = await api(`/api/admin/banners/${b.id}`, "PATCH", { active: !b.active });
    if (!r.ok) return toast(r.error, "bad");
    router.refresh();
  }

  async function remove(id: string) {
    const r = await api(`/api/admin/banners/${id}`, "DELETE");
    if (!r.ok) return toast(r.error, "bad");
    toast("Banner excluído.");
    setConfirmDelete(null);
    router.refresh();
  }

  const set = (k: keyof Draft) => (e: React.ChangeEvent<HTMLInputElement>) => setDraft((d) => d && { ...d, [k]: e.target.value });

  return (
    <div className="space-y-4">
      {!draft && (
        <button onClick={() => setDraft(empty)} className="btn btn-ember">
          <Plus className="size-4" /> Novo banner
        </button>
      )}

      {draft && (
        <form onSubmit={save} className="chamfer-sm space-y-5 bg-deep p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">{draft.id ? "Editar banner" : "Novo banner"}</h2>
            <button type="button" onClick={() => setDraft(null)} className="text-fog hover:text-chalk" aria-label="Fechar"><X className="size-5" /></button>
          </div>

          <div className="overflow-hidden">
            <p className="label">Como vai aparecer</p>
            <BannerSlide title={draft.title || "Título do banner"} subtitle={draft.subtitle} buttonLabel={draft.buttonLabel} link={draft.link || "/"} image={draft.image || undefined} asLink={false} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="label" htmlFor="b-title">Título</label>
              <input id="b-title" className="field" value={draft.title} onChange={set("title")} placeholder="Ex.: Lançamentos da semana" required />
            </div>
            <div className="sm:col-span-2">
              <label className="label" htmlFor="b-sub">Frase de apoio (opcional)</label>
              <input id="b-sub" className="field" value={draft.subtitle} onChange={set("subtitle")} placeholder="Ex.: Jogos novos e seminovos a partir de R$ 29,90" />
            </div>
            <div>
              <label className="label" htmlFor="b-btn">Texto do botão</label>
              <input id="b-btn" className="field" value={draft.buttonLabel} onChange={set("buttonLabel")} />
            </div>
            <div>
              <label className="label" htmlFor="b-link">Para onde o botão leva</label>
              <input id="b-link" className="field" value={draft.link} onChange={set("link")} />
              <div className="mt-2 flex flex-wrap gap-1.5">
                {quickLinks.map(([v, l]) => (
                  <button key={v} type="button" onClick={() => setDraft((d) => d && { ...d, link: v })} className={`chamfer-sm px-2.5 py-1 text-xs font-semibold ${draft.link === v ? "bg-ember text-void" : "bg-plate text-fog hover:text-chalk"}`}>
                    {l}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <span className="label">Foto de fundo (opcional)</span>
            <div className="flex flex-wrap items-center gap-3">
              <button type="button" onClick={() => fileRef.current?.click()} className="btn btn-ghost btn-sm">
                {uploading ? <Loader2 className="size-4 animate-spin" /> : <ImagePlus className="size-4" />}
                {draft.image ? "Trocar foto" : "Enviar foto"}
              </button>
              {draft.image && (
                <button type="button" onClick={() => setDraft((d) => d && { ...d, image: "" })} className="text-sm text-fog hover:text-bad">
                  Remover foto
                </button>
              )}
              <span className="text-xs text-dim">Use uma imagem larga (ex.: 1600×600). Sem foto, o banner usa um degradê.</span>
            </div>
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => { if (e.target.files?.length) upload(e.target.files); e.target.value = ""; }} />
          </div>

          <label className="flex cursor-pointer items-center gap-3 text-sm">
            <input type="checkbox" className="size-5 accent-[var(--color-ember)]" checked={draft.active} onChange={(e) => setDraft((d) => d && { ...d, active: e.target.checked })} />
            Mostrar este banner na página inicial
          </label>

          <div className="flex gap-2">
            <button className="btn btn-ember" disabled={saving || uploading}>{saving ? "Salvando…" : draft.id ? "Salvar banner" : "Criar banner"}</button>
            <button type="button" onClick={() => setDraft(null)} className="btn btn-ghost">Cancelar</button>
          </div>
        </form>
      )}

      {banners.length === 0 && !draft && (
        <div className="chamfer-sm bg-deep px-6 py-14 text-center">
          <p className="display text-3xl">Nenhum banner</p>
          <p className="mx-auto mt-2 max-w-[48ch] text-sm text-fog">Crie o primeiro para aparecer no topo da página inicial, com troca automática entre eles.</p>
        </div>
      )}

      <ul className="space-y-2">
        {banners.map((b, i) => (
          <li key={b.id} className={`chamfer-sm flex flex-wrap items-center gap-4 bg-deep p-3 ${b.active ? "" : "opacity-60"}`}>
            <div className="chamfer-sm relative h-20 w-36 shrink-0 overflow-hidden bg-gradient-to-br from-[#e24f00] via-[#8e2ad4] to-[#2a1d5e]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {b.image && <img src={b.image} alt="" className="h-full w-full object-cover" />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">{b.title}</p>
              <p className="truncate text-sm text-fog">{b.subtitle || "Sem frase de apoio"}</p>
              <p className="truncate text-xs text-dim">Leva para {b.link}</p>
            </div>
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input type="checkbox" checked={b.active} onChange={() => toggle(b)} className="size-4 accent-[var(--color-ember)]" />
              Ativo
            </label>
            <div className="flex items-center gap-1">
              <button onClick={() => move(i, -1)} disabled={i === 0} className="grid size-9 place-items-center text-fog hover:text-chalk disabled:opacity-30" aria-label="Subir"><ArrowUp className="size-4" /></button>
              <button onClick={() => move(i, 1)} disabled={i === banners.length - 1} className="grid size-9 place-items-center text-fog hover:text-chalk disabled:opacity-30" aria-label="Descer"><ArrowDown className="size-4" /></button>
              <button onClick={() => setDraft({ id: b.id, title: b.title, subtitle: b.subtitle, buttonLabel: b.buttonLabel, link: b.link, image: b.image ?? "", active: b.active })} className="grid size-9 place-items-center text-fog hover:text-chalk" aria-label={`Editar ${b.title}`}><Pencil className="size-4" /></button>
              {confirmDelete === b.id ? (
                <span className="flex items-center gap-1">
                  <button onClick={() => remove(b.id)} className="btn btn-sm bg-bad text-white">Excluir</button>
                  <button onClick={() => setConfirmDelete(null)} className="btn btn-ghost btn-sm">Manter</button>
                </span>
              ) : (
                <button onClick={() => setConfirmDelete(b.id)} className="grid size-9 place-items-center text-fog hover:text-bad" aria-label={`Excluir ${b.title}`}><Trash2 className="size-4" /></button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
