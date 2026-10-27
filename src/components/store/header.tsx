"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronRight, Disc3, Gamepad2, LayoutDashboard, MapPin, Menu, Monitor, Repeat, Search, ShoppingBag, User, X } from "lucide-react";
import type { PublicUser } from "@/lib/types";
import { useCart } from "../providers";
import { WhatsIcon } from "../icons";
import { ThemeToggle } from "../theme-toggle";

const nav = [
  { href: "/loja", label: "Loja", icon: ShoppingBag, text: "Tudo o que está na prateleira" },
  { href: "/loja?categoria=jogos", label: "Jogos", icon: Disc3, text: "PS5, PS4, PS3 e Xbox" },
  { href: "/loja?categoria=consoles", label: "Consoles", icon: Monitor, text: "Revisados na loja" },
  { href: "/loja?categoria=controles", label: "Controles", icon: Gamepad2, text: "Originais e com garantia" },
  { href: "/#troca", label: "Troca", icon: Repeat, text: "Avaliamos seus jogos na hora" },
  { href: "/#visite", label: "Visite", icon: MapPin, text: "Jardim Ranieri, São Paulo" },
];

export function Header({ user, announcement, whatsapp }: { user: PublicUser | null; announcement?: string; whatsapp?: string }) {
  const { count, setOpen, bump } = useCart();
  const [menu, setMenu] = useState(false);
  const [search, setSearch] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenu(false);
    setSearch(false);
  }, [pathname]);

  return (
    <>
      {announcement && (
        <div className="relative z-40 bg-ember px-4 py-2 text-center text-[0.9rem] font-semibold text-void">{announcement}</div>
      )}
      <header
        className={`sticky top-0 z-40 transition-[background-color,border-color,backdrop-filter] duration-300 ${
          scrolled ? "border-b border-line bg-void/80 backdrop-blur-xl" : "border-b border-transparent"
        }`}
      >
        <div className="mx-auto flex h-[72px] max-w-[1320px] items-center gap-4 px-4 sm:px-6">
          <Link href="/" className="flex shrink-0 items-center gap-3" aria-label="Up Games — início">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="" className="size-11 rounded-full ring-1 ring-line-strong" />
            <span className="display hidden text-[1.6rem] sm:block">
              Up<span className="text-ember">.</span>Games
            </span>
          </Link>

          <nav className="ml-6 hidden items-center gap-1 lg:flex" aria-label="Principal">
            {nav.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className="px-3 py-2 text-[0.92rem] font-medium text-fog transition-colors hover:text-chalk"
              >
                {n.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setSearch((s) => !s)}
              className="grid size-11 place-items-center text-fog transition-colors hover:text-chalk"
              aria-label="Buscar produtos"
            >
              <Search className="size-5" />
            </button>
            <div className="hidden sm:block">
              <ThemeToggle />
            </div>
            {user?.role === "admin" && (
              <Link
                href="/admin"
                className="chamfer-sm hidden h-9 items-center gap-2 bg-violet/20 px-3 text-sm font-semibold text-chalk transition-colors hover:bg-violet/35 md:flex"
              >
                <LayoutDashboard className="size-4" /> Painel
              </Link>
            )}
            <Link
              href={user ? "/minha-conta" : "/entrar"}
              className="flex h-11 items-center gap-2 px-2 text-fog transition-colors hover:text-chalk"
              aria-label={user ? "Minha conta" : "Entrar"}
            >
              <User className="size-5" />
              <span className="hidden text-sm font-medium md:inline">{user ? user.name.split(" ")[0] : "Entrar"}</span>
            </Link>
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="chamfer-sm relative flex h-11 items-center gap-2 bg-plate px-3.5 transition-colors hover:bg-plate-2"
              aria-label={`Carrinho com ${count} itens`}
            >
              <ShoppingBag className="size-5" />
              <motion.span
                key={bump}
                initial={{ scale: bump ? 1.6 : 1 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 600, damping: 15 }}
                className="tabular min-w-4 text-sm font-bold text-gold"
              >
                {count}
              </motion.span>
            </button>
            <button
              type="button"
              onClick={() => setMenu(true)}
              className="grid size-11 place-items-center lg:hidden"
              aria-label="Abrir menu"
            >
              <Menu className="size-6" />
            </button>
          </div>
        </div>

        <AnimatePresence>
          {search && (
            <motion.form
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.2, 0.9, 0.1, 1] }}
              className="overflow-hidden border-t border-line bg-void/95"
              onSubmit={(e) => {
                e.preventDefault();
                const q = new FormData(e.currentTarget).get("q")?.toString().trim();
                router.push(q ? `/loja?q=${encodeURIComponent(q)}` : "/loja");
              }}
            >
              <div className="mx-auto flex max-w-[1320px] items-center gap-3 px-4 py-4 sm:px-6">
                <Search className="size-5 text-dim" />
                <input
                  name="q"
                  autoFocus
                  placeholder="Busque por jogo, console ou acessório"
                  className="h-11 flex-1 bg-transparent text-lg outline-none placeholder:text-dim"
                />
                <button className="btn btn-ember btn-sm">Buscar</button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </header>

      <AnimatePresence>
        {menu && (
          <>
            <motion.div
              className="fixed inset-0 z-50 bg-void/70 backdrop-blur-sm lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenu(false)}
            />
            <motion.aside
              role="dialog"
              aria-label="Menu"
              className="fixed inset-y-0 right-0 z-[51] flex w-[88%] max-w-[380px] flex-col border-l border-line bg-deep lg:hidden"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 380, damping: 38 }}
            >
              <div className="flex items-center justify-between px-5 py-4">
                <span className="display text-3xl">
                  Up<span className="text-ember">.</span>Games
                </span>
                <button onClick={() => setMenu(false)} className="grid size-10 place-items-center text-fog hover:text-chalk" aria-label="Fechar menu">
                  <X className="size-5" />
                </button>
              </div>

              <div className="px-5">
                {user ? (
                  <Link href="/minha-conta" onClick={() => setMenu(false)} className="chamfer-sm flex items-center gap-3 bg-plate p-3.5">
                    <span className="chamfer-sm grid size-11 place-items-center bg-ember text-void">
                      <span className="display text-2xl">{user.name.charAt(0)}</span>
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold">{user.name}</span>
                      <span className="block text-xs text-fog">Minha conta e pedidos</span>
                    </span>
                    <ChevronRight className="size-4 text-dim" />
                  </Link>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <Link href="/entrar" onClick={() => setMenu(false)} className="btn btn-ember">Entrar</Link>
                    <Link href="/cadastro" onClick={() => setMenu(false)} className="btn btn-ghost">Criar conta</Link>
                  </div>
                )}
                {user?.role === "admin" && (
                  <Link href="/admin" onClick={() => setMenu(false)} className="chamfer-sm mt-2 flex items-center gap-3 bg-violet/20 px-3.5 py-3 text-sm font-semibold">
                    <LayoutDashboard className="size-4 text-r-epico" /> Painel da loja
                    <ChevronRight className="ml-auto size-4 text-dim" />
                  </Link>
                )}
              </div>

              <nav className="mt-4 flex-1 overflow-y-auto px-3" aria-label="Menu principal">
                {nav.map((n, i) => (
                  <motion.div
                    key={n.href}
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 + i * 0.04, type: "spring", stiffness: 420, damping: 34 }}
                  >
                    <Link href={n.href} onClick={() => setMenu(false)} className="group flex items-center gap-4 border-b border-line/60 px-2 py-3.5 transition-colors hover:bg-plate/50">
                      <n.icon className="size-5 shrink-0 text-dim transition-colors group-hover:text-ember" />
                      <span className="min-w-0 flex-1">
                        <span className="display block text-[1.7rem] leading-none">{n.label}</span>
                        <span className="mt-1 block text-xs text-dim">{n.text}</span>
                      </span>
                      <ChevronRight className="size-4 text-dim transition-transform group-hover:translate-x-1 group-hover:text-chalk" />
                    </Link>
                  </motion.div>
                ))}
              </nav>

              <div className="px-5 pb-3 sm:hidden">
                <ThemeToggle variant="row" />
              </div>

              {whatsapp && (
                <div className="border-t border-line p-5">
                  <a
                    href={`https://wa.me/${whatsapp}?text=${encodeURIComponent("Olá, Up Games! Vim pelo site.")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn w-full bg-[#25d366] text-[#06260f]"
                  >
                    <WhatsIcon className="size-5" /> Falar no WhatsApp
                  </a>
                </div>
              )}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
