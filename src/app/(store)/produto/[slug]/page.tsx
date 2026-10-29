import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ChevronRight, MessageCircle, ShieldCheck, Store, Truck } from "lucide-react";
import { catalog, toCartLine } from "@/lib/queries";
import { currentUser } from "@/lib/auth";
import { money, rarityLabel } from "@/lib/format";
import { ProductCard } from "@/components/product-card";
import { Gallery } from "@/components/store/gallery";
import { BuyBox } from "@/components/store/buy-box";

export async function generateMetadata({ params }: PageProps<"/produto/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const { products } = await catalog();
  const p = products.find((x) => x.slug === slug);
  return p ? { title: p.name, description: p.description } : {};
}

export default async function ProductPage({ params }: PageProps<"/produto/[slug]">) {
  const { slug } = await params;
  const [{ products, settings }, user] = await Promise.all([catalog(), currentUser()]);
  const p = products.find((x) => x.slug === slug);
  if (!p) notFound();

  const related = products
    .filter((x) => x.id !== p.id && (x.platform === p.platform || x.categoryId === p.categoryId))
    .slice(0, 4);
  const discount = p.comparePrice && p.comparePrice > p.price ? p.comparePrice - p.price : 0;
  const stockPct = Math.min(1, p.stock / 10);

  return (
    <div className="mx-auto max-w-[1320px] px-4 pb-10 pt-6 sm:px-6">
      <nav className="mb-6 flex items-center gap-1.5 text-sm text-dim" aria-label="Você está em">
        <Link href="/loja" className="hover:text-chalk">Loja</Link>
        <ChevronRight className="size-3.5" />
        <Link href={`/loja?categoria=${p.category.slug}`} className="hover:text-chalk">{p.category.name}</Link>
        <ChevronRight className="size-3.5" />
        <span className="truncate text-fog">{p.name}</span>
      </nav>

      <div data-rarity={p.rarity} className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-14">
        <Gallery images={p.images} name={p.name} platform={p.platform} rarity={p.rarity} icon={p.category.icon} />

        <div>
          <p className="flex items-center gap-2 text-sm font-bold">
            <span className="inline-block size-2.5 rotate-45" style={{ background: "var(--r)" }} />
            <span className="rarity-text">{rarityLabel[p.rarity]}</span>
            <span className="font-medium text-dim">/ {p.platform} / {p.condition === "novo" ? "Novo" : "Seminovo"}</span>
          </p>
          <h1 className="display t-section mt-3 text-balance">{p.name}</h1>

          <div className="mt-6 flex flex-wrap items-baseline gap-3">
            <span className="tabular text-4xl font-bold">{money(p.price)}</span>
            {discount > 0 && (
              <>
                <span className="tabular text-lg text-dim line-through">{money(p.comparePrice!)}</span>
                <span className="chamfer-sm bg-ember px-2 py-1 text-sm font-bold text-void">economize {money(discount)}</span>
              </>
            )}
          </div>

          <div className="mt-6 max-w-sm">
            <div className="flex justify-between text-sm">
              <span className="text-fog">Estoque</span>
              <span className={`tabular font-semibold ${p.stock <= p.minStock ? "text-ember" : "text-chalk"}`}>
                {p.stock <= 0 ? "Esgotado" : p.stock <= p.minStock ? `Últimas ${p.stock} unidades` : `${p.stock} disponíveis`}
              </span>
            </div>
            <div className="mt-2 flex gap-[3px]" aria-hidden>
              {Array.from({ length: 10 }).map((_, k) => (
                <span
                  key={k}
                  className="h-2 flex-1 -skew-x-[20deg]"
                  style={{ background: k < Math.ceil(stockPct * 10) ? "var(--r)" : "var(--color-plate)" }}
                />
              ))}
            </div>
          </div>

          <BuyBox line={toCartLine(p)} favorite={!!user?.favorites.includes(p.id)} loggedIn={!!user} />

          <ul className="mt-8 grid gap-3 text-sm sm:grid-cols-3">
            <li className="flex gap-2.5 text-fog">
              <Store className="size-5 shrink-0 text-ember" /> Retire na loja no mesmo dia
            </li>
            <li className="flex gap-2.5 text-fog">
              <Truck className="size-5 shrink-0 text-ember" /> Entrega grátis acima de {money(settings.freeShippingOver)}
            </li>
            <li className="flex gap-2.5 text-fog">
              <ShieldCheck className="size-5 shrink-0 text-ember" /> {p.condition === "novo" ? "Produto lacrado" : "Testado na loja"}
            </li>
          </ul>

          {p.description && (
            <div className="mt-10 border-t border-line pt-6">
              <h2 className="mb-3 font-semibold">Sobre o item</h2>
              <p className="max-w-[62ch] whitespace-pre-line leading-relaxed text-fog">{p.description}</p>
            </div>
          )}
          <dl className="mt-6 grid max-w-md grid-cols-2 gap-y-2 border-t border-line pt-6 text-sm">
            <dt className="text-dim">Código</dt>
            <dd className="tabular">{p.sku}</dd>
            <dt className="text-dim">Categoria</dt>
            <dd>{p.category.name}</dd>
            <dt className="text-dim">Plataforma</dt>
            <dd>{p.platform}</dd>
          </dl>
          <a
            href={`https://wa.me/${settings.whatsapp}?text=${encodeURIComponent(`Oi! Tenho uma dúvida sobre ${p.name} (${p.sku}).`)}`}
            target="_blank"
            rel="noreferrer"
            className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-ember hover:text-gold"
          >
            <MessageCircle className="size-4" /> Tirar dúvida no WhatsApp
          </a>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-24">
          <h2 className="display t-section mb-6">Combina com</h2>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {related.map((r) => (
              <ProductCard key={r.id} p={r} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
