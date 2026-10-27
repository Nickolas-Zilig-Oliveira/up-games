"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";

const tabs = [
  { href: "/minha-conta/pedidos", label: "Pedidos" },
  { href: "/minha-conta/favoritos", label: "Favoritos" },
  { href: "/minha-conta/dados", label: "Meus dados" },
];

export function AccountNav() {
  const path = usePathname();
  return (
    <nav className="scrollbar-none -mb-px flex overflow-x-auto" aria-label="Minha conta">
      {tabs.map((t) => {
        const on = path.startsWith(t.href);
        return (
          <Link key={t.href} href={t.href} className={`relative whitespace-nowrap px-4 py-3.5 text-sm font-semibold transition-colors ${on ? "text-chalk" : "text-fog hover:text-chalk"}`}>
            {t.label}
            {on && <motion.span layoutId="acc-tab" className="absolute inset-x-2 bottom-0 h-[3px] bg-ember" transition={{ type: "spring", stiffness: 500, damping: 40 }} />}
          </Link>
        );
      })}
    </nav>
  );
}
