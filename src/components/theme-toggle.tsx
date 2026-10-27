"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

type Theme = "light" | "dark";

/** Alterna entre modo claro e escuro. A escolha fica num cookie, então vale na próxima visita. */
export function ThemeToggle({ variant = "icon" }: { variant?: "icon" | "row" }) {
  const [theme, setTheme] = useState<Theme | null>(null);
  useEffect(() => setTheme(document.documentElement.dataset.theme === "dark" ? "dark" : "light"), []);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    document.cookie = `up_theme=${next}; path=/; max-age=31536000; samesite=lax`;
    setTheme(next);
  }

  const toDark = theme !== "dark";
  const Icon = toDark ? Moon : Sun;
  const label = toDark ? "Usar modo escuro" : "Usar modo claro";

  if (variant === "row") {
    return (
      <button type="button" onClick={toggle} className="chamfer-sm flex w-full items-center gap-3 bg-plate px-3.5 py-3 text-sm font-semibold">
        <Icon className="size-4 text-ember" />
        {label}
      </button>
    );
  }
  return (
    <button type="button" onClick={toggle} className="grid size-11 place-items-center text-fog transition-colors hover:text-chalk" aria-label={label} title={label}>
      <Icon className="size-5" />
    </button>
  );
}
