"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

const options = [
  ["destaques", "Destaques"],
  ["menor-preco", "Menor preço"],
  ["maior-preco", "Maior preço"],
  ["novidades", "Novidades"],
  ["nome", "Nome (A–Z)"],
];

export function SortSelect({ value }: { value: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  return (
    <label className="flex items-center gap-3 text-sm text-fog">
      Ordenar por
      <select
        className="field h-10 w-auto min-w-[170px]"
        value={value}
        onChange={(e) => {
          const next = new URLSearchParams(sp.toString());
          if (e.target.value === "destaques") next.delete("ordem");
          else next.set("ordem", e.target.value);
          const qs = next.toString();
          router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
        }}
      >
        {options.map(([v, l]) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </select>
    </label>
  );
}
