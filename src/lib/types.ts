export type Role = "admin" | "customer";

export type Rarity = "comum" | "raro" | "epico" | "lendario";

export type Condition = "novo" | "seminovo";

export interface Address {
  id: string;
  label: string;
  street: string;
  number: string;
  complement?: string;
  district: string;
  city: string;
  state: string;
  zip: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
  phone?: string;
  addresses: Address[];
  favorites: string[];
  createdAt: string;
}

export type PublicUser = Omit<User, "passwordHash">;

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
}

export interface Product {
  id: string;
  slug: string;
  sku: string;
  name: string;
  description: string;
  price: number;
  comparePrice?: number;
  cost?: number;
  categoryId: string;
  platform: string;
  condition: Condition;
  rarity: Rarity;
  stock: number;
  minStock: number;
  images: string[];
  featured: boolean;
  active: boolean;
  createdAt: string;
}

export type OrderStatus =
  | "pendente"
  | "pago"
  | "separando"
  | "enviado"
  | "entregue"
  | "cancelado";

export type PaymentMethod = "pix" | "loja";
export type DeliveryMethod = "retirada" | "entrega";

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  qty: number;
  image?: string;
  platform: string;
}

export interface Order {
  id: string;
  number: number;
  userId: string;
  customer: { name: string; email: string; phone?: string };
  items: OrderItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  coupon?: string;
  status: OrderStatus;
  payment: PaymentMethod;
  delivery: DeliveryMethod;
  address?: Omit<Address, "id" | "label">;
  notes?: string;
  history: { status: OrderStatus; at: string; note?: string }[];
  createdAt: string;
  demo?: boolean;
}

export type MovementType = "entrada" | "saida" | "ajuste" | "venda" | "cancelamento";

export interface StockMovement {
  id: string;
  productId: string;
  type: MovementType;
  qty: number;
  balance: number;
  note?: string;
  by?: string;
  createdAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  kind: "percent" | "fixed";
  value: number;
  minTotal: number;
  maxUses?: number;
  uses: number;
  active: boolean;
}

export interface Settings {
  storeName: string;
  heroTitle: string;
  heroSubtitle: string;
  announcement: string;
  announcementActive: boolean;
  whatsapp: string;
  phone: string;
  email: string;
  address: string;
  mapsUrl: string;
  instagram: string;
  tiktok: string;
  hours: { day: string; open: string; close: string; closed?: boolean }[];
  deliveryFee: number;
  freeShippingOver: number;
  dropIds: string[];
  tradeInTitle: string;
  tradeInText: string;
  platforms: string[];
}

export interface Database {
  users: User[];
  categories: Category[];
  products: Product[];
  orders: Order[];
  movements: StockMovement[];
  coupons: Coupon[];
  settings: Settings;
  counters: { order: number };
}
