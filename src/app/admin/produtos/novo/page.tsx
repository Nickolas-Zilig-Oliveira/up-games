import type { Metadata } from "next";
import { read } from "@/lib/db";
import { PageHeader } from "@/components/admin/ui";
import { ProductForm } from "@/components/admin/product-form";

export const metadata: Metadata = { title: "Novo produto" };

export default async function NewProduct() {
  const db = await read();
  return (
    <>
      <PageHeader title="Novo produto" text="Preencha os dados, suba as fotos e defina o estoque inicial." />
      <ProductForm categories={db.categories} platforms={db.settings.platforms} />
    </>
  );
}
