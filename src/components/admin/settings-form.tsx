"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, X } from "lucide-react";
import type { Settings } from "@/lib/types";
import { api } from "@/lib/client";
import { useToast } from "../providers";
import { Panel } from "./ui";

export function SettingsForm({
  settings,
  products,
  demoOrders,
}: {
  settings: Settings;
  products: { id: string; name: string; platform: string }[];
  demoOrders: number;
}) {
  const router = useRouter();
  const toast = useToast();
  const [s, setS] = useState(settings);
  const [platforms, setPlatforms] = useState(settings.platforms.join(", "));
  const [saving, setSaving] = useState(false);
  const [confirmDemo, setConfirmDemo] = useState(false);
  const dirty = JSON.stringify({ ...s, platforms: undefined }) !== JSON.stringify({ ...settings, platforms: undefined }) || platforms !== settings.platforms.join(", ");

  const text = (k: keyof Settings) => ({
    value: String(s[k] ?? ""),
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setS((x) => ({ ...x, [k]: e.target.value })),
  });
  const number = (k: "deliveryFee" | "freeShippingOver") => ({
    value: String(s[k]).replace(".", ","),
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => setS((x) => ({ ...x, [k]: Number(e.target.value.replace(",", ".")) || 0 })),
  });
  const byId = new Map(products.map((p) => [p.id, p]));

  async function save() {
    setSaving(true);
    const r = await api("/api/admin/settings", "PATCH", {
      ...s,
      whatsapp: s.whatsapp.replace(/\D/g, ""),
      platforms: platforms.split(",").map((p) => p.trim()).filter(Boolean),
      dropIds: s.dropIds.filter((id) => byId.has(id)),
    });
    setSaving(false);
    if (!r.ok) return toast(r.error, "bad");
    toast("Loja atualizada. As mudanças já estão no site.");
    router.refresh();
  }

  function moveDrop(i: number, dir: -1 | 1) {
    setS((x) => {
      const ids = [...x.dropIds];
      const j = i + dir;
      if (j < 0 || j >= ids.length) return x;
      [ids[i], ids[j]] = [ids[j], ids[i]];
      return { ...x, dropIds: ids };
    });
  }

  async function clearDemo() {
    const r = await api<{ removed: number }>("/api/admin/demo", "DELETE");
    if (!r.ok) return toast(r.error, "bad");
    toast(`${r.data.removed} pedidos de demonstração apagados.`);
    setConfirmDemo(false);
    router.refresh();
  }

  return (
    <div className="space-y-4 pb-24">
      <div className="grid gap-4 xl:grid-cols-2">
        <Panel title="Título da página inicial" hint="A frase grande e o texto que abrem o site." collapsible defaultOpen>
          <div className="space-y-4">
            <div>
              <label className="label" htmlFor="s-ht">Título grande</label>
              <input id="s-ht" className="field" {...text("heroTitle")} />
            </div>
            <div>
              <label className="label" htmlFor="s-hs">Texto de apoio</label>
              <textarea id="s-hs" className="field" rows={3} {...text("heroSubtitle")} />
            </div>
          </div>
        </Panel>

        <Panel title="Faixa de aviso" hint="A faixa laranja no topo, boa para divulgar um cupom." collapsible>
          <div className="space-y-4">
            <label className="flex cursor-pointer items-center gap-3 text-sm">
              <input type="checkbox" className="size-5 accent-[var(--color-ember)]" checked={s.announcementActive} onChange={(e) => setS((x) => ({ ...x, announcementActive: e.target.checked }))} />
              Mostrar a faixa laranja no topo
            </label>
            <div>
              <label className="label" htmlFor="s-an">Texto do aviso</label>
              <input id="s-an" className="field" {...text("announcement")} />
            </div>
            {s.announcementActive && s.announcement && (
              <div className="bg-ember px-4 py-2 text-center text-[0.8rem] font-semibold text-void">{s.announcement}</div>
            )}
          </div>
        </Panel>
      </div>

      <Panel title="Produtos que caem na página inicial" hint={`${s.dropIds.length} de 8 escolhidos. O primeiro aparece quando a página abre.`} collapsible>
        <p className="mb-4 text-sm text-fog">Os produtos que caem no feixe de luz da página inicial, na ordem abaixo. O primeiro aparece quando a página abre.</p>
        <ol className="space-y-1.5">
          {s.dropIds.map((id, i) => {
            const p = byId.get(id);
            if (!p) return null;
            return (
              <li key={id} className="flex items-center gap-3 bg-plate/60 px-3 py-2 text-sm">
                <span className="tabular w-5 font-bold text-ember">{i + 1}</span>
                <span className="flex-1 truncate">{p.name} <span className="text-dim">· {p.platform}</span></span>
                <button type="button" onClick={() => moveDrop(i, -1)} className="text-fog hover:text-chalk disabled:opacity-30" disabled={i === 0} aria-label="Subir"><ArrowUp className="size-4" /></button>
                <button type="button" onClick={() => moveDrop(i, 1)} className="text-fog hover:text-chalk disabled:opacity-30" disabled={i === s.dropIds.length - 1} aria-label="Descer"><ArrowDown className="size-4" /></button>
                <button type="button" onClick={() => setS((x) => ({ ...x, dropIds: x.dropIds.filter((d) => d !== id) }))} className="text-fog hover:text-bad" aria-label="Remover do drop"><X className="size-4" /></button>
              </li>
            );
          })}
        </ol>
        {s.dropIds.length < 8 && (
          <select
            className="field mt-3"
            value=""
            onChange={(e) => e.target.value && setS((x) => ({ ...x, dropIds: [...x.dropIds, e.target.value] }))}
          >
            <option value="">Adicionar produto ao drop…</option>
            {products.filter((p) => !s.dropIds.includes(p.id)).map((p) => (
              <option key={p.id} value={p.id}>{p.name} · {p.platform}</option>
            ))}
          </select>
        )}
      </Panel>

      <div className="grid gap-4 xl:grid-cols-2">
        <Panel title="Seção de troca de jogos" hint="O bloco que convida o cliente a trocar jogos usados." collapsible>
          <div className="space-y-4">
            <div>
              <label className="label" htmlFor="s-tt">Título</label>
              <input id="s-tt" className="field" {...text("tradeInTitle")} />
            </div>
            <div>
              <label className="label" htmlFor="s-tx">Texto</label>
              <textarea id="s-tx" className="field" rows={3} {...text("tradeInText")} />
            </div>
          </div>
        </Panel>

        <Panel title="Entrega e plataformas" hint="Taxa de entrega, frete grátis e lista de consoles." collapsible>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="s-df">Taxa de entrega (R$)</label>
              <input id="s-df" className="field tabular" inputMode="decimal" {...number("deliveryFee")} />
            </div>
            <div>
              <label className="label" htmlFor="s-fs">Entrega grátis acima de (R$)</label>
              <input id="s-fs" className="field tabular" inputMode="decimal" {...number("freeShippingOver")} />
            </div>
            <div className="sm:col-span-2">
              <label className="label" htmlFor="s-pl">Plataformas (separadas por vírgula)</label>
              <input id="s-pl" className="field" value={platforms} onChange={(e) => setPlatforms(e.target.value)} />
              <p className="mt-1.5 text-xs text-dim">Aparecem no cadastro de produto e na faixa “Escolha seu console”.</p>
            </div>
          </div>
        </Panel>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Panel title="Contato e redes sociais" hint="WhatsApp, endereço e links que aparecem no site." collapsible>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="s-wa">WhatsApp (só números, com 55)</label>
              <input id="s-wa" className="field tabular" {...text("whatsapp")} />
            </div>
            <div>
              <label className="label" htmlFor="s-ph">Telefone exibido</label>
              <input id="s-ph" className="field" {...text("phone")} />
            </div>
            <div className="sm:col-span-2">
              <label className="label" htmlFor="s-ad">Endereço</label>
              <input id="s-ad" className="field" {...text("address")} />
            </div>
            <div className="sm:col-span-2">
              <label className="label" htmlFor="s-mp">Link do Google Maps</label>
              <input id="s-mp" className="field" {...text("mapsUrl")} />
            </div>
            <div>
              <label className="label" htmlFor="s-ig">Instagram</label>
              <input id="s-ig" className="field" {...text("instagram")} />
            </div>
            <div>
              <label className="label" htmlFor="s-tk">TikTok</label>
              <input id="s-tk" className="field" {...text("tiktok")} />
            </div>
          </div>
        </Panel>

        <Panel title="Horário de funcionamento" hint="Os dias e horários mostrados na seção Passa na loja." collapsible>
          <ul className="space-y-2">
            {s.hours.map((h, i) => {
              const upd = (patch: Partial<typeof h>) => setS((x) => ({ ...x, hours: x.hours.map((y, k) => (k === i ? { ...y, ...patch } : y)) }));
              return (
                <li key={h.day} className="flex flex-wrap items-center gap-3 text-sm">
                  <span className="w-20 font-medium">{h.day}</span>
                  <input type="time" className="field h-9 w-[110px] text-sm disabled:opacity-40" value={h.open} disabled={h.closed} onChange={(e) => upd({ open: e.target.value })} aria-label={`Abre ${h.day}`} />
                  <span className="text-dim">às</span>
                  <input type="time" className="field h-9 w-[110px] text-sm disabled:opacity-40" value={h.close} disabled={h.closed} onChange={(e) => upd({ close: e.target.value })} aria-label={`Fecha ${h.day}`} />
                  <label className="ml-auto flex cursor-pointer items-center gap-2 text-fog">
                    <input type="checkbox" className="size-4 accent-[var(--color-ember)]" checked={!!h.closed} onChange={(e) => upd({ closed: e.target.checked })} />
                    Fechado
                  </label>
                </li>
              );
            })}
          </ul>
        </Panel>
      </div>

      <div id="demo" className="scroll-mt-6">
        <Panel title="Pedidos e clientes de exemplo" hint="Servem só para o painel não começar vazio." collapsible>
          {demoOrders === 0 ? (
            <p className="text-sm text-fog">Não há dados de demonstração. Os números do painel são só das vendas reais.</p>
          ) : confirmDemo ? (
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <span>Apagar {demoOrders} pedidos e os clientes de exemplo? Produtos e estoque continuam como estão.</span>
              <button onClick={clearDemo} className="btn btn-sm bg-bad text-white">Apagar demonstração</button>
              <button onClick={() => setConfirmDemo(false)} className="btn btn-ghost btn-sm">Manter</button>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <span className="text-fog">O painel tem {demoOrders} pedidos de exemplo para os gráficos não começarem vazios.</span>
              <button onClick={() => setConfirmDemo(true)} className="btn btn-ghost btn-sm">Apagar demonstração</button>
            </div>
          )}
        </Panel>
      </div>

      <div
        className={`fixed inset-x-0 bottom-0 z-30 border-t border-line bg-void/90 backdrop-blur-xl transition-transform duration-300 lg:left-[248px] ${dirty ? "translate-y-0" : "translate-y-full"}`}
      >
        <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-4 px-4 py-3 sm:px-8">
          <span className="text-sm text-fog">Você tem alterações não salvas.</span>
          <div className="flex gap-2">
            <button onClick={() => { setS(settings); setPlatforms(settings.platforms.join(", ")); }} className="btn btn-ghost btn-sm">Descartar</button>
            <button onClick={save} disabled={saving} className="btn btn-ember btn-sm">{saving ? "Salvando…" : "Salvar alterações"}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
