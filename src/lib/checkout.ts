import type { Product } from "@/lib/types";

export type RequestedLine = { sku: string; quantity: number };

export type PricedLine = {
  sku: string;
  productId: string;
  name: string;
  description: string;
  quantity: number;
  unitCents: number;
};

export type CheckoutValidation =
  | { ok: true; lines: PricedLine[]; totalCents: number }
  | { ok: false; errors: { sku: string; reason: "unknown" | "out-of-stock" | "insufficient-stock" | "bad-quantity"; available?: number }[] };

const MAX_QTY = 10;

/**
 * Re-prices and stock-checks a bag on the server. The client only sends SKUs
 * and quantities; prices always come from the catalogue, never from the browser.
 */
export function validateCart(requested: RequestedLine[], catalogue: Product[]): CheckoutValidation {
  const bySku = new Map(catalogue.flatMap((p) => p.variants.map((v) => [v.sku, { product: p, variant: v }] as const)));
  const merged = new Map<string, number>();
  for (const r of requested) merged.set(r.sku, (merged.get(r.sku) ?? 0) + r.quantity);

  const errors: Extract<CheckoutValidation, { ok: false }>["errors"] = [];
  const lines: PricedLine[] = [];

  for (const [sku, quantity] of merged) {
    const hit = bySku.get(sku);
    if (!hit) {
      errors.push({ sku, reason: "unknown" });
      continue;
    }
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QTY) {
      errors.push({ sku, reason: "bad-quantity" });
      continue;
    }
    const { product, variant } = hit;
    if (variant.stock === 0) {
      errors.push({ sku, reason: "out-of-stock", available: 0 });
      continue;
    }
    if (variant.stock < quantity) {
      errors.push({ sku, reason: "insufficient-stock", available: variant.stock });
      continue;
    }
    lines.push({
      sku,
      productId: product.id,
      name: product.name,
      description: `${variant.colorway} · ${variant.size === "ONE" ? "One size" : variant.size}`,
      quantity,
      unitCents: product.priceCents,
    });
  }

  if (errors.length || lines.length === 0) return { ok: false, errors };
  return { ok: true, lines, totalCents: lines.reduce((n, l) => n + l.unitCents * l.quantity, 0) };
}
