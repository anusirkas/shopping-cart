"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useCart } from "@/components/CartProvider";
import FlatSketch from "@/components/FlatSketch";
import { formatPrice } from "@/lib/money";
import type { Construction, Silhouette } from "@/lib/types";

export function CartLines({ compact = false }: { compact?: boolean }) {
  const { lines, setQuantity, remove } = useCart();
  if (lines.length === 0) return <p className="muted">Your bag is empty.</p>;
  return (
    <ul className={`cart-lines${compact ? " is-compact" : ""}`}>
      {lines.map((l) => (
        <li key={l.sku}>
          <Link href={`/product/${l.slug}`} className="cart-thumb">
            <FlatSketch silhouette={l.silhouette as Silhouette} construction={l.construction as Construction} color={l.hex} />
          </Link>
          <div className="cart-info">
            <Link href={`/product/${l.slug}`} className="cart-name">{l.name}</Link>
            <span className="muted">{l.colorway} · {l.size}</span>
            <div className="qty">
              <button onClick={() => setQuantity(l.sku, l.quantity - 1)} aria-label={`Decrease ${l.name}`}>−</button>
              <span aria-live="polite">{l.quantity}</span>
              <button onClick={() => setQuantity(l.sku, l.quantity + 1)} disabled={l.quantity >= l.maxQuantity} aria-label={`Increase ${l.name}`}>+</button>
            </div>
          </div>
          <div className="cart-price">
            <span>{formatPrice(l.unitCents * l.quantity)}</span>
            <button className="link-btn" onClick={() => remove(l.sku)}>Remove</button>
          </div>
        </li>
      ))}
    </ul>
  );
}

export default function CartDrawer() {
  const { isOpen, close, subtotalCents, count } = useCart();

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, close]);

  return (
    <div className={`drawer-root${isOpen ? " is-open" : ""}`} aria-hidden={!isOpen}>
      <div className="drawer-backdrop" onClick={close} />
      <aside className="drawer" role="dialog" aria-modal="true" aria-label="Shopping bag">
        <div className="drawer-head">
          <h2>Bag ({count})</h2>
          <button className="text-btn" onClick={close}>Close</button>
        </div>
        <div className="drawer-body">
          <CartLines compact />
        </div>
        {count > 0 && (
          <div className="drawer-foot">
            <div className="row-between">
              <span>Subtotal</span>
              <span>{formatPrice(subtotalCents)}</span>
            </div>
            <Link href="/bag" className="btn btn-block" onClick={close}>View bag & checkout</Link>
          </div>
        )}
      </aside>
    </div>
  );
}
