import type { Metadata } from "next";
import { read } from "@/lib/db";
import { PageHeader } from "@/components/admin/ui";
import { BannerManager } from "@/components/admin/banner-manager";

export const metadata: Metadata = { title: "Banners" };

export default async function Banners() {
  const db = await read();
  return (
    <>
      <PageHeader title="Banners" text="Os cartazes grandes no topo da página inicial. Eles trocam sozinhos; a ordem aqui é a ordem no site." />
      <BannerManager banners={db.banners} />
    </>
  );
}
