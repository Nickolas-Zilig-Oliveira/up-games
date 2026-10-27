import type { Metadata } from "next";
import { read } from "@/lib/db";
import { PageHeader } from "@/components/admin/ui";
import { SettingsForm } from "@/components/admin/settings-form";

export const metadata: Metadata = { title: "Textos do site" };

export default async function LojaSettings() {
  const db = await read();
  return (
    <>
      <PageHeader title="Textos do site" text="Os textos, contatos e horários que os clientes veem. Abra um bloco, edite e clique em Salvar alterações." />
      <SettingsForm
        settings={db.settings}
        products={db.products.filter((p) => p.active).map((p) => ({ id: p.id, name: p.name, platform: p.platform }))}
        demoOrders={db.orders.filter((o) => o.demo).length}
      />
    </>
  );
}
