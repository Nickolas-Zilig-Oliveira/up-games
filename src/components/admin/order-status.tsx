"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { OrderStatus } from "@/lib/types";
import { statusFlow, statusLabel } from "@/lib/format";
import { api } from "@/lib/client";
import { useToast } from "../providers";

export function OrderStatusControl({ id, status }: { id: string; status: OrderStatus }) {
  const router = useRouter();
  const toast = useToast();
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState<OrderStatus | null>(null);
  const idx = statusFlow.indexOf(status);
  const next = idx >= 0 && idx < statusFlow.length - 1 ? statusFlow[idx + 1] : null;

  async function change(s: OrderStatus) {
    setLoading(s);
    const r = await api(`/api/admin/orders/${id}`, "PATCH", { status: s, note: note || undefined });
    setLoading(null);
    if (!r.ok) return toast(r.error, "bad");
    toast(`Pedido marcado como “${statusLabel[s]}”.`);
    setNote("");
    router.refresh();
  }

  return (
    <div className="space-y-3">
      {next && (
        <button onClick={() => change(next)} disabled={!!loading} className="btn btn-ember w-full">
          {loading === next ? "Atualizando…" : `Marcar como ${statusLabel[next].toLowerCase()}`}
        </button>
      )}
      {status !== "entregue" && status !== "cancelado" && (
        <input className="field h-10 text-sm" placeholder="Recado para o histórico (opcional)" value={note} onChange={(e) => setNote(e.target.value)} />
      )}
      <details className="border-t border-line pt-3">
        <summary className="cursor-pointer text-sm text-fog hover:text-chalk">Outras opções</summary>
        <div className="mt-3 grid grid-cols-2 gap-1.5">
          {(Object.keys(statusLabel) as OrderStatus[])
            .filter((s) => s !== status && s !== next && s !== "cancelado")
            .map((s) => (
              <button key={s} onClick={() => change(s)} disabled={!!loading} className="chamfer-sm bg-plate px-2 py-2 text-xs font-semibold text-fog transition-colors hover:text-chalk">
                {statusLabel[s]}
              </button>
            ))}
        </div>
        {status !== "cancelado" && (
          <button onClick={() => change("cancelado")} disabled={!!loading} className="chamfer-sm mt-2 w-full bg-bad/10 px-2 py-2 text-xs font-semibold text-bad hover:bg-bad/20">
            Cancelar pedido (os itens voltam ao estoque)
          </button>
        )}
      </details>
    </div>
  );
}
