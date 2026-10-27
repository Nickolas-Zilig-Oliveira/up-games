import type { Metadata } from "next";
import { read } from "@/lib/db";
import { PageHeader } from "@/components/admin/ui";
import { CategoryManager } from "@/components/admin/category-manager";

export const metadata: Metadata = { title: "Categorias" };

export default async function Categorias() {
  const db = await read();
  const counts = Object.fromEntries(db.categories.map((c) => [c.id, db.products.filter((p) => p.categoryId === c.id).length]));
  return (
    <>
      <PageHeader title="Categorias" text="Organizam o menu, os filtros da loja e a lista grande da página inicial." />
      <CategoryManager categories={db.categories} counts={counts} />
    </>
  );
}
