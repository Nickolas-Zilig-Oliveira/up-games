import Link from "next/link";
import { ArrowUpRight, MapPin, Phone, Star } from "lucide-react";
import { catalog, filterProducts } from "@/lib/queries";
import { ProductCard } from "@/components/product-card";
import { LootDrop } from "@/components/store/loot-drop";
import { DragRow } from "@/components/store/drag-row";
import { WhatsIcon } from "@/components/icons";

export default async function Home() {
  const { products, settings: s } = await catalog();
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

  return (
    <>
      {/* HERO */}
      <section className="relative mx-auto grid max-w-[1320px] items-center gap-6 px-4 pb-12 pt-5 sm:gap-10 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:pb-24 lg:pt-14">
        <div className="relative z-10">
          <div className="mb-4 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-fog sm:mb-6">
            <span className="flex items-center gap-1.5">
              <Star className="size-4 fill-gold text-gold" />
              <b className="text-chalk">4,8</b> no Google, 208 avaliações
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="size-4 text-ember" /> Jardim Ranieri, SP
            </span>
          </div>
          <h1 className="display text-[clamp(3.1rem,8.4vw,8rem)] text-chalk">{s.heroTitle}</h1>
          <p className="mt-4 max-w-[52ch] text-base leading-relaxed text-fog sm:mt-6 sm:text-lg">{s.heroSubtitle}</p>
          <div className="mt-6 grid grid-cols-2 gap-2 sm:mt-9 sm:flex sm:flex-wrap sm:gap-3">
            <Link href="/loja" className="btn btn-ember h-12 px-3 text-[0.95rem] sm:h-14 sm:px-7 sm:text-base">
              Explorar a loja
            </Link>
            <Link href="#troca" className="btn btn-ghost h-12 px-3 text-[0.95rem] sm:h-14 sm:px-7 sm:text-base">
              Trocar meus jogos
            </Link>
          </div>
        </div>
        <LootDrop items={drop} />
      </section>

      {/* FILEIRAS: deslizam para o lado */}
      {[
        { id: "lancamentos", title: "Lançamentos", text: "O que acabou de chegar na prateleira.", items: latest, href: "/loja?ordem=novidades" },
        { id: "destaques", title: "Em destaque", text: "A cor de cada item mostra a raridade: do comum ao lendário que some rápido.", items: featured, href: "/loja" },
      ].map((row) => (
        <section key={row.id} className="mx-auto mt-24 max-w-[1320px] px-4 sm:px-6" aria-labelledby={row.id}>
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 id={row.id} className="display text-5xl sm:text-6xl">{row.title}</h2>
              <p className="mt-2 max-w-[56ch] text-fog">{row.text}</p>
            </div>
            <Link href={row.href} className="flex items-center gap-1 text-sm font-semibold text-ember hover:text-gold">
              Ver tudo <ArrowUpRight className="size-4" />
            </Link>
          </div>
          <DragRow label={row.title}>
            {row.items.map((p) => (
              <ProductCard key={p.id} p={p} />
            ))}
          </DragRow>
        </section>
      ))}

      {/* TROCA */}
      <section id="troca" className="mx-auto mt-24 max-w-[1320px] scroll-mt-28 px-4 sm:px-6">
        <div className="chamfer relative overflow-hidden bg-gradient-to-br from-plate to-deep" style={{ "--cut": "28px" } as React.CSSProperties}>
          <div className="absolute -right-24 -top-24 size-96 rounded-full bg-ember/20 blur-3xl" />
          <div className="relative grid gap-10 p-7 sm:p-12 lg:grid-cols-[1fr_1.1fr] lg:p-16">
            <div>
              <h2 className="display text-[clamp(3rem,7vw,6rem)]">{s.tradeInTitle}</h2>
              <p className="mt-5 max-w-[46ch] text-lg leading-relaxed text-fog">{s.tradeInText}</p>
              <a
                href={`https://wa.me/${s.whatsapp}?text=${encodeURIComponent("Oi! Quero avaliar meus jogos/console para troca.")}`}
                target="_blank"
                rel="noreferrer"
                className="btn btn-ember mt-8 h-14 px-7 text-base"
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
                <li key={t} className="chamfer-sm flex gap-5 bg-void/50 p-5">
                  <span className="display text-5xl leading-none text-ember">{k + 1}</span>
                  <div>
                    <p className="font-bold">{t}</p>
                    <p className="mt-1 text-sm leading-relaxed text-fog">{d}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* VISITE */}
      <section id="visite" className="mx-auto mt-24 grid max-w-[1320px] scroll-mt-28 gap-6 px-4 sm:px-6 lg:grid-cols-[1fr_1.3fr]">
        <div>
          <h2 className="display text-5xl sm:text-6xl">Passa na loja</h2>
          <p className="mt-4 max-w-[40ch] text-fog">
            O espaço é todo temático, com miniaturas Marvel e DC. Retire seu pedido no mesmo dia.
          </p>
          <div className="mt-8 space-y-4">
            <p className="flex gap-3">
              <MapPin className="mt-0.5 size-5 shrink-0 text-ember" />
              <span>{s.address}</span>
            </p>
            <p className="flex gap-3">
              <Phone className="mt-0.5 size-5 shrink-0 text-ember" />
              <a href={`tel:+${s.whatsapp}`} className="hover:text-ember">{s.phone}</a>
            </p>
          </div>
          <table className="mt-8 w-full max-w-sm text-sm">
            <tbody>
              {s.hours.map((h, k) => (
                <tr key={h.day} className={`border-b border-line ${k === todayIdx ? "text-chalk" : "text-fog"}`}>
                  <td className="py-2.5 font-medium">
                    {h.day}
                    {k === todayIdx && <span className="ml-2 text-xs font-bold text-ember">hoje</span>}
                  </td>
                  <td className="tabular py-2.5 text-right">{h.closed ? "Fechado" : `${h.open} – ${h.close}`}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <a href={s.mapsUrl} target="_blank" rel="noreferrer" className="btn btn-ghost mt-8">
            Abrir rota no Google Maps <ArrowUpRight className="size-4" />
          </a>
        </div>
        <div className="chamfer min-h-[380px] overflow-hidden bg-deep" style={{ "--cut": "28px" } as React.CSSProperties}>
          <iframe
            title="Mapa da Up Games"
            src={`https://www.google.com/maps?q=${encodeURIComponent(s.address)}&output=embed`}
            className="h-full min-h-[380px] w-full grayscale invert-[0.92] hue-rotate-180 contrast-[0.9]"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </section>
    </>
  );
}
