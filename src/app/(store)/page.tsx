import Link from "next/link";
import { ArrowUpRight, MapPin, Phone, Star } from "lucide-react";
import { catalog, filterProducts } from "@/lib/queries";
import { ProductCard } from "@/components/product-card";
import { LootDrop } from "@/components/store/loot-drop";
import { DragRow } from "@/components/store/drag-row";
import { CategoryIcon, WhatsIcon } from "@/components/icons";

const reviews = [
  { text: "Ótimo atendimento, variedades em produtos e boa localização." },
  { text: "Loja super montada, preços justos. Super indico." },
  { text: "Bom atendimento, sempre tem jogos lançamentos e novidades." },
];

export default async function Home() {
  const { products, categories, settings: s } = await catalog();
  const byId = new Map(products.map((p) => [p.id, p]));
  const drop = s.dropIds
    .map((id) => byId.get(id))
    .filter((p) => !!p)
    .map((p) => ({ ...p, icon: p.category.icon }));
  const featured = filterProducts(products.filter((p) => p.featured), {}).slice(0, 10);
  // Produtos cadastrados por último ficam no fim da lista: os mais novos vêm primeiro.
  const latest = [...products].filter((p) => p.stock > 0).reverse().slice(0, 10);
  const platformCounts = s.platforms
    .map((pl) => ({ name: pl, count: products.filter((p) => p.platform === pl).length }))
    .filter((p) => p.count > 0);
  const today = new Date().getDay(); // 0 = domingo
  const todayIdx = today === 0 ? 6 : today - 1;

  return (
    <>
      {/* HERO */}
      <section className="relative mx-auto grid max-w-[1320px] items-center gap-10 px-4 pb-16 pt-8 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:pb-24 lg:pt-14">
        <div className="relative z-10">
          <div className="mb-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-fog">
            <span className="flex items-center gap-1.5">
              <Star className="size-4 fill-gold text-gold" />
              <b className="text-chalk">4,8</b> no Google, 208 avaliações
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="size-4 text-ember" /> Jardim Ranieri, SP
            </span>
          </div>
          <h1 className="display text-[clamp(3.6rem,8.4vw,8rem)] text-chalk">{s.heroTitle}</h1>
          <p className="mt-6 max-w-[52ch] text-lg leading-relaxed text-fog">{s.heroSubtitle}</p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link href="/loja" className="btn btn-ember h-14 px-7 text-base">
              Explorar a loja
            </Link>
            <Link href="#troca" className="btn btn-ghost h-14 px-7 text-base">
              Trocar meus jogos
            </Link>
          </div>
        </div>
        <LootDrop items={drop} />
      </section>

      {/* PLATAFORMAS */}
      <section className="mx-auto max-w-[1320px] px-4 sm:px-6" aria-labelledby="plataformas">
        <div className="mb-6 flex items-end justify-between gap-4">
          <h2 id="plataformas" className="display text-5xl sm:text-6xl">Escolha seu console</h2>
        </div>
        <div className="scrollbar-none -mx-4 flex gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
          {platformCounts.map((pl) => (
            <Link
              key={pl.name}
              href={`/loja?plataforma=${encodeURIComponent(pl.name)}`}
              className="group chamfer-r relative flex h-56 w-[148px] shrink-0 flex-col justify-between overflow-hidden bg-deep p-4 transition-[transform,background-color] duration-300 ease-[var(--ease-snap)] hover:-translate-y-2 hover:bg-plate"
            >
              <span className="tabular text-sm text-dim">{pl.count} {pl.count === 1 ? "item" : "itens"}</span>
              <span
                className="display self-start whitespace-nowrap text-[3.1rem] leading-[0.8] text-chalk transition-colors group-hover:text-ember"
                style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
              >
                {pl.name}
              </span>
              <span className="absolute inset-x-0 bottom-0 h-1 bg-ember opacity-0 transition-opacity group-hover:opacity-100" />
            </Link>
          ))}
        </div>
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

      {/* CATEGORIAS */}
      <section className="mx-auto mt-24 max-w-[1320px] px-4 sm:px-6" aria-label="Categorias">
        <ul className="border-t border-line">
          {categories.map((c) => {
            const count = products.filter((p) => p.categoryId === c.id).length;
            return (
              <li key={c.id} className="border-b border-line">
                <Link href={`/loja?categoria=${c.slug}`} className="group flex items-center gap-5 py-5 sm:py-6">
                  <CategoryIcon name={c.icon} className="size-7 shrink-0 text-dim transition-colors group-hover:text-ember" />
                  <span className="display text-[clamp(2.6rem,7vw,5.5rem)] transition-[color,transform] duration-300 ease-[var(--ease-snap)] group-hover:translate-x-3 group-hover:text-ember">
                    {c.name}
                  </span>
                  <span className="tabular ml-auto text-sm text-fog">{count} itens</span>
                  <ArrowUpRight className="size-6 shrink-0 text-dim transition-transform group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-chalk" />
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

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

      {/* AVALIAÇÕES */}
      <section className="mx-auto mt-24 grid max-w-[1320px] gap-10 px-4 sm:px-6 lg:grid-cols-[auto_1fr] lg:items-center">
        <div className="flex items-end gap-4">
          <span className="display text-[9rem] leading-[0.75] text-gold">4,8</span>
          <div className="pb-2">
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, k) => (
                <Star key={k} className="size-5 fill-gold text-gold" />
              ))}
            </div>
            <p className="mt-1 text-sm text-fog">208 avaliações no Google</p>
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {reviews.map((r) => (
            <blockquote key={r.text} className="border-l-2 border-ember/60 pl-4 text-[1.05rem] leading-relaxed text-chalk">
              “{r.text}”
            </blockquote>
          ))}
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
