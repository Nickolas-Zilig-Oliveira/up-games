"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { LayoutDashboard, Menu, Search, ShoppingBag, User, X } from "lucide-react";
import type { PublicUser } from "@/lib/types";
import { useCart } from "../providers";

const nav = [
  { href: "/loja", label: "Loja" },
  { href: "/loja?categoria=jogos", label: "Jogos" },
  { href: "/loja?categoria=consoles", label: "Consoles" },
  { href: "/loja?categoria=controles", label: "Controles" },
  { href: "/#troca", label: "Troca" },
  { href: "/#visite", label: "Visite" },
];

export function Header({ user, announcement }: { user: PublicUser | null; announcement?: string }) {
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
        <div className="relative z-40 bg-ember px-4 py-2 text-center text-[0.8rem] font-semibold text-void">{announcement}</div>
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
          <motion.div
            className="fixed inset-0 z-50 bg-void/95 backdrop-blur-xl lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="flex h-[72px] items-center justify-between px-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="Up Games" className="size-11 rounded-full" />
              <button onClick={() => setMenu(false)} className="grid size-11 place-items-center" aria-label="Fechar menu">
                <X className="size-6" />
              </button>
            </div>
            <nav className="flex flex-col px-6 pt-6">
              {[...nav, ...(user?.role === "admin" ? [{ href: "/admin", label: "Painel admin" }] : [])].map((n, i) => (
                <motion.div
                  key={n.href}
                  initial={{ opacity: 0, x: -24 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.04 * i, type: "spring", stiffness: 400, damping: 30 }}
                >
                  <Link href={n.href} onClick={() => setMenu(false)} className="display block py-2 text-5xl text-chalk">
                    {n.label}
                  </Link>
                </motion.div>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
