"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Heart, Minus, Plus } from "lucide-react";
import { AddToCartButton } from "../add-to-cart";
import { useToast, type CartLine } from "../providers";

export function BuyBox({ line, favorite, loggedIn }: { line: Omit<CartLine, "qty">; favorite: boolean; loggedIn: boolean }) {
  const [qty, setQty] = useState(1);
  const [fav, setFav] = useState(favorite);
  const router = useRouter();
  const toast = useToast();
  const soldOut = line.stock <= 0;

  async function toggleFav() {
    if (!loggedIn) {
      router.push(`/entrar?next=/produto/${line.slug}`);
      return;
    }
    setFav((f) => !f);
    const res = await fetch("/api/account/favorites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: line.productId }),
    });
    if (!res.ok) {
      setFav((f) => !f);
      toast("Não foi possível salvar o favorito. Tente de novo.", "bad");
    } else toast(fav ? "Removido dos favoritos." : "Salvo nos favoritos.");
  }

  return (
    <div className="mt-8 flex flex-wrap gap-3">
      {!soldOut && (
        <div className="chamfer-sm flex h-14 items-center bg-plate">
          <button className="grid size-12 place-items-center text-fog hover:text-chalk" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Diminuir quantidade">
            <Minus className="size-4" />
          </button>
          <span className="tabular w-8 text-center text-lg font-bold">{qty}</span>
          <button
            className="grid size-12 place-items-center text-fog hover:text-chalk disabled:opacity-30"
            onClick={() => setQty((q) => Math.min(line.stock, q + 1))}
            disabled={qty >= line.stock}
            aria-label="Aumentar quantidade"
          >
            <Plus className="size-4" />
          </button>
        </div>
      )}
      <AddToCartButton line={line} qty={qty} disabled={soldOut} />
      <button
        onClick={toggleFav}
        className="chamfer-sm grid size-14 place-items-center bg-plate transition-colors hover:bg-plate-2"
        aria-label={fav ? "Remover dos favoritos" : "Salvar nos favoritos"}
        aria-pressed={fav}
      >
        <motion.span key={String(fav)} initial={{ scale: 0.6 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 600, damping: 14 }}>
          <Heart className={`size-5 ${fav ? "fill-ember text-ember" : "text-fog"}`} />
        </motion.span>
      </button>
    </div>
  );
}
