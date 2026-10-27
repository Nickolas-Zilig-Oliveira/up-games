"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Boxes,
  ExternalLink,
  LayoutDashboard,
  Menu,
  Package,
  ReceiptText,
  Settings,
  Tags,
  Ticket,
  Users,
  X,
} from "lucide-react";
import { LogoutButton } from "../store/logout-button";

const items = [
  { href: "/admin", label: "Visão geral", icon: LayoutDashboard },
  { href: "/admin/pedidos", label: "Pedidos", icon: ReceiptText, badge: "pedidos" as const },
  { href: "/admin/produtos", label: "Produtos", icon: Package },
  { href: "/admin/estoque", label: "Estoque", icon: Boxes, badge: "estoque" as const },
  { href: "/admin/categorias", label: "Categorias", icon: Tags },
  { href: "/admin/cupons", label: "Cupons", icon: Ticket },
  { href: "/admin/clientes", label: "Clientes", icon: Users },
  { href: "/admin/loja", label: "Aparência e loja", icon: Settings },
];

export function AdminNav({ user, badges }: { user: { name: string; email: string }; badges: { pedidos: number; estoque: number } }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [path]);

  const list = (
    <nav className="flex flex-col gap-0.5" aria-label="Painel">
      {items.map((it) => {
        const on = it.href === "/admin" ? path === "/admin" : path.startsWith(it.href);
        const count = it.badge ? badges[it.badge] : 0;
        return (
          <Link
            key={it.href}
            href={it.href}
            className={`relative flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors ${
              on ? "text-chalk" : "text-fog hover:bg-deep hover:text-chalk"
            }`}
          >
            {on && (
              <motion.span
                layoutId="admin-nav"
                className="chamfer-sm absolute inset-0 bg-plate"
                transition={{ type: "spring", stiffness: 500, damping: 40 }}
              />
            )}
            <it.icon className={`relative size-4 ${on ? "text-ember" : ""}`} />
            <span className="relative">{it.label}</span>
            {count > 0 && (
              <span className={`tabular relative ml-auto px-1.5 text-xs font-bold ${it.badge === "estoque" ? "text-ember" : "text-gold"}`}>{count}</span>
            )}
          </Link>
        );
      })}
    </nav>
  );

  const brand = (
    <Link href="/admin" className="flex items-center gap-3">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo.png" alt="" className="size-10 rounded-full" />
      <div className="leading-tight">
        <p className="display text-2xl">Up Games</p>
        <p className="text-xs text-dim">Painel da loja</p>
      </div>
    </Link>
  );

  const footer = (
    <div className="space-y-3 border-t border-line pt-4">
      <Link href="/" target="_blank" className="flex items-center gap-2 text-sm text-fog hover:text-chalk">
        <ExternalLink className="size-4" /> Ver a loja
      </Link>
      <div className="text-xs">
        <p className="truncate font-semibold text-chalk">{user.name}</p>
        <p className="truncate text-dim">{user.email}</p>
      </div>
      <LogoutButton />
    </div>
  );

  return (
    <>
      <aside className="sticky top-0 hidden h-dvh flex-col gap-8 border-r border-line bg-[#110b22] px-4 py-6 lg:flex">
        {brand}
        <div className="flex-1 overflow-y-auto">{list}</div>
        {footer}
      </aside>

      <div className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-line bg-void/90 px-4 backdrop-blur-xl lg:hidden">
        {brand}
        <button onClick={() => setOpen(true)} className="grid size-11 place-items-center" aria-label="Abrir menu do painel">
          <Menu className="size-6" />
        </button>
      </div>
      <AnimatePresence>
        {open && (
          <>
            <motion.div className="fixed inset-0 z-50 bg-void/70 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} />
            <motion.aside
              className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col gap-6 bg-deep p-5 lg:hidden"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 400, damping: 40 }}
            >
              <div className="flex items-center justify-between">
                {brand}
                <button onClick={() => setOpen(false)} aria-label="Fechar menu"><X className="size-5" /></button>
              </div>
              <div className="flex-1">{list}</div>
              {footer}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
