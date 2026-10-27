import Link from "next/link";
import type { Settings } from "@/lib/types";
import { InstagramIcon, TikTokIcon, WhatsIcon } from "../icons";

export function Footer({ s }: { s: Settings }) {
  return (
    <footer className="relative mt-24 overflow-hidden border-t border-line">
      <div className="mx-auto grid max-w-[1320px] gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="" className="size-12 rounded-full" />
            <span className="display text-3xl">Up Games</span>
          </div>
          <p className="mt-4 max-w-[38ch] text-sm leading-relaxed text-fog">
            Loja de games do Jardim Ranieri. Jogos novos e seminovos, consoles revisados, acessórios e colecionáveis — com troca na hora.
          </p>
          <div className="mt-5 flex gap-2">
            <a href={`https://wa.me/${s.whatsapp}`} target="_blank" rel="noreferrer" className="chamfer-sm grid size-10 place-items-center bg-plate text-fog hover:text-ok" aria-label="WhatsApp">
              <WhatsIcon className="size-5" />
            </a>
            <a href={s.instagram} target="_blank" rel="noreferrer" className="chamfer-sm grid size-10 place-items-center bg-plate text-fog hover:text-chalk" aria-label="Instagram">
              <InstagramIcon className="size-5" />
            </a>
            <a href={s.tiktok} target="_blank" rel="noreferrer" className="chamfer-sm grid size-10 place-items-center bg-plate text-fog hover:text-chalk" aria-label="TikTok">
              <TikTokIcon className="size-5" />
            </a>
          </div>
        </div>
        <div>
          <h3 className="mb-3 text-sm font-semibold text-chalk">Loja</h3>
          <ul className="space-y-2 text-sm text-fog">
            <li><Link className="hover:text-chalk" href="/loja?categoria=jogos">Jogos</Link></li>
            <li><Link className="hover:text-chalk" href="/loja?categoria=consoles">Consoles</Link></li>
            <li><Link className="hover:text-chalk" href="/loja?categoria=controles">Controles</Link></li>
            <li><Link className="hover:text-chalk" href="/loja?categoria=colecionaveis">Colecionáveis</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="mb-3 text-sm font-semibold text-chalk">Sua conta</h3>
          <ul className="space-y-2 text-sm text-fog">
            <li><Link className="hover:text-chalk" href="/minha-conta">Minha conta</Link></li>
            <li><Link className="hover:text-chalk" href="/minha-conta/pedidos">Meus pedidos</Link></li>
            <li><Link className="hover:text-chalk" href="/minha-conta/favoritos">Favoritos</Link></li>
            <li><Link className="hover:text-chalk" href="/#troca">Trocar meus jogos</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="mb-3 text-sm font-semibold text-chalk">Na loja</h3>
          <p className="text-sm leading-relaxed text-fog">{s.address}</p>
          <p className="mt-2 text-sm text-fog">{s.phone}</p>
        </div>
      </div>
      <div className="border-t border-line">
        <p className="mx-auto max-w-[1320px] px-4 py-5 text-xs text-dim sm:px-6">
          © {new Date().getFullYear()} Up Games. Preços e estoque sujeitos a alteração.
        </p>
      </div>
    </footer>
  );
}
