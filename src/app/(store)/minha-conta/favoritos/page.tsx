import Link from "next/link";
import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { catalog } from "@/lib/queries";
import { ProductCard } from "@/components/product-card";

export const metadata: Metadata = { title: "Favoritos" };

export default async function Favorites() {
  const user = await requireUser("/minha-conta/favoritos");
  const { products } = await catalog();
  const list = products.filter((p) => user.favorites.includes(p.id));

  if (!list.length) {
    return (
      <div className="chamfer flex flex-col items-center gap-4 bg-deep px-6 py-16 text-center">
        <p className="display text-4xl">Nenhum favorito</p>
        <p className="max-w-[46ch] text-fog">Toque no coração na página de um produto para guardar aqui e acompanhar preço e estoque.</p>
        <Link href="/loja" className="btn btn-ember">Ver a loja</Link>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
      {list.map((p) => (
        <ProductCard key={p.id} p={p} />
      ))}
    </div>
  );
}
