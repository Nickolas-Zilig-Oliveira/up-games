import "server-only";
import { createClient } from "./supabase/server";
import type {
  Address,
  Banner,
  Category,
  Coupon,
  Database,
  Order,
  OrderItem,
  Product,
  PublicUser,
  Settings,
  StockMovement,
} from "./types";

/*
 * Leitura dos dados no Supabase. Cada pessoa só recebe o que as regras de segurança
 * (RLS) do banco deixam: visitante vê o catálogo; cliente vê os próprios pedidos;
 * admin vê tudo. As escritas ficam nas rotas /api e nas funções SQL do banco.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
type Row = Record<string, any>;
const num = (v: unknown) => (v === null || v === undefined ? undefined : Number(v));

export const mapCategory = (r: Row): Category => ({ id: r.id, name: r.name, slug: r.slug, icon: r.icon });

export const mapProduct = (r: Row): Product => ({
  id: r.id,
  slug: r.slug,
  sku: r.sku,
  name: r.name,
  description: r.description,
  price: Number(r.price),
  comparePrice: num(r.compare_price),
  cost: num(r.cost),
  categoryId: r.category_id,
  platform: r.platform,
  condition: r.condition,
  rarity: r.rarity,
  stock: r.stock,
  minStock: r.min_stock,
  images: r.images ?? [],
  featured: r.featured,
  active: r.active,
  createdAt: r.created_at,
});

const mapItem = (r: Row): OrderItem => ({
  productId: r.product_id ?? "",
  name: r.name,
  price: Number(r.price),
  qty: r.qty,
  image: r.image ?? undefined,
  platform: r.platform ?? "",
});

export const mapOrder = (r: Row): Order => ({
  id: r.id,
  number: Number(r.number),
  userId: r.user_id ?? "",
  customer: r.customer,
  items: (r.order_items ?? []).map(mapItem),
  subtotal: Number(r.subtotal),
  discount: Number(r.discount),
  shipping: Number(r.shipping),
  total: Number(r.total),
  coupon: r.coupon ?? undefined,
  status: r.status,
  payment: r.payment,
  delivery: r.delivery,
  address: r.address ?? undefined,
  notes: r.notes ?? undefined,
  history: r.history ?? [],
  createdAt: r.created_at,
  demo: r.demo,
});

export const mapAddress = (r: Row): Address => ({
  id: r.id,
  label: r.label,
  street: r.street,
  number: r.number,
  complement: r.complement ?? undefined,
  district: r.district,
  city: r.city,
  state: r.state,
  zip: r.zip,
});

export const mapProfile = (r: Row): PublicUser => ({
  id: r.id,
  name: r.name,
  email: r.email,
  role: r.role,
  phone: r.phone ?? undefined,
  addresses: (r.addresses ?? []).map(mapAddress),
  favorites: (r.favorites ?? []).map((f: Row) => f.product_id),
  createdAt: r.created_at,
});

export const mapMovement = (r: Row): StockMovement => ({
  id: r.id,
  productId: r.product_id,
  type: r.type,
  qty: r.qty,
  balance: r.balance,
  note: r.note ?? undefined,
  by: r.by_name ?? undefined,
  createdAt: r.created_at,
});

export const mapCoupon = (r: Row): Coupon => ({
  id: r.id,
  code: r.code,
  kind: r.kind,
  value: Number(r.value),
  minTotal: Number(r.min_total),
  maxUses: r.max_uses ?? undefined,
  uses: r.uses,
  active: r.active,
});

export const mapBanner = (r: Row): Banner => ({
  id: r.id,
  title: r.title,
  subtitle: r.subtitle,
  buttonLabel: r.button_label,
  link: r.link,
  image: r.image ?? undefined,
  position: r.position,
  active: r.active,
});

export const defaultSettings: Settings = {
  storeName: "Up Games",
  heroTitle: "",
  heroSubtitle: "",
  announcement: "",
  announcementActive: false,
  whatsapp: "",
  phone: "",
  email: "",
  address: "",
  mapsUrl: "",
  instagram: "",
  tiktok: "",
  hours: [],
  deliveryFee: 15,
  freeShippingOver: 299,
  dropIds: [],
  tradeInTitle: "",
  tradeInText: "",
  platforms: [],
};

/** Só as configurações da loja (leve). */
export async function getSettings(): Promise<Settings> {
  const supabase = await createClient();
  const { data } = await supabase.from("settings").select("data").eq("id", 1).maybeSingle();
  return { ...defaultSettings, ...(data?.data ?? {}) };
}

export type NavCategory = Category & { count: number };

/** Categorias que têm pelo menos um produto à venda, na ordem do menu. */
export async function getNavCategories(): Promise<NavCategory[]> {
  const supabase = await createClient();
  const [cats, prods] = await Promise.all([
    supabase.from("categories").select("*").order("position").order("name"),
    supabase.from("products").select("category_id").eq("active", true),
  ]);
  const count = new Map<string, number>();
  for (const p of prods.data ?? []) count.set(p.category_id, (count.get(p.category_id) ?? 0) + 1);
  return (cats.data ?? [])
    .map((c) => ({ ...mapCategory(c), count: count.get(c.id) ?? 0 }))
    .filter((c) => c.count > 0);
}

/** Quantos pedidos esperam atendimento (pendente ou pago). */
export async function countOrdersToHandle(): Promise<number> {
  const supabase = await createClient();
  const { count } = await supabase.from("orders").select("id", { count: "exact", head: true }).in("status", ["pendente", "pago"]);
  return count ?? 0;
}

export type Scope = "orders" | "movements" | "coupons" | "users";

/** Catálogo, categorias, configurações e banners — mais o que for pedido em `scope`. */
export async function read(scope: Scope[] = []): Promise<Database> {
  const supabase = await createClient();
  const want = new Set(scope);
  const [cats, prods, settings, banners, orders, movements, coupons, users] = await Promise.all([
    supabase.from("categories").select("*").order("position").order("name"),
    supabase.from("products").select("*").order("created_at", { ascending: true }).order("name").limit(1000),
    supabase.from("settings").select("data").eq("id", 1).maybeSingle(),
    supabase.from("banners").select("*").order("position").order("created_at"),
    want.has("orders")
      ? supabase.from("orders").select("*, order_items(*)").order("created_at", { ascending: false }).limit(1000)
      : null,
    want.has("movements")
      ? supabase.from("stock_movements").select("*").order("created_at", { ascending: false }).limit(1000)
      : null,
    want.has("coupons") ? supabase.from("coupons").select("*").order("created_at") : null,
    want.has("users") ? supabase.from("profiles").select("*, addresses(*), favorites(product_id)").order("created_at") : null,
  ]);
  return {
    categories: (cats.data ?? []).map(mapCategory),
    products: (prods.data ?? []).map(mapProduct),
    settings: { ...defaultSettings, ...(settings.data?.data ?? {}) },
    banners: (banners.data ?? []).map(mapBanner),
    orders: (orders?.data ?? []).map(mapOrder),
    movements: (movements?.data ?? []).map(mapMovement),
    coupons: (coupons?.data ?? []).map(mapCoupon),
    users: (users?.data ?? []).map(mapProfile),
  };
}
