import { describe, expect, it } from "vitest";
import { catalogue } from "@/data/catalogue";
import { parseQuery, queryCatalogue, toSearch } from "@/lib/catalogue-query";

describe("parseQuery", () => {
  it("drops unknown values", () => {
    const q = parseQuery({ category: "spaceships", size: "M,XXXL", sort: "random", min: "-5" });
    expect(q.category).toBeUndefined();
    expect(q.sizes).toEqual(["M"]);
    expect(q.sort).toBe("featured");
    expect(q.minPrice).toBeUndefined();
  });

  it("round-trips through toSearch", () => {
    const search = "?category=knitwear&size=S,M&color=Ecru&min=100&sort=price-asc";
    const q = parseQuery(Object.fromEntries(new URLSearchParams(search)));
    expect(toSearch(q)).toBe("?category=knitwear&size=S%2CM&color=Ecru&min=100&sort=price-asc");
  });
});

describe("queryCatalogue", () => {
  it("returns everything with no filters", () => {
    expect(queryCatalogue(catalogue, {}).total).toBe(catalogue.length);
  });

  it("filters by category and fibre together", () => {
    const { items } = queryCatalogue(catalogue, { category: "knitwear", fibres: ["Cashmere"] });
    expect(items.length).toBeGreaterThan(0);
    for (const p of items) {
      expect(p.category).toBe("knitwear");
      expect(p.passport.fibres.map((f) => f.fibre)).toContain("Cashmere");
    }
  });

  it("matches every search term", () => {
    const { items } = queryCatalogue(catalogue, { q: "silk black" });
    expect(items.length).toBeGreaterThan(0);
    expect(items.every((p) => p.passport.fibres.some((f) => f.fibre === "Silk"))).toBe(true);
  });

  it("sorts by price", () => {
    const prices = queryCatalogue(catalogue, { sort: "price-asc" }).items.map((p) => p.priceCents);
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
  });

  it("applies price bounds in euros", () => {
    const { items } = queryCatalogue(catalogue, { minPrice: 200, maxPrice: 300 });
    expect(items.every((p) => p.priceCents >= 20000 && p.priceCents <= 30000)).toBe(true);
  });

  it("keeps sibling options in a facet while it is being filtered", () => {
    const { facets } = queryCatalogue(catalogue, { category: "knitwear" });
    // the category facet ignores its own filter, so other categories stay selectable
    expect(facets.categories.length).toBeGreaterThan(1);
    // but other facets are narrowed to knitwear
    const knitColours = new Set(catalogue.filter((p) => p.category === "knitwear").flatMap((p) => p.colorways.map((c) => c.name)));
    expect(facets.colors.every((c) => knitColours.has(c.value))).toBe(true);
  });

  it("in-stock filter hides products with no stock", () => {
    const soldOut = { ...catalogue[0], id: "X", variants: catalogue[0].variants.map((v) => ({ ...v, stock: 0 })) };
    const { items } = queryCatalogue([soldOut, ...catalogue], { inStockOnly: true });
    expect(items.find((p) => p.id === "X")).toBeUndefined();
  });
});
