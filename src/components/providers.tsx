"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CircleCheck, AlertTriangle } from "lucide-react";

/* ---------------- Carrinho ---------------- */

export interface CartLine {
  productId: string;
  slug: string;
  name: string;
  price: number;
  image?: string;
  platform: string;
  rarity: string;
  categoryIcon: string;
  stock: number;
  qty: number;
}

interface CartCtx {
  lines: CartLine[];
  count: number;
  subtotal: number;
  open: boolean;
  setOpen: (v: boolean) => void;
  add: (line: Omit<CartLine, "qty">, qty?: number) => void;
  setQty: (productId: string, qty: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
  bump: number;
}

const Cart = createContext<CartCtx | null>(null);
const KEY = "up-cart-v1";

function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [open, setOpen] = useState(false);
  const [bump, setBump] = useState(0);
  const loaded = useRef(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setLines(JSON.parse(raw));
    } catch {}
    loaded.current = true;
  }, []);

  useEffect(() => {
    if (!loaded.current) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(lines));
    } catch {}
  }, [lines]);

  const add = useCallback((line: Omit<CartLine, "qty">, qty = 1) => {
    setLines((prev) => {
      const found = prev.find((l) => l.productId === line.productId);
      if (found) {
        return prev.map((l) => (l.productId === line.productId ? { ...l, ...line, qty: Math.min(l.qty + qty, line.stock) } : l));
      }
      return [...prev, { ...line, qty: Math.min(qty, line.stock) }];
    });
    setBump((b) => b + 1);
  }, []);

  const setQty = useCallback((productId: string, qty: number) => {
    setLines((prev) => prev.map((l) => (l.productId === productId ? { ...l, qty: Math.max(1, Math.min(qty, l.stock)) } : l)));
  }, []);

  const remove = useCallback((productId: string) => setLines((prev) => prev.filter((l) => l.productId !== productId)), []);
  const clear = useCallback(() => setLines([]), []);

  const value = useMemo<CartCtx>(
    () => ({
      lines,
      count: lines.reduce((s, l) => s + l.qty, 0),
      subtotal: lines.reduce((s, l) => s + l.qty * l.price, 0),
      open,
      setOpen,
      add,
      setQty,
      remove,
      clear,
      bump,
    }),
    [lines, open, add, setQty, remove, clear, bump],
  );

  return <Cart.Provider value={value}>{children}</Cart.Provider>;
}

export function useCart() {
  const ctx = useContext(Cart);
  if (!ctx) throw new Error("useCart fora do CartProvider");
  return ctx;
}

/* ---------------- Toasts ---------------- */

type Toast = { id: number; text: string; tone: "ok" | "bad" };
const ToastCtx = createContext<(text: string, tone?: "ok" | "bad") => void>(() => {});

function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const push = useCallback((text: string, tone: "ok" | "bad" = "ok") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t.slice(-2), { id, text, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3600);
  }, []);

  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-5 z-[100] flex flex-col items-center gap-2 px-4" aria-live="polite">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 500, damping: 34 }}
              className="chamfer-sm flex max-w-md items-center gap-3 bg-plate-2 px-4 py-3 text-sm font-medium shadow-2xl"
            >
              {t.tone === "ok" ? (
                <CircleCheck className="size-4 shrink-0 text-ok" />
              ) : (
                <AlertTriangle className="size-4 shrink-0 text-bad" />
              )}
              {t.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastCtx.Provider>
  );
}

export const useToast = () => useContext(ToastCtx);

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <CartProvider>{children}</CartProvider>
    </ToastProvider>
  );
}
