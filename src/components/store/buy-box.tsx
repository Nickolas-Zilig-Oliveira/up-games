"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Heart, Minus, Plus } from "lucide-react";
import { money } from "@/lib/format";
import { AddToCartButton } from "../add-to-cart";
import { useToast, type CartLine } from "../providers";

/**
 * Compra do produto. No desktop fica no meio da página; no celular vira uma barra
 * fixa no rodapé (preço + botão), para o botão nunca ficar escondido abaixo da dobra.
 */
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

  const heart = (
    <button
      onClick={toggleFav}
      className="chamfer-sm grid size-12 shrink-0 place-items-center bg-plate transition-colors hover:bg-plate-2 lg:size-14"
      aria-label={fav ? "Remover dos favoritos" : "Salvar nos favoritos"}
      aria-pressed={fav}
    >
      <motion.span key={String(fav)} initial={{ scale: 0.6 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 600, damping: 14 }}>
        <Heart className={`size-5 ${fav ? "fill-ember text-ember" : "text-fog"}`} />
      </motion.span>
    </button>
  );

  return (
    <>
      {/* Desktop */}
      <div className="mt-8 hidden flex-wrap gap-3 lg:flex">
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
        {heart}
      </div>

      {/* Celular */}
      <div
        data-buybar
        className="fixed inset-x-0 bottom-0 z-30 flex items-center gap-3 border-t border-line bg-void/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl lg:hidden"
      >
        {heart}
        <p className="tabular shrink-0 text-xl font-bold">{money(line.price)}</p>
        <AddToCartButton line={line} qty={1} disabled={soldOut} bar />
      </div>
    </>
  );
}
