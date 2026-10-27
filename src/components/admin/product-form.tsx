"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, Reorder } from "motion/react";
import { ImagePlus, Loader2, Trash2, X } from "lucide-react";
import type { Category, Product, Rarity } from "@/lib/types";
import { money, rarityLabel } from "@/lib/format";
import { api } from "@/lib/client";
import { useToast } from "../providers";
import { ProductArt } from "../product-art";
import { Panel } from "./ui";

const rarities: Rarity[] = ["comum", "raro", "epico", "lendario"];

function num(v: string) {
  // Aceita "1.899,90" (padrão BR) e também "1899.90"
  const clean = v.trim().replace(/[^\d.,-]/g, "");
  const n = Number(clean.includes(",") ? clean.replace(/\./g, "").replace(",", ".") : clean);
  return isFinite(n) ? n : 0;
}
const fmt = (n?: number) => (n ? (Number.isInteger(n) ? String(n) : n.toFixed(2)).replace(".", ",") : "");

export function ProductForm({ categories, platforms, product }: { categories: Category[]; platforms: string[]; product?: Product }) {
  const router = useRouter();
  const toast = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [f, setF] = useState({
    name: product?.name ?? "",
    sku: product?.sku ?? "",
    description: product?.description ?? "",
    price: fmt(product?.price),
    comparePrice: fmt(product?.comparePrice),
    cost: fmt(product?.cost),
    categoryId: product?.categoryId ?? categories[0]?.id ?? "",
    platform: product?.platform ?? platforms[0] ?? "",
    condition: product?.condition ?? "novo",
    rarity: product?.rarity ?? ("comum" as Rarity),
    stock: String(product?.stock ?? 0),
    minStock: String(product?.minStock ?? 2),
    featured: product?.featured ?? false,
    active: product?.active ?? true,
  });
  const [images, setImages] = useState<string[]>(product?.images ?? []);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setF((s) => ({ ...s, [k]: e.target.value }));

  async function upload(files: FileList | File[]) {
    const list = Array.from(files).filter((x) => x.type.startsWith("image/"));
    if (!list.length) return;
    setUploading(true);
    const body = new FormData();
    list.forEach((x) => body.append("files", x));
    const res = await fetch("/api/upload", { method: "POST", body });
    const data = await res.json();
    setUploading(false);
    if (!res.ok) return toast(data.error, "bad");
    setImages((im) => [...im, ...data.urls]);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      name: f.name,
      sku: f.sku,
      description: f.description,
      price: num(f.price),
      comparePrice: num(f.comparePrice),
      cost: num(f.cost),
      categoryId: f.categoryId,
      platform: f.platform,
      condition: f.condition,
      rarity: f.rarity,
      stock: Math.max(0, Math.round(num(f.stock))),
      minStock: Math.max(0, Math.round(num(f.minStock))),
      images,
      featured: f.featured,
      active: f.active,
    };
    setSaving(true);
    const r = product ? await api(`/api/admin/products/${product.id}`, "PATCH", payload) : await api<{ product: Product }>("/api/admin/products", "POST", payload);
    setSaving(false);
    if (!r.ok) return toast(r.error, "bad");
    toast(product ? "Produto salvo." : "Produto cadastrado.");
    if (!product) router.push(`/admin/produtos/${(r.data as { product: Product }).product.id}`);
    router.refresh();
  }

  async function remove() {
    const r = await api<{ archived: boolean }>(`/api/admin/products/${product!.id}`, "DELETE");
    if (!r.ok) return toast(r.error, "bad");
    toast(r.data.archived ? "O produto tem vendas, então foi ocultado da loja em vez de excluído." : "Produto excluído.");
    router.push("/admin/produtos");
    router.refresh();
  }

  const cat = categories.find((c) => c.id === f.categoryId);

  return (
    <form onSubmit={save} className="grid gap-4 xl:grid-cols-[1fr_360px]">
      <div className="space-y-4">
        <Panel title="Informações">
          <div className="grid gap-4 sm:grid-cols-6">
            <div className="sm:col-span-4">
              <label className="label" htmlFor="p-name">Nome</label>
              <input id="p-name" className="field" value={f.name} onChange={set("name")} placeholder="Ex.: God of War Ragnarök" required />
            </div>
            <div className="sm:col-span-2">
              <label className="label" htmlFor="p-sku">Código (SKU)</label>
              <input id="p-sku" className="field" value={f.sku} onChange={set("sku")} placeholder="Gerado se vazio" />
            </div>
            <div className="sm:col-span-6">
              <label className="label" htmlFor="p-desc">Descrição</label>
              <textarea id="p-desc" className="field" rows={4} value={f.description} onChange={set("description")} placeholder="O que vem na caixa, estado do produto, garantia…" />
            </div>
            <div className="sm:col-span-2">
              <label className="label" htmlFor="p-cat">Categoria</label>
              <select id="p-cat" className="field" value={f.categoryId} onChange={set("categoryId")}>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="label" htmlFor="p-plat">Plataforma</label>
              <select id="p-plat" className="field" value={f.platform} onChange={set("platform")}>
                {platforms.map((p) => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="label" htmlFor="p-cond">Condição</label>
              <select id="p-cond" className="field" value={f.condition} onChange={set("condition")}>
                <option value="novo">Novo</option>
                <option value="seminovo">Seminovo</option>
              </select>
            </div>
          </div>
        </Panel>

        <Panel title="Preço e estoque">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="label" htmlFor="p-price">Preço de venda (R$)</label>
              <input id="p-price" className="field tabular" inputMode="decimal" value={f.price} onChange={set("price")} placeholder="199,90" required />
            </div>
            <div>
              <label className="label" htmlFor="p-cmp">Preço "de" (riscado)</label>
              <input id="p-cmp" className="field tabular" inputMode="decimal" value={f.comparePrice} onChange={set("comparePrice")} placeholder="Opcional" />
            </div>
            <div>
              <label className="label" htmlFor="p-cost">Custo (R$)</label>
              <input id="p-cost" className="field tabular" inputMode="decimal" value={f.cost} onChange={set("cost")} placeholder="Para o lucro no painel" />
            </div>
            <div>
              <label className="label" htmlFor="p-stock">{product ? "Estoque atual" : "Estoque inicial"}</label>
              <input id="p-stock" className="field tabular" inputMode="numeric" value={f.stock} onChange={set("stock")} />
            </div>
            <div>
              <label className="label" htmlFor="p-min">Alertar quando chegar em</label>
              <input id="p-min" className="field tabular" inputMode="numeric" value={f.minStock} onChange={set("minStock")} />
            </div>
            {num(f.price) > 0 && num(f.cost) > 0 && (
              <div className="self-end pb-3 text-sm text-fog">
                Margem: <b className="tabular text-chalk">{Math.round((1 - num(f.cost) / num(f.price)) * 100)}%</b>
              </div>
            )}
          </div>
          {product && <p className="mt-3 text-xs text-dim">Mudar o estoque aqui registra um ajuste no histórico. Para entradas de mercadoria, use a tela Estoque.</p>}
        </Panel>

        <Panel title="Fotos" action={<span className="text-xs text-dim">Arraste para reordenar · a primeira é a capa</span>}>
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              if (e.dataTransfer.files.length) upload(e.dataTransfer.files);
            }}
            className={`border-2 border-dashed p-4 transition-colors ${dragOver ? "border-ember bg-ember/5" : "border-line"}`}
          >
            <Reorder.Group axis="x" values={images} onReorder={setImages} className="flex flex-wrap gap-3">
              <AnimatePresence initial={false}>
                {images.map((src, k) => (
                  <Reorder.Item
                    key={src}
                    value={src}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="group relative size-28 cursor-grab overflow-hidden bg-plate active:cursor-grabbing"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt="" className="pointer-events-none h-full w-full object-cover" />
                    {k === 0 && <span className="absolute left-1 top-1 bg-ember px-1.5 text-[10px] font-bold text-void">Capa</span>}
                    <button
                      type="button"
                      onClick={() => setImages((im) => im.filter((x) => x !== src))}
                      className="absolute right-1 top-1 grid size-7 place-items-center bg-void/80 text-chalk opacity-0 transition-opacity hover:text-bad group-hover:opacity-100 focus:opacity-100"
                      aria-label="Remover foto"
                    >
                      <X className="size-4" />
                    </button>
                  </Reorder.Item>
                ))}
              </AnimatePresence>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="grid size-28 place-items-center bg-plate text-fog transition-colors hover:bg-plate-2 hover:text-chalk"
              >
                {uploading ? (
                  <Loader2 className="size-6 animate-spin" />
                ) : (
                  <span className="flex flex-col items-center gap-1.5 text-xs font-semibold">
                    <ImagePlus className="size-6" /> Adicionar
                  </span>
                )}
              </button>
            </Reorder.Group>
            <p className="mt-3 text-xs text-dim">Solte as imagens aqui ou clique em Adicionar. JPG, PNG ou WEBP de até 6 MB. Sem foto, a loja mostra uma arte com a cor da raridade.</p>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              hidden
              onChange={(e) => {
                if (e.target.files) upload(e.target.files);
                e.target.value = "";
              }}
            />
          </div>
        </Panel>
      </div>

      <div className="space-y-4 xl:sticky xl:top-6 xl:self-start">
        <Panel title="Prévia na loja">
          <div data-rarity={f.rarity} className="chamfer edge" style={{ background: "color-mix(in srgb, var(--r) 50%, transparent)" }}>
            <div className="chamfer bg-deep">
              <div className="aspect-[4/3] overflow-hidden">
                <ProductArt image={images[0]} name={f.name || "Produto"} platform={f.platform} rarity={f.rarity} icon={cat?.icon ?? "package"} />
              </div>
              <div className="h-[3px]" style={{ background: "linear-gradient(90deg, transparent, var(--r), transparent)" }} />
              <div className="p-4">
                <p className="rarity-text text-xs font-semibold">{rarityLabel[f.rarity]}</p>
                <p className="mt-1 font-semibold">{f.name || "Nome do produto"}</p>
                <p className="tabular mt-1 text-lg font-bold">{money(num(f.price))}</p>
              </div>
            </div>
          </div>
        </Panel>

        <Panel title="Raridade">
          <div className="grid grid-cols-2 gap-2">
            {rarities.map((r) => (
              <button
                key={r}
                type="button"
                data-rarity={r}
                onClick={() => setF((s) => ({ ...s, rarity: r }))}
                aria-pressed={f.rarity === r}
                className={`chamfer-sm flex items-center gap-2 px-3 py-2.5 text-sm font-semibold transition-colors ${f.rarity === r ? "bg-plate-2 ring-1 ring-inset ring-[var(--r)]" : "bg-plate/50 text-fog hover:bg-plate"}`}
              >
                <span className="size-2 rotate-45" style={{ background: "var(--r)" }} />
                {rarityLabel[r]}
              </button>
            ))}
          </div>
          <p className="mt-3 text-xs text-dim">Define a cor do item na loja. Use lendário para os mais desejados.</p>
        </Panel>

        <Panel title="Visibilidade">
          <label className="flex cursor-pointer items-center justify-between gap-3 py-1.5 text-sm">
            Mostrar na loja
            <input type="checkbox" className="size-5 accent-[var(--color-ember)]" checked={f.active} onChange={(e) => setF((s) => ({ ...s, active: e.target.checked }))} />
          </label>
          <label className="flex cursor-pointer items-center justify-between gap-3 py-1.5 text-sm">
            Destacar na página inicial
            <input type="checkbox" className="size-5 accent-[var(--color-ember)]" checked={f.featured} onChange={(e) => setF((s) => ({ ...s, featured: e.target.checked }))} />
          </label>
        </Panel>

        <button className="btn btn-ember h-14 w-full text-base" disabled={saving || uploading}>
          {saving ? "Salvando…" : product ? "Salvar alterações" : "Cadastrar produto"}
        </button>

        {product && (
          <AnimatePresence mode="wait" initial={false}>
            {confirmDelete ? (
              <motion.div key="c" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="chamfer-sm bg-bad/10 p-4 text-sm">
                <p>Excluir {product.name}? Se já tiver vendas, ele só será ocultado.</p>
                <div className="mt-3 flex gap-2">
                  <button type="button" onClick={remove} className="btn btn-sm bg-bad text-white">Excluir produto</button>
                  <button type="button" onClick={() => setConfirmDelete(false)} className="btn btn-ghost btn-sm">Manter</button>
                </div>
              </motion.div>
            ) : (
              <motion.button key="b" type="button" onClick={() => setConfirmDelete(true)} className="flex w-full items-center justify-center gap-2 py-2 text-sm text-fog hover:text-bad">
                <Trash2 className="size-4" /> Excluir produto
              </motion.button>
            )}
          </AnimatePresence>
        )}
      </div>
    </form>
  );
}
