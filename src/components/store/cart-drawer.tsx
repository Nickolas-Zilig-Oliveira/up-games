"use client";

import Link from "next/link";
import { useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { money } from "@/lib/format";
import { useCart } from "../providers";
import { ProductArt } from "../product-art";

export function CartDrawer({ freeShippingOver }: { freeShippingOver: number }) {
  const { lines, open, setOpen, setQty, remove, subtotal, count } = useCart();
  const missing = Math.max(0, freeShippingOver - subtotal);
  const progress = Math.min(1, subtotal / freeShippingOver);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = open ? "hidden" : "";
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-[60] bg-void/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          />
          <motion.aside
            role="dialog"
            aria-label="Carrinho"
            className="fixed inset-y-0 right-0 z-[61] flex w-full max-w-[440px] flex-col border-l border-line bg-deep"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 38 }}
          >
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <h2 className="display text-3xl">Carrinho <span className="text-fog">({count})</span></h2>
              <button onClick={() => setOpen(false)} className="grid size-10 place-items-center text-fog hover:text-chalk" aria-label="Fechar carrinho">
                <X className="size-5" />
              </button>
            </div>

            {lines.length > 0 && (
              <div className="border-b border-line px-5 py-3.5">
                <p className="text-sm text-fog">
                  {missing > 0 ? (
                    <>Faltam <b className="text-chalk">{money(missing)}</b> para entrega grátis</>
                  ) : (
                    <b className="text-ok">Entrega grátis desbloqueada</b>
                  )}
                </p>
                <div className="mt-2 h-1.5 overflow-hidden bg-plate">
                  <motion.div
                    className="h-full bg-gradient-to-r from-ember to-gold"
                    initial={false}
                    animate={{ width: `${progress * 100}%` }}
                    transition={{ type: "spring", stiffness: 200, damping: 30 }}
                  />
                </div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto px-5 py-3">
              {lines.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
                  <ShoppingBag className="size-10 text-dim" />
                  <p className="max-w-[24ch] text-fog">Seu carrinho está vazio. Que tal começar pelos lançamentos?</p>
                  <Link href="/loja" onClick={() => setOpen(false)} className="btn btn-ember">
                    Ver a loja
                  </Link>
                </div>
              ) : (
                <ul className="divide-y divide-line">
                  <AnimatePresence initial={false}>
                    {lines.map((l) => (
                      <motion.li
                        key={l.productId}
                        layout
                        exit={{ opacity: 0, x: 40 }}
                        className="flex gap-4 py-4"
                      >
                        <Link href={`/produto/${l.slug}`} onClick={() => setOpen(false)} className="chamfer-sm size-20 shrink-0 overflow-hidden">
                          <ProductArt image={l.image} name={l.name} platform={l.platform} rarity={l.rarity} icon={l.categoryIcon} size="sm" />
                        </Link>
                        <div className="flex min-w-0 flex-1 flex-col">
                          <p className="line-clamp-2 text-[0.95rem] font-semibold leading-snug">{l.name}</p>
                          <p className="text-xs text-dim">{l.platform}</p>
                          <div className="mt-auto flex items-center justify-between pt-2">
                            <div className="flex items-center bg-plate">
                              <button className="grid size-8 place-items-center text-fog hover:text-chalk" onClick={() => setQty(l.productId, l.qty - 1)} aria-label="Diminuir">
                                <Minus className="size-3.5" />
                              </button>
                              <span className="tabular w-7 text-center text-sm font-bold">{l.qty}</span>
                              <button
                                className="grid size-8 place-items-center text-fog hover:text-chalk disabled:opacity-30"
                                onClick={() => setQty(l.productId, l.qty + 1)}
                                disabled={l.qty >= l.stock}
                                aria-label="Aumentar"
                              >
                                <Plus className="size-3.5" />
                              </button>
                            </div>
                            <span className="tabular font-bold">{money(l.price * l.qty)}</span>
                          </div>
                        </div>
                        <button onClick={() => remove(l.productId)} className="self-start text-dim hover:text-bad" aria-label={`Remover ${l.name}`}>
                          <Trash2 className="size-4" />
                        </button>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              )}
            </div>

            {lines.length > 0 && (
              <div className="border-t border-line px-5 py-5">
                <div className="mb-4 flex items-baseline justify-between">
                  <span className="text-fog">Subtotal</span>
                  <span className="tabular text-2xl font-bold">{money(subtotal)}</span>
                </div>
                <Link href="/checkout" onClick={() => setOpen(false)} className="btn btn-ember h-14 w-full text-base">
                  Finalizar compra
                </Link>
                <button onClick={() => setOpen(false)} className="mt-3 w-full text-center text-sm text-fog hover:text-chalk">
                  Continuar comprando
                </button>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
