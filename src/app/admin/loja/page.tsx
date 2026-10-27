import type { Metadata } from "next";
import { read } from "@/lib/db";
import { PageHeader } from "@/components/admin/ui";
import { SettingsForm } from "@/components/admin/settings-form";

export const metadata: Metadata = { title: "Aparência e loja" };

export default async function LojaSettings() {
  const db = await read();
  return (
    <>
      <PageHeader title="Aparência e loja" text="Tudo o que aparece no site: textos do topo, aviso, drop, contato, horários e entrega." />
      <SettingsForm
        settings={db.settings}
        products={db.products.filter((p) => p.active).map((p) => ({ id: p.id, name: p.name, platform: p.platform }))}
        demoOrders={db.orders.filter((o) => o.demo).length}
      />
    </>
  );
}
