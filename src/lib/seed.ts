import { hashPassword } from "./password";
import type {
  Category,
  Database,
  Order,
  OrderStatus,
  Product,
  Rarity,
  StockMovement,
  User,
} from "./types";
import { slugify } from "./format";

const now = () => new Date().toISOString();

const categories: Category[] = [
  { id: "cat-jogos", name: "Jogos", slug: "jogos", icon: "disc" },
  { id: "cat-consoles", name: "Consoles", slug: "consoles", icon: "monitor" },
  { id: "cat-controles", name: "Controles", slug: "controles", icon: "gamepad" },
  { id: "cat-headsets", name: "Headsets", slug: "headsets", icon: "headphones" },
  { id: "cat-acessorios", name: "Acessórios", slug: "acessorios", icon: "cable" },
  { id: "cat-colecionaveis", name: "Colecionáveis", slug: "colecionaveis", icon: "sparkles" },
];

type SeedProduct = [
  name: string,
  categoryId: string,
  platform: string,
  price: number,
  stock: number,
  rarity: Rarity,
  condition: "novo" | "seminovo",
  description: string,
  comparePrice?: number,
];

const seedProducts: SeedProduct[] = [
  ["Headset Série Ouro PlayStation", "cat-headsets", "PS4", 499, 4, "lendario", "novo", "Som 3D, microfone com cancelamento de ruído e almofadas que aguentam a madrugada inteira de partida ranqueada."],
  ["Controle PS4 Camuflado Verde", "cat-controles", "PS4", 340, 6, "epico", "novo", "DualShock 4 na edição camuflada. Touchpad, vibração e luz de barra — tudo original."],
  ["PlayStation 4 Slim 1TB", "cat-consoles", "PS4", 1899, 2, "lendario", "seminovo", "Console revisado na loja, com 1 controle e cabos. Garantia de 90 dias Up Games.", 2199],
  ["Xbox One S 1TB", "cat-consoles", "Xbox One", 1599, 1, "lendario", "seminovo", "Revisado, limpo e testado. Roda Blu-ray 4K e acompanha controle sem fio."],
  ["DualSense Branco", "cat-controles", "PS5", 449.9, 5, "lendario", "novo", "Gatilhos adaptáveis e resposta tátil. O controle do PS5 na cor clássica."],
  ["Controle Xbox One com Fio", "cat-controles", "Xbox One", 189.9, 9, "raro", "novo", "Conexão por cabo, zero atraso. Funciona no Xbox One e no PC."],
  ["God of War Ragnarök", "cat-jogos", "PS4", 199.9, 7, "lendario", "novo", "Kratos e Atreus atravessam os nove reinos antes do fim. Mídia física lacrada.", 249.9],
  ["Marvel's Spider-Man", "cat-jogos", "PS4", 79.9, 5, "raro", "seminovo", "Nova York inteira para balançar. Disco revisado e com capa."],
  ["The Last of Us Part II", "cat-jogos", "PS4", 89.9, 3, "raro", "seminovo", "A continuação da história de Ellie. Disco em ótimo estado."],
  ["GTA V Edição Premium", "cat-jogos", "PS4", 99.9, 8, "epico", "novo", "Los Santos com o pacote Criminal Enterprise incluso."],
  ["Mortal Kombat 11", "cat-jogos", "PS4", 119.9, 4, "epico", "novo", "Fatalities novos, elenco completo e modo história."],
  ["EA Sports FC 24", "cat-jogos", "PS4", 69.9, 10, "comum", "seminovo", "O futebol da temporada, pronto para o fim de semana com os amigos."],
  ["Red Dead Redemption 2", "cat-jogos", "Xbox One", 89.9, 4, "epico", "seminovo", "O velho oeste da Rockstar em dois discos. Completo, com mapa."],
  ["Forza Horizon 4", "cat-jogos", "Xbox One", 69.9, 3, "raro", "seminovo", "Corridas em mundo aberto pelas estações do Reino Unido."],
  ["Halo 5: Guardians", "cat-jogos", "Xbox One", 39.9, 6, "comum", "seminovo", "Master Chief em campanha cooperativa e multiplayer."],
  ["Gears of War 3", "cat-jogos", "Xbox 360", 29.9, 5, "comum", "seminovo", "O fechamento da trilogia original. Clássico do 360."],
  ["Minecraft Xbox 360 Edition", "cat-jogos", "Xbox 360", 39.9, 2, "comum", "seminovo", "Construa, explore e sobreviva — em tela dividida com a galera."],
  ["The Last of Us", "cat-jogos", "PS3", 49.9, 2, "raro", "seminovo", "Onde tudo começou. Disco do PS3 revisado."],
  ["God of War III", "cat-jogos", "PS3", 39.9, 3, "comum", "seminovo", "A vingança de Kratos contra o Olimpo, no PS3."],
  ["Mouse Gamer Xsoldado GM-705", "cat-acessorios", "PC", 70, 12, "comum", "novo", "2400 DPI, LED RGB e seis botões. Leve e preciso."],
  ["Fone Bluetooth i11", "cat-acessorios", "Universal", 70, 15, "comum", "novo", "Fone sem fio com estojo carregador. Pareia com qualquer celular."],
  ["Cabo iPhone Kimaster", "cat-acessorios", "Universal", 20, 30, "comum", "novo", "Cabo Lightning reforçado, 1 metro, carregamento rápido."],
  ["Base Carregadora Dupla PS4", "cat-acessorios", "PS4", 79.9, 1, "raro", "novo", "Carrega dois DualShock 4 ao mesmo tempo, com LED de status."],
  ["Miniatura Homem-Aranha", "cat-colecionaveis", "Universal", 129.9, 3, "raro", "novo", "Estátua de 18 cm do amigão da vizinhança, com base."],
  ["Miniatura Batman", "cat-colecionaveis", "Universal", 129.9, 2, "epico", "novo", "O cavaleiro das trevas em 18 cm, pintado à mão."],
];

