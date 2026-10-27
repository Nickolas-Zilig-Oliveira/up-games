import { requireUser } from "@/lib/auth";
import { read } from "@/lib/db";
import { money } from "@/lib/format";
import { AccountNav } from "@/components/store/account-nav";
import { LogoutButton } from "@/components/store/logout-button";

const XP_PER_LEVEL = 250;

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const db = await read(["orders"]);
  const spent = db.orders
    .filter((o) => o.userId === user.id && o.status !== "cancelado")
    .reduce((s, o) => s + o.total, 0);
  const level = Math.floor(spent / XP_PER_LEVEL) + 1;
  const xp = (spent % XP_PER_LEVEL) / XP_PER_LEVEL;

  return (
    <div className="mx-auto max-w-[1180px] px-4 pb-10 pt-8 sm:px-6">
      <div className="chamfer relative overflow-hidden bg-gradient-to-br from-plate to-deep p-6 sm:p-8" style={{ "--cut": "22px" } as React.CSSProperties}>
        <div className="absolute -right-10 -top-20 size-72 rounded-full bg-violet/25 blur-3xl" />
        <div className="relative flex flex-wrap items-center gap-6">
          <div className="chamfer grid size-20 place-items-center bg-ember text-void">
            <span className="display text-5xl">{user.name.charAt(0)}</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm text-fog">Olá,</p>
            <h1 className="display truncate text-5xl sm:text-6xl">{user.name}</h1>
          </div>
          <div className="w-full sm:w-64">
            <div className="flex items-baseline justify-between text-sm">
              <span className="font-bold text-gold">Nível {level}</span>
              <span className="tabular text-fog">{money(spent % XP_PER_LEVEL)} / {money(XP_PER_LEVEL)}</span>
            </div>
            <div className="mt-2 flex gap-[3px]">
              {Array.from({ length: 12 }).map((_, k) => (
                <span key={k} className="h-2.5 flex-1 -skew-x-[20deg]" style={{ background: k < Math.round(xp * 12) ? "var(--color-gold)" : "rgb(255 255 255 / 0.08)" }} />
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-b border-line">
        <AccountNav />
        <LogoutButton />
      </div>
      <div className="pt-8">{children}</div>
    </div>
  );
}
