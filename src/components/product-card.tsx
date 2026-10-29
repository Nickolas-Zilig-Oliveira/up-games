import Link from "next/link";
import type { CardProduct } from "@/lib/queries";
import { toCartLine } from "@/lib/queries";
import { money, rarityLabel } from "@/lib/format";
import { ProductArt } from "./product-art";
import { AddToCartButton } from "./add-to-cart";

/** Card de produto no formato "slot de inventário": chanfro, gema e faixa de raridade. */
export function ProductCard({ p }: { p: CardProduct }) {
  const soldOut = p.stock <= 0;
  const discount = p.comparePrice && p.comparePrice > p.price ? Math.round((1 - p.price / p.comparePrice) * 100) : 0;

  return (
    <article data-rarity={p.rarity} className="group relative">
      <div className="chamfer edge transition-colors duration-200 group-hover:[background:color-mix(in_srgb,var(--r)_55%,transparent)]">
        <div className="chamfer relative bg-deep">
          <Link href={`/produto/${p.slug}`} className="block" aria-label={p.name}>
            <div className="relative aspect-square overflow-hidden">
              <div className="h-full w-full transition-transform duration-500 ease-[var(--ease-snap)] group-hover:scale-[1.04]">
                <ProductArt image={p.images[0]} name={p.name} platform={p.platform} rarity={p.rarity} icon={p.category.icon} />
              </div>
              <div className="slot-shine pointer-events-none absolute inset-0" />
              <span className="chamfer-sm absolute left-3 top-3 bg-plate-2 px-2.5 py-1 text-xs font-bold text-chalk">{p.platform}</span>
              {discount > 0 && (
                <span className="chamfer-sm absolute right-3 top-3 bg-ember px-2 py-1 text-[0.8rem] font-bold text-void">-{discount}%</span>
              )}
              {soldOut && (
                <div className="absolute inset-0 grid place-items-center bg-void/70 backdrop-blur-[2px]">
                  <span className="display text-3xl text-fog">Esgotado</span>
                </div>
              )}
            </div>
            <div className="h-[3px] w-full" style={{ background: "linear-gradient(90deg, transparent, var(--r), transparent)" }} />
            <div className="px-4 pb-4 pt-3">
              <p className="flex items-center gap-1.5 text-[0.7rem] font-bold uppercase tracking-wider">
                <span className="inline-block size-2 rotate-45" style={{ background: "var(--r)" }} />
                <span className="rarity-text">{rarityLabel[p.rarity]}</span>
                <span className="font-semibold text-dim">· {p.condition === "novo" ? "Novo" : "Seminovo"}</span>
              </p>
              <h3 className="mt-2 line-clamp-3 min-h-[3.9em] text-[0.95rem] font-semibold leading-[1.3] text-chalk">{p.name}</h3>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="tabular text-lg font-bold">{money(p.price)}</span>
                {discount > 0 && <span className="tabular text-xs text-dim line-through">{money(p.comparePrice!)}</span>}
              </div>
            </div>
          </Link>
          <div className="absolute bottom-3.5 right-3.5">
            <AddToCartButton line={toCartLine(p)} disabled={soldOut} compact />
          </div>
        </div>
      </div>
    </article>
  );
}