/** Gerador pseudoaleatório determinístico, para o seed ser sempre igual. */
function rng(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
}

export function buildSeed(): Database {
  const created = now();
  const products: Product[] = seedProducts.map((p, i) => ({
    id: `prd-${(i + 1).toString().padStart(3, "0")}`,
    slug: slugify(`${p[0]} ${p[2]}`),
    sku: `UP-${(1000 + i).toString()}`,
    name: p[0],
    categoryId: p[1],
    platform: p[2],
    price: p[3],
    stock: p[4],
    rarity: p[5],
    condition: p[6],
    description: p[7],
    comparePrice: p[8],
    cost: Math.round(p[3] * 0.62 * 100) / 100,
    minStock: 2,
    images: [],
    featured: i < 8,
    active: true,
    createdAt: created,
  }));

  const admin: User = {
    id: "usr-admin",
    name: "Admin Up Games",
    email: "adminup@gmail.com",
    passwordHash: hashPassword("admin1234"),
    role: "admin",
    addresses: [],
    favorites: [],
    createdAt: created,
  };

  // Clientes e pedidos de demonstração, para o painel já nascer com gráficos.
  const names = ["Lucas Ferreira", "Marina Souza", "Rafael Lima", "Bianca Rocha", "Diego Martins", "Camila Alves", "Thiago Nunes", "Júlia Ramos"];
  const demoUsers: User[] = names.map((name, i) => ({
    id: `usr-demo-${i}`,
    name,
    email: `${slugify(name).replace(/-/g, ".")}@exemplo.com`,
    passwordHash: "demo:demo",
    role: "customer",
    addresses: [],
    favorites: [],
    createdAt: new Date(Date.now() - (120 - i * 9) * 864e5).toISOString(),
  }));

  const rand = rng(42);
  const orders: Order[] = [];
  const movements: StockMovement[] = [];
  const statuses: OrderStatus[] = ["entregue", "entregue", "entregue", "enviado", "pago", "separando", "pendente", "cancelado"];
  for (let i = 0; i < 74; i++) {
    const daysAgo = Math.floor(Math.pow(rand(), 1.4) * 60);
    const date = new Date(Date.now() - daysAgo * 864e5 - rand() * 864e5 * 0.6);
    const user = demoUsers[Math.floor(rand() * demoUsers.length)];
    const count = 1 + Math.floor(rand() * 2.4);
    const items = Array.from({ length: count }, () => {
      const p = products[Math.floor(Math.pow(rand(), 1.3) * products.length)];
      return { productId: p.id, name: p.name, price: p.price, qty: 1 + Math.floor(rand() * 1.5), platform: p.platform };
    });
    const subtotal = items.reduce((s, it) => s + it.price * it.qty, 0);
    const delivery = rand() > 0.55 ? "entrega" : "retirada";
    const shipping = delivery === "entrega" && subtotal < 299 ? 15 : 0;
    const status = daysAgo > 6 ? statuses[Math.floor(rand() * 3) + (rand() > 0.9 ? 5 : 0)] : statuses[Math.floor(rand() * statuses.length)];
    orders.push({
      id: `ord-demo-${i}`,
      number: 1001 + i,
      userId: user.id,
      customer: { name: user.name, email: user.email },
      items,
      subtotal,
      discount: 0,
      shipping,
      total: subtotal + shipping,
      status,
      payment: rand() > 0.4 ? "pix" : "loja",
      delivery,
      history: [{ status, at: date.toISOString() }],
      createdAt: date.toISOString(),
      demo: true,
    });
  }
  orders.sort((a, b) => a.createdAt.localeCompare(b.createdAt)).forEach((o, i) => (o.number = 1001 + i));

  for (const p of products) {
    movements.push({
      id: `mov-${p.id}`,
      productId: p.id,
      type: "entrada",
      qty: p.stock,
      balance: p.stock,
      note: "Estoque inicial",
      by: "Sistema",
      createdAt: created,
    });
  }

  return {
    users: [admin, ...demoUsers],
    categories,
    products,
    orders,
    movements,
    coupons: [
      { id: "cpn-1", code: "SUBIDEFASE", kind: "percent", value: 10, minTotal: 150, uses: 0, active: true },
      { id: "cpn-2", code: "BEMVINDO20", kind: "fixed", value: 20, minTotal: 120, maxUses: 100, uses: 0, active: true },
    ],
    settings: {
      storeName: "Up Games",
      heroTitle: "Sua próxima fase está na prateleira.",
      heroSubtitle: "Jogos, consoles, controles e colecionáveis no Jardim Ranieri. Compramos, vendemos e trocamos — com a nota 4,8 de quem já passou por aqui.",
      announcement: "Cupom SUBIDEFASE: 10% off acima de R$ 150 · Retire na loja no mesmo dia",
      announcementActive: true,
      whatsapp: "5511988022398",
      phone: "(11) 98802-2398",
      email: "adminup@gmail.com",
      address: "R. Alberto Borges Soveral, 69 — Jardim Ranieri, São Paulo · SP, 05875-210",
      mapsUrl: "https://www.google.com/maps/search/?api=1&query=Up+Games+R.+Alberto+Borges+Soveral+69+S%C3%A3o+Paulo",
      instagram: "https://www.instagram.com/",
      tiktok: "https://www.tiktok.com/",
      hours: [
        { day: "Segunda", open: "10:00", close: "20:00" },
        { day: "Terça", open: "10:00", close: "20:00" },
        { day: "Quarta", open: "10:00", close: "20:00" },
        { day: "Quinta", open: "10:00", close: "20:00" },
        { day: "Sexta", open: "10:00", close: "20:00" },
        { day: "Sábado", open: "10:00", close: "20:00" },
        { day: "Domingo", open: "10:00", close: "14:00", closed: true },
      ],
      deliveryFee: 15,
      freeShippingOver: 299,
      dropIds: ["prd-001", "prd-002", "prd-007", "prd-003", "prd-025"],
      tradeInTitle: "Zerou? Troca aqui.",
      tradeInText: "Traga seus jogos e consoles parados. A gente avalia na hora e vira crédito para a próxima compra ou dinheiro no Pix.",
      platforms: ["PS5", "PS4", "PS3", "Xbox Series", "Xbox One", "Xbox 360", "Switch", "PC", "Universal"],
    },
    counters: { order: 1001 + orders.length },
  };
}
