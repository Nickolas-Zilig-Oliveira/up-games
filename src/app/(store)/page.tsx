import Link from "next/link";
import { ArrowUpRight, MapPin, Phone, Star } from "lucide-react";
import { catalog, filterProducts } from "@/lib/queries";
import { ProductCard } from "@/components/product-card";
import { LootDrop } from "@/components/store/loot-drop";
import { DragRow } from "@/components/store/drag-row";
import { WhatsIcon } from "@/components/icons";
import { BannerCarousel } from "@/components/store/banner-carousel";
import { SectionHeader } from "@/components/store/section-header";

export default async function Home() {
  const { products, settings: s, db } = await catalog();
  const banners = db.banners.filter((b) => b.active);
  const byId = new Map(products.map((p) => [p.id, p]));
  const drop = s.dropIds
    .map((id) => byId.get(id))
    .filter((p) => !!p)
    .map((p) => ({ ...p, icon: p.category.icon }));
  const featured = filterProducts(products.filter((p) => p.featured), {}).slice(0, 10);
  // Produtos cadastrados por último ficam no fim da lista: os mais novos vêm primeiro.
  const latest = [...products].filter((p) => p.stock > 0).reverse().slice(0, 10);
  const today = new Date().getDay(); // 0 = domingo
  const todayIdx = today === 0 ? 6 : today - 1;

  const rows = [
    { id: "lancamentos", title: "Lançamentos", text: "O que acabou de chegar na prateleira.", items: latest, href: "/loja?ordem=novidades" },
    { id: "destaques", title: "Em destaque", text: "A cor de cada item mostra a raridade: do comum ao lendário que some rápido.", items: featured, href: "/loja" },
  ].filter((r) => r.items.length > 0);

  return (
    <>
      {/* HERO */}
      <section className="relative mx-auto grid max-w-[1320px] items-center gap-8 px-4 pb-10 pt-6 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:gap-12 lg:pb-16 lg:pt-12">
        <div className="relative z-10">
          <div className="mb-5 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm text-fog">
            <span className="flex items-center gap-1.5">
              <Star className="size-4 fill-gold text-gold" />
              <b className="font-semibold text-chalk">4,8</b> no Google, 208 avaliações
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="size-4 text-ember" /> Jardim Ranieri, SP
            </span>
          </div>
          <h1 className="display t-hero text-balance text-chalk">{s.heroTitle}</h1>
          <p className="mt-5 max-w-[50ch] text-base leading-relaxed text-fog sm:text-lg">{s.heroSubtitle}</p>
          <div className="mt-7 grid grid-cols-2 gap-2 sm:flex sm:gap-3">
            <Link href="/loja" className="btn btn-ember h-12 px-4 sm:px-7">
              Explorar a loja
            </Link>
            <Link href="#troca" className="btn btn-ghost h-12 px-4 sm:px-7">
              Trocar meus jogos
            </Link>
          </div>
        </div>
        <LootDrop items={drop} />
      </section>

      {banners.length > 0 && (
        <section className="mx-auto max-w-[1320px] px-4 sm:px-6" aria-label="Promoções">
          <BannerCarousel banners={banners} />
        </section>
      )}

      {/* FILEIRAS: deslizam para o lado */}
      {rows.map((row) => (
        <section key={row.id} className="mx-auto mt-20 max-w-[1320px] px-4 sm:px-6 lg:mt-24" aria-labelledby={row.id}>
          <SectionHeader id={row.id} title={row.title} text={row.text} href={row.href} />
          <DragRow label={row.title}>
            {row.items.map((p) => (
              <ProductCard key={p.id} p={p} />
            ))}
          </DragRow>
        </section>
      ))}

      {/* TROCA */}
      <section id="troca" className="mx-auto mt-20 max-w-[1320px] scroll-mt-28 px-4 sm:px-6 lg:mt-24">
        <div className="chamfer relative overflow-hidden bg-gradient-to-br from-plate to-deep" style={{ "--cut": "24px" } as React.CSSProperties}>
          <div className="pointer-events-none absolute -right-24 -top-24 size-96 rounded-full bg-ember/20 blur-3xl" />
          <div className="relative grid gap-8 p-6 sm:p-10 lg:grid-cols-[1fr_1.1fr] lg:gap-12 lg:p-14">
            <div className="self-center">
              <h2 className="display t-section text-balance">{s.tradeInTitle}</h2>
              <p className="mt-4 max-w-[46ch] leading-relaxed text-fog sm:text-lg">{s.tradeInText}</p>
              <a
                href={`https://wa.me/${s.whatsapp}?text=${encodeURIComponent("Oi! Quero avaliar meus jogos/console para troca.")}`}
                target="_blank"
                rel="noreferrer"
                className="btn btn-ember mt-7 h-12 px-6"
              >
                <WhatsIcon className="size-5" /> Pedir avaliação no WhatsApp
              </a>
            </div>
            <ol className="grid gap-3 self-center">
              {[
                ["Traga ou mande foto", "Jogos, consoles e controles de PS e Xbox. Pode ser pelo WhatsApp mesmo."],
                ["A gente avalia na hora", "Testamos mídia e aparelho na sua frente e passamos o valor."],
                ["Saia com crédito ou Pix", "Use o crédito em qualquer item da loja ou receba o valor."],
              ].map(([t, d], k) => (
                <li key={t} className="chamfer-sm flex items-start gap-4 bg-void/60 p-4 sm:p-5">
                  <span className="display w-7 shrink-0 text-center text-4xl leading-none text-ember">{k + 1}</span>
                  <div>
                    <p className="font-semibold">{t}</p>
                    <p className="mt-1 text-sm leading-relaxed text-fog">{d}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* VISITE */}
      <section id="visite" className="mx-auto mt-20 max-w-[1320px] scroll-mt-28 px-4 sm:px-6 lg:mt-24">
        <div>
          <h2 className="display t-section">Passa na loja</h2>
          <p className="mt-3 max-w-[42ch] text-fog">
            O espaço é todo temático, com miniaturas Marvel e DC. Retire seu pedido no mesmo dia.
          </p>
          <div className="mt-6 space-y-3">
            <p className="flex gap-3">
              <MapPin className="mt-0.5 size-5 shrink-0 text-ember" />
              <span>{s.address}</span>
            </p>
            <p className="flex gap-3">
              <Phone className="mt-0.5 size-5 shrink-0 text-ember" />
              <a href={`tel:+${s.whatsapp}`} className="hover:text-ember">{s.phone}</a>
            </p>
          </div>
          <table className="mt-6 w-full max-w-sm text-sm">
            <caption className="sr-only">Horário de funcionamento</caption>
            <tbody>
              {s.hours.map((h, k) => (
                <tr key={h.day} className={`border-b border-line ${k === todayIdx ? "font-semibold text-chalk" : "text-fog"}`}>
                  <td className="py-2.5">
                    {h.day}
                    {k === todayIdx && <span className="ml-2 text-xs font-bold text-ember">hoje</span>}
                  </td>
                  <td className="tabular py-2.5 text-right">{h.closed ? "Fechado" : `${h.open} – ${h.close}`}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <a href={s.mapsUrl} target="_blank" rel="noreferrer" className="btn btn-ghost mt-6">
            Abrir rota no Google Maps <ArrowUpRight className="size-4" />
          </a>
        </div>
      </section>
    </>
  );
}
