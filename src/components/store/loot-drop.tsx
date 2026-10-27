"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Dices } from "lucide-react";
import type { CardProduct } from "@/lib/queries";
import { money, rarityLabel } from "@/lib/format";
import { ProductArt } from "../product-art";
import { UpStar } from "../icons";
import { AddToCartButton } from "../add-to-cart";

type DropItem = Pick<
  CardProduct,
  "id" | "slug" | "name" | "price" | "comparePrice" | "images" | "platform" | "rarity" | "condition" | "stock"
> & { icon: string };

/**
 * O "drop" do topo: um item cai num feixe de luz da cor da raridade.
 * Só anima de novo quando a pessoa pede outro drop.
 */
export function LootDrop({ items }: { items: DropItem[] }) {
  const [i, setI] = useState(0);
  const [rolls, setRolls] = useState(0);
  const reduce = useReducedMotion();
  if (!items.length) return null;
  const item = items[i % items.length];

  function roll() {
    setI((v) => (v + 1) % items.length);
    setRolls((r) => r + 1);
  }

  return (
    <div data-rarity={item.rarity} className="relative mx-auto w-full max-w-[560px] select-none">
      {/* Palco */}
      <div className="relative aspect-[1/1.02] w-full">
        <UpStar className="spin-slow absolute inset-[6%] text-plate/70" />
        <div
          className="absolute inset-[18%] rounded-full blur-3xl transition-[background] duration-700"
          style={{ background: "color-mix(in srgb, var(--r) 22%, transparent)" }}
        />
        {/* Feixe */}
        <div
          className="beam absolute left-1/2 top-0 h-[78%] w-[46%] -translate-x-1/2 transition-[background] duration-500"
          style={{
            background: "linear-gradient(180deg, transparent, color-mix(in srgb, var(--r) 38%, transparent) 55%, color-mix(in srgb, var(--r) 60%, transparent))",
            clipPath: "polygon(38% 0, 62% 0, 100% 100%, 0 100%)",
          }}
        />
        {/* Pedestal */}
        <div className="absolute bottom-[11%] left-1/2 h-[9%] w-[62%] -translate-x-1/2">
          <div className="absolute inset-0 rounded-[50%] border border-line-strong bg-deep/80" />
          <div
            className="absolute inset-x-[12%] top-[18%] h-[64%] rounded-[50%] transition-[background] duration-500"
            style={{ background: "radial-gradient(closest-side, color-mix(in srgb, var(--r) 70%, transparent), transparent)" }}
          />
        </div>

        <AnimatePresence mode="popLayout">
          <motion.div
            key={`${item.id}-${rolls}`}
            className="absolute left-1/2 top-[9%] w-[50%] -translate-x-1/2"
            initial={reduce ? { opacity: 0 } : { y: -180, opacity: 0, rotate: -8, scale: 0.86 }}
            animate={{ y: 0, opacity: 1, rotate: 0, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { y: 40, opacity: 0, scale: 0.9, transition: { duration: 0.18 } }}
            transition={{ type: "spring", stiffness: 260, damping: 18, mass: 0.9, delay: rolls ? 0.05 : 0 }}
          >
            <Link href={`/produto/${item.slug}`} className="block" aria-label={item.name}>
              <div className="chamfer p-[2px]" style={{ background: "linear-gradient(160deg, var(--r), transparent 60%)" }}>
                <div className="chamfer aspect-square overflow-hidden bg-deep">
                  <ProductArt image={item.images[0]} name={item.name} platform={item.platform} rarity={item.rarity} icon={item.icon} />
                </div>
              </div>
            </Link>
            {/* Clarão do pouso */}
            {!reduce && (
              <motion.div
                className="pointer-events-none absolute -inset-[30%] rounded-full"
                style={{ background: "radial-gradient(closest-side, color-mix(in srgb, var(--r) 65%, white 10%), transparent)" }}
                initial={{ opacity: 0, scale: 0.4 }}
                animate={{ opacity: [0, 0.9, 0], scale: [0.4, 1.1, 1.3] }}
                transition={{ duration: 0.7, delay: rolls ? 0.28 : 0.3, times: [0, 0.3, 1] }}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Ficha do item */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`card-${item.id}-${rolls}`}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6, transition: { duration: 0.12 } }}
          transition={{ type: "spring", stiffness: 380, damping: 32, delay: rolls ? 0.2 : 0.25 }}
          className="relative -mt-[9%] lg:absolute lg:-right-4 lg:bottom-[2%] lg:mt-0 lg:w-[250px]"
        >
          <div className="chamfer edge" style={{ background: "color-mix(in srgb, var(--r) 45%, transparent)" }}>
            <div className="chamfer bg-deep/95 p-4 backdrop-blur-xl">
              <p className="flex items-center gap-1.5 text-xs font-bold">
                <span className="inline-block size-2 rotate-45" style={{ background: "var(--r)" }} />
                <span className="rarity-text">{rarityLabel[item.rarity]}</span>
              </p>
              <h3 className="mt-1 text-lg font-bold leading-tight">{item.name}</h3>
              <dl className="mt-3 grid grid-cols-2 gap-y-1.5 text-sm">
                <dt className="text-dim">Plataforma</dt>
                <dd className="text-right font-medium">{item.platform}</dd>
                <dt className="text-dim">Condição</dt>
                <dd className="text-right font-medium">{item.condition === "novo" ? "Novo" : "Seminovo"}</dd>
                <dt className="text-dim">Na loja</dt>
                <dd className="tabular text-right font-medium">{item.stock > 0 ? `${item.stock} un.` : "Esgotado"}</dd>
              </dl>
              <div className="mt-3 flex items-end justify-between gap-3 border-t border-line pt-3">
                <div>
                  {item.comparePrice && item.comparePrice > item.price && (
                    <p className="tabular text-xs text-dim line-through">{money(item.comparePrice)}</p>
                  )}
                  <p className="tabular text-2xl font-bold">{money(item.price)}</p>
                </div>
                <AddToCartButton
                  compact
                  disabled={item.stock <= 0}
                  line={{
                    productId: item.id,
                    slug: item.slug,
                    name: item.name,
                    price: item.price,
                    image: item.images[0],
                    platform: item.platform,
                    rarity: item.rarity,
                    categoryIcon: item.icon,
                    stock: item.stock,
                  }}
                />
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="mt-5 flex items-center justify-center gap-4 sm:justify-start">
        <button type="button" onClick={roll} className="btn btn-ghost btn-sm group">
          <Dices className="size-4 transition-transform duration-300 group-hover:rotate-90" />
          Abrir outro drop
        </button>
        <div className="flex gap-1.5" aria-hidden>
          {items.map((it, k) => (
            <span
              key={it.id}
              className="size-1.5 rotate-45 transition-colors"
              style={{ background: k === i % items.length ? "var(--r)" : "var(--color-plate-2)" }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
