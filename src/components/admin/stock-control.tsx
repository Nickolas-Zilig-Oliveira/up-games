"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/client";
import { useToast } from "../providers";

export function StockControl({ productId }: { productId: string }) {
  const [type, setType] = useState<"entrada" | "saida" | "ajuste">("entrada");
  const [qty, setQty] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const toast = useToast();

  async function apply(e: React.FormEvent) {
    e.preventDefault();
    const n = Number(qty);
    if (!Number.isInteger(n) || n < 0 || qty === "") return toast("Digite uma quantidade inteira.", "bad");
    setLoading(true);
    const r = await api<{ stock: number }>("/api/admin/stock", "POST", { productId, type, qty: n, note: note || undefined });
    setLoading(false);
    if (!r.ok) return toast(r.error, "bad");
    toast(`Estoque atualizado: ${r.data.stock} un.`);
    setQty("");
    setNote("");
    router.refresh();
  }

  return (
    <form onSubmit={apply} className="flex flex-wrap items-center gap-2">
      <select className="field h-9 w-[118px] text-sm" value={type} onChange={(e) => setType(e.target.value as typeof type)} aria-label="Tipo">
        <option value="entrada">Entrada +</option>
        <option value="saida">Saída −</option>
        <option value="ajuste">Definir =</option>
      </select>
      <input className="field tabular h-9 w-20 text-sm" inputMode="numeric" placeholder="Qtd." value={qty} onChange={(e) => setQty(e.target.value.replace(/\D/g, ""))} aria-label="Quantidade" />
      <input className="field h-9 w-40 text-sm" placeholder="Motivo (opcional)" value={note} onChange={(e) => setNote(e.target.value)} aria-label="Motivo" />
      <button className="btn btn-ghost btn-sm" disabled={loading}>{loading ? "…" : "Aplicar"}</button>
    </form>
  );
}
