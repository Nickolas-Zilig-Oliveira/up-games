import "server-only";
import { read } from "./db";
import type { Category, Product } from "./types";

export type CardProduct = Product & { category: Category };

export async function catalog() {
  const db = await read();
  const cats = new Map(db.categories.map((c) => [c.id, c]));
  const fallback: Category = { id: "", name: "Outros", slug: "outros", icon: "package" };
  const products: CardProduct[] = db.products
    .filter((p) => p.active)
    .map((p) => ({ ...p, category: cats.get(p.categoryId) ?? fallback }));
  return { db, products, categories: db.categories, settings: db.settings };
}

export type SortKey = "destaques" | "menor-preco" | "maior-preco" | "novidades" | "nome";

export function filterProducts(
  products: CardProduct[],
  f: { categoria?: string; plataforma?: string; q?: string; ordem?: SortKey; condicao?: string },
) {
  let list = products;
  if (f.categoria) list = list.filter((p) => p.category.slug === f.categoria);
  if (f.plataforma) list = list.filter((p) => p.platform === f.plataforma);
  if (f.condicao) list = list.filter((p) => p.condition === f.condicao);
  if (f.q) {
    const q = f.q
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase();
    list = list.filter((p) =>
      `${p.name} ${p.platform} ${p.category.name} ${p.description}`
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .toLowerCase()
        .includes(q),
    );
  }
  const rank = { lendario: 0, epico: 1, raro: 2, comum: 3 };
  const sorted = [...list];
  switch (f.ordem) {
    case "menor-preco":
      sorted.sort((a, b) => a.price - b.price);
      break;
    case "maior-preco":
      sorted.sort((a, b) => b.price - a.price);
      break;
    case "novidades":
      sorted.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      break;
    case "nome":
      sorted.sort((a, b) => a.name.localeCompare(b.name));
      break;
    default:
      sorted.sort((a, b) => Number(b.featured) - Number(a.featured) || rank[a.rarity] - rank[b.rarity] || Number(b.stock > 0) - Number(a.stock > 0));
  }
  // Esgotados sempre por último
  return sorted.sort((a, b) => Number(b.stock > 0) - Number(a.stock > 0));
}

export function toCartLine(p: CardProduct) {
  return {
    productId: p.id,
    slug: p.slug,
    name: p.name,
    price: p.price,
    image: p.images[0],
    platform: p.platform,
    rarity: p.rarity,
    categoryIcon: p.category.icon,
    stock: p.stock,
  };
}
