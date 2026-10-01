"use client";

import { createContext, useCallback, useContext, useMemo, useState, useSyncExternalStore } from "react";

export type CartLine = {
  sku: string;
  slug: string;
  name: string;
  colorway: string;
  hex: string;
  size: string;
  silhouette: string;
  construction: string;
  unitCents: number;
  quantity: number;
  maxQuantity: number;
};

type CartContextValue = {
  lines: CartLine[];
  count: number;
  subtotalCents: number;
  isOpen: boolean;
  open: () => void;
  close: () => void;
  add: (line: Omit<CartLine, "quantity">, quantity?: number) => void;
  setQuantity: (sku: string, quantity: number) => void;
  remove: (sku: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "auro-cart-v1";
const EMPTY: CartLine[] = [];

/* The bag lives in localStorage; this tiny store lets React subscribe to it. */
const listeners = new Set<() => void>();
let snapshot: CartLine[] | null = null;

function read(): CartLine[] {
  if (snapshot) return snapshot;
  try {
    snapshot = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    snapshot = [];
  }
  return snapshot!;
}

function write(next: CartLine[]) {
  snapshot = next;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* storage unavailable: keep the in-memory bag */
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      snapshot = null; // another tab changed the bag
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  // server render and first client render see an empty bag, then the saved one
  const lines = useSyncExternalStore(subscribe, read, () => EMPTY);
  const [isOpen, setIsOpen] = useState(false);
  const setLines = useCallback((update: (prev: CartLine[]) => CartLine[]) => write(update(read())), []);

  const add = useCallback((line: Omit<CartLine, "quantity">, quantity = 1) => {
    setLines((prev) => {
      const existing = prev.find((l) => l.sku === line.sku);
      if (existing) {
        return prev.map((l) => (l.sku === line.sku ? { ...l, quantity: Math.min(l.quantity + quantity, l.maxQuantity) } : l));
      }
      return [...prev, { ...line, quantity: Math.min(quantity, line.maxQuantity) }];
    });
    setIsOpen(true);
  }, [setLines]);

  const setQuantity = useCallback((sku: string, quantity: number) => {
    setLines((prev) =>
      quantity <= 0
        ? prev.filter((l) => l.sku !== sku)
        : prev.map((l) => (l.sku === sku ? { ...l, quantity: Math.min(quantity, l.maxQuantity) } : l)),
    );
  }, [setLines]);

  const remove = useCallback((sku: string) => setLines((prev) => prev.filter((l) => l.sku !== sku)), [setLines]);
  const clear = useCallback(() => setLines(() => []), [setLines]);

  const value = useMemo<CartContextValue>(
    () => ({
      lines,
      count: lines.reduce((n, l) => n + l.quantity, 0),
      subtotalCents: lines.reduce((n, l) => n + l.quantity * l.unitCents, 0),
      isOpen,
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
      add,
      setQuantity,
      remove,
      clear,
    }),
    [lines, isOpen, add, setQuantity, remove, clear],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
