"use client";

import { useState } from "react";
import { Check, Plus, ShoppingBag } from "lucide-react";
import { useCart, useToast, type CartLine } from "./providers";

export function AddToCartButton({
  line,
  disabled,
  compact,
  qty = 1,
}: {
  line: Omit<CartLine, "qty">;
  disabled?: boolean;
  compact?: boolean;
  qty?: number;
}) {
  const { add, lines, setOpen } = useCart();
  const toast = useToast();
  const [done, setDone] = useState(false);
  const inCart = lines.find((l) => l.productId === line.productId)?.qty ?? 0;
  const maxed = inCart >= line.stock;

  function onClick(e: React.MouseEvent) {
    e.preventDefault();
    if (maxed) {
      toast(`Você já tem todo o estoque de ${line.name} no carrinho.`, "bad");
      return;
    }
    add(line, qty);
    setDone(true);
    setTimeout(() => setDone(false), 1200);
    if (!compact) setOpen(true);
    else toast(`${line.name} foi para o carrinho.`);
  }

  if (compact) {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        aria-label={`Adicionar ${line.name} ao carrinho`}
        className="chamfer-sm grid size-10 place-items-center bg-plate-2 text-chalk transition-all duration-200 hover:bg-ember hover:text-void active:scale-90 disabled:opacity-30"
      >
        {done ? <Check className="size-4" /> : <Plus className="size-4" />}
      </button>
    );
  }

  return (
    <button type="button" onClick={onClick} disabled={disabled} className="btn btn-ember h-14 flex-1 text-base">
      {done ? <Check className="size-5" /> : <ShoppingBag className="size-5" />}
      {disabled ? "Esgotado" : done ? "Adicionado" : "Adicionar ao carrinho"}
    </button>
  );
}
