import { describe, expect, it } from "vitest";
import { catalogue } from "@/data/catalogue";
import { validateCart } from "@/lib/checkout";

const inStock = catalogue.flatMap((p) => p.variants.map((v) => ({ p, v }))).find(({ v }) => v.stock >= 3)!;
const soldOut = catalogue.flatMap((p) => p.variants.map((v) => ({ p, v }))).find(({ v }) => v.stock === 0)!;

describe("validateCart", () => {
  it("prices lines from the catalogue", () => {
    const r = validateCart([{ sku: inStock.v.sku, quantity: 2 }], catalogue);
    expect(r).toMatchObject({ ok: true, totalCents: inStock.p.priceCents * 2 });
  });

  it("merges duplicate SKUs before checking stock", () => {
    const r = validateCart(
      [
        { sku: inStock.v.sku, quantity: 1 },
        { sku: inStock.v.sku, quantity: 1 },
      ],
      catalogue,
    );
    expect(r.ok && r.lines[0].quantity).toBe(2);
  });

  it("rejects unknown SKUs and silly quantities", () => {
    const r = validateCart(
      [
        { sku: "NOPE", quantity: 1 },
        { sku: inStock.v.sku, quantity: 0 },
      ],
      catalogue,
    );
    expect(r).toEqual({
      ok: false,
      errors: [
        { sku: "NOPE", reason: "unknown" },
        { sku: inStock.v.sku, reason: "bad-quantity" },
      ],
    });
  });

  it("reports sold-out and short stock with what is available", () => {
    const r = validateCart(
      [
        { sku: soldOut.v.sku, quantity: 1 },
        { sku: inStock.v.sku, quantity: inStock.v.stock + 1 > 10 ? 10 : inStock.v.stock + 1 },
      ],
      catalogue,
    );
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.errors[0]).toEqual({ sku: soldOut.v.sku, reason: "out-of-stock", available: 0 });
  });

  it("rejects an empty bag", () => {
    expect(validateCart([], catalogue).ok).toBe(false);
  });
});
