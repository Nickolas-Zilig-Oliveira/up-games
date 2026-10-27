"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus } from "lucide-react";
import { api } from "@/lib/client";
import { useToast } from "../providers";

/** Estoque editável direto na lista: − e + mudam de 1 em 1; digite o número para definir o total. */
export function StockStepper({ productId, stock, min }: { productId: string; stock: number; min: number }) {
  const router = useRouter();
  const toast = useToast();
  const [value, setValue] = useState(String(stock));
  const [busy, setBusy] = useState(false);
  useEffect(() => setValue(String(stock)), [stock]);

  async function send(body: { type: "entrada" | "saida" | "ajuste"; qty: number }, note: string) {
    setBusy(true);
    const r = await api<{ stock: number }>("/api/admin/stock", "POST", { productId, note, ...body });
    setBusy(false);
    if (!r.ok) {
      setValue(String(stock));
      return toast(r.error, "bad");
    }
    setValue(String(r.data.stock));
    router.refresh();
  }

  const tone = stock === 0 ? "text-bad" : stock <= min ? "text-gold" : "text-chalk";

  return (
    <div className="inline-flex items-center bg-plate" role="group" aria-label="Estoque">
      <button
        onClick={() => send({ type: "saida", qty: 1 }, "Ajuste rápido na lista")}
        disabled={busy || stock <= 0}
        className="grid size-9 place-items-center text-fog hover:text-chalk disabled:opacity-30"
        aria-label="Tirar 1 do estoque"
      >
        <Minus className="size-4" />
      </button>
      <input
        value={value}
        inputMode="numeric"
        onChange={(e) => setValue(e.target.value.replace(/\D/g, ""))}
        onBlur={() => {
          if (value !== "" && Number(value) !== stock) send({ type: "ajuste", qty: Number(value) }, "Definido na lista");
          else setValue(String(stock));
        }}
        onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
        className={`tabular h-9 w-12 bg-transparent text-center text-base font-bold outline-none focus:bg-plate-2 ${tone}`}
        aria-label="Quantidade em estoque"
      />
      <button
        onClick={() => send({ type: "entrada", qty: 1 }, "Ajuste rápido na lista")}
        disabled={busy}
        className="grid size-9 place-items-center text-fog hover:text-chalk disabled:opacity-30"
        aria-label="Adicionar 1 ao estoque"
      >
        <Plus className="size-4" />
      </button>
    </div>
  );
}
