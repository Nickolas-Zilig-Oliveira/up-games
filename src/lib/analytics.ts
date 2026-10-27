import type { Database, Order, OrderStatus } from "./types";

const DAY = 864e5;
const counts = (o: Order) => o.status !== "cancelado";

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function dashboard(db: Database, days: number) {
  const today = startOfDay(new Date());
  const from = today.getTime() - (days - 1) * DAY;
  const prevFrom = from - days * DAY;
  const inRange = db.orders.filter((o) => new Date(o.createdAt).getTime() >= from);
  const prev = db.orders.filter((o) => {
    const t = new Date(o.createdAt).getTime();
    return t >= prevFrom && t < from;
  });

  const revenue = inRange.filter(counts).reduce((s, o) => s + o.total, 0);
  const prevRevenue = prev.filter(counts).reduce((s, o) => s + o.total, 0);
  const orders = inRange.filter(counts).length;
  const prevOrders = prev.filter(counts).length;
  const cost = new Map(db.products.map((p) => [p.id, p.cost ?? 0]));
  const profit = inRange
    .filter(counts)
    .reduce((s, o) => s + o.items.reduce((a, i) => a + (i.price - (cost.get(i.productId) ?? 0)) * i.qty, 0) - o.discount, 0);

  // Série diária
  const series = Array.from({ length: days }, (_, k) => {
    const d = new Date(from + k * DAY);
    return { date: d.toISOString(), revenue: 0, orders: 0 };
  });
  for (const o of inRange.filter(counts)) {
    const idx = Math.floor((startOfDay(new Date(o.createdAt)).getTime() - from) / DAY);
    if (series[idx]) {
      series[idx].revenue += o.total;
      series[idx].orders += 1;
    }
  }

  // Por status (todos do período)
  const statuses: OrderStatus[] = ["pendente", "pago", "separando", "enviado", "entregue", "cancelado"];
  const byStatus = statuses.map((s) => ({ status: s, count: inRange.filter((o) => o.status === s).length }));

  // Produtos mais vendidos
  const sold = new Map<string, { name: string; qty: number; revenue: number }>();
  for (const o of inRange.filter(counts)) {
    for (const i of o.items) {
      const cur = sold.get(i.productId) ?? { name: i.name, qty: 0, revenue: 0 };
      cur.qty += i.qty;
      cur.revenue += i.qty * i.price;
      sold.set(i.productId, cur);
    }
  }
  const top = [...sold.entries()].map(([id, v]) => ({ id, ...v })).sort((a, b) => b.revenue - a.revenue).slice(0, 6);

  // Por categoria
  const catOf = new Map(db.products.map((p) => [p.id, p.categoryId]));
  const byCat = db.categories
    .map((c) => ({
      name: c.name,
      revenue: [...sold.entries()].filter(([id]) => catOf.get(id) === c.id).reduce((s, [, v]) => s + v.revenue, 0),
    }))
    .sort((a, b) => b.revenue - a.revenue);

  const lowStock = db.products.filter((p) => p.active && p.stock <= p.minStock).sort((a, b) => a.stock - b.stock);
  const stockValue = db.products.filter((p) => p.active).reduce((s, p) => s + p.stock * (p.cost ?? p.price), 0);
  const recent = [...db.orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 6);

  const delta = (a: number, b: number) => (b === 0 ? (a > 0 ? 1 : 0) : (a - b) / b);

  return {
    revenue,
    revenueDelta: delta(revenue, prevRevenue),
    orders,
    ordersDelta: delta(orders, prevOrders),
    ticket: orders ? revenue / orders : 0,
    profit,
    series,
    byStatus,
    top,
    byCat,
    lowStock,
    stockValue,
    recent,
    customers: db.users.filter((u) => u.role === "customer").length,
    newCustomers: db.users.filter((u) => u.role === "customer" && new Date(u.createdAt).getTime() >= from).length,
  };
}
