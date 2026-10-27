import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { read } from "@/lib/db";
import { AdminNav } from "@/components/admin/nav";

export const metadata: Metadata = { title: { default: "Painel", template: "%s · Painel Up Games" } };
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();
  const db = await read();
  const pending = db.orders.filter((o) => o.status === "pendente" || o.status === "pago").length;

  return (
    <div className="min-h-dvh bg-void lg:grid lg:grid-cols-[248px_1fr]">
      <AdminNav user={{ name: user.name, email: user.email }} badges={{ pedidos: pending }} />
      <div className="min-w-0">
        <main className="mx-auto max-w-[1280px] px-4 pb-16 pt-6 sm:px-8 lg:pt-10">{children}</main>
      </div>
    </div>
  );
}
