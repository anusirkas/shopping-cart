"use client";

import Link from "next/link";
import { useState } from "react";
import { CartLines } from "@/components/CartDrawer";
import { useCart } from "@/components/CartProvider";
import { formatPrice } from "@/lib/money";

type CheckoutError = { sku: string; reason: string; available?: number };

export default function BagView({ checkoutEnabled }: { checkoutEnabled: boolean }) {
  const { lines, subtotalCents, setQuantity } = useCart();
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState("");

  const checkout = async () => {
    setStatus("loading");
    setMessage("");
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lines: lines.map((l) => ({ sku: l.sku, quantity: l.quantity })) }),
      });
      const data = await res.json();
      if (res.ok && data.url) {
        window.location.href = data.url;
        return;
      }
      if (res.status === 409) {
        // stock changed since the item was added: fix the bag and explain
        for (const e of data.details as CheckoutError[]) {
          if (e.available !== undefined) setQuantity(e.sku, e.available);
        }
        setMessage("Some items sold out or ran low while in your bag. We've updated the quantities.");
      } else {
        setMessage("Checkout isn't available right now.");
      }
      setStatus("error");
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  };

  if (lines.length === 0) {
    return (
      <div className="empty-bag">
        <p className="muted">Your bag is empty.</p>
        <Link href="/shop" className="btn">Continue shopping</Link>
      </div>
    );
  }

  return (
    <div className="bag">
      <CartLines />
      <aside className="bag-summary">
        <div className="row-between"><span>Subtotal</span><span>{formatPrice(subtotalCents)}</span></div>
        <div className="row-between muted"><span>Shipping</span><span>Free</span></div>
        <div className="row-between bag-total"><span>Total</span><span>{formatPrice(subtotalCents)}</span></div>
        <button className="btn btn-block" onClick={checkout} disabled={!checkoutEnabled || status === "loading"}>
          {status === "loading" ? "Redirecting…" : "Checkout"}
        </button>
        {checkoutEnabled ? (
          <p className="muted small-note">
            Stripe test mode: pay with card <code>4242 4242 4242 4242</code>, any future date and any CVC. No real money moves.
          </p>
        ) : (
          <p className="muted small-note">Checkout opens once Stripe test mode is connected.</p>
        )}
        {message && <p className="warn small-note" role="alert">{message}</p>}
      </aside>
    </div>
  );
}
