"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "../providers";

export function CancelOrderButton({ id }: { id: string }) {
  const [confirm, setConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const toast = useToast();

  async function cancel() {
    setLoading(true);
    const res = await fetch(`/api/orders/${id}/cancel`, { method: "POST" });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return toast(data.error, "bad");
    toast("Pedido cancelado.");
    router.refresh();
  }

  if (!confirm) {
    return (
      <button onClick={() => setConfirm(true)} className="text-sm text-fog underline-offset-4 hover:text-bad hover:underline">
        Cancelar pedido
      </button>
    );
  }
  return (
    <div className="chamfer-sm bg-bad/10 p-4">
      <p className="text-sm">Cancelar este pedido? Os itens voltam para a prateleira.</p>
      <div className="mt-3 flex gap-2">
        <button onClick={cancel} disabled={loading} className="btn btn-sm bg-bad text-white">
          {loading ? "Cancelando…" : "Cancelar pedido"}
        </button>
        <button onClick={() => setConfirm(false)} className="btn btn-ghost btn-sm">Manter</button>
      </div>
    </div>
  );
}
