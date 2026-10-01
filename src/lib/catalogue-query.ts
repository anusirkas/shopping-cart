import type { Category, Product, Size } from "@/lib/types";

export type SortKey = "featured" | "newest" | "price-asc" | "price-desc";

export type CatalogueQuery = {
  q?: string;
  category?: Category;
  sizes?: Size[];
  colors?: string[];
  fibres?: string[];
  minPrice?: number; // euros
  maxPrice?: number; // euros
  inStockOnly?: boolean;
  sort?: SortKey;
};

export type Facet = { value: string; count: number };

export type CatalogueResult = {
  items: Product[];
  total: number;
  facets: { categories: Facet[]; sizes: Facet[]; colors: Facet[]; fibres: Facet[] };
  priceRange: { min: number; max: number };
};

const SIZE_ORDER: Size[] = ["XS", "S", "M", "L", "XL", "ONE"];
const CATEGORIES: Category[] = ["knitwear", "outerwear", "dresses", "shirts", "trousers", "skirts", "accessories"];

const list = (v: string | string[] | undefined) =>
  (Array.isArray(v) ? v : (v ?? "").split(",")).map((s) => s.trim()).filter(Boolean);

/** Parse URL search params into a typed query; unknown values are dropped. */
export function parseQuery(params: Record<string, string | string[] | undefined>): CatalogueQuery {
  const num = (v: unknown) => {
    const n = Number(v);
    return Number.isFinite(n) && n >= 0 ? n : undefined;
  };
  const category = list(params.category)[0] as Category | undefined;
  const sort = list(params.sort)[0] as SortKey | undefined;
  return {
    q: list(params.q)[0],
    category: category && CATEGORIES.includes(category) ? category : undefined,
    sizes: list(params.size).filter((s): s is Size => SIZE_ORDER.includes(s as Size)),
    colors: list(params.color),
    fibres: list(params.fibre),
    minPrice: num(list(params.min)[0]),
    maxPrice: num(list(params.max)[0]),
    inStockOnly: list(params.stock)[0] === "1",
    sort: sort && ["featured", "newest", "price-asc", "price-desc"].includes(sort) ? sort : "featured",
  };
}

const inStock = (p: Product, size?: Size, color?: string) =>
  p.variants.some((v) => v.stock > 0 && (!size || v.size === size) && (!color || v.colorway === color));

function matches(p: Product, q: CatalogueQuery, ignore?: "category" | "sizes" | "colors" | "fibres"): boolean {
  if (q.q) {
    const hay = [p.name, p.category, p.description, ...p.passport.fibres.map((f) => f.fibre), ...p.colorways.map((c) => c.name)]
      .join(" ")
      .toLowerCase();
    if (!q.q.toLowerCase().split(/\s+/).every((term) => hay.includes(term))) return false;
  }
  if (ignore !== "category" && q.category && p.category !== q.category) return false;
  if (ignore !== "sizes" && q.sizes?.length) {
    // a size filter means "available in this size", so it respects stock
    if (!q.sizes.some((s) => p.sizes.includes(s) && (!q.inStockOnly || inStock(p, s)))) return false;
  }
  if (ignore !== "colors" && q.colors?.length && !p.colorways.some((c) => q.colors!.includes(c.name))) return false;
  if (ignore !== "fibres" && q.fibres?.length && !p.passport.fibres.some((f) => q.fibres!.includes(f.fibre))) return false;
  const price = p.priceCents / 100;
  if (q.minPrice !== undefined && price < q.minPrice) return false;
  if (q.maxPrice !== undefined && price > q.maxPrice) return false;
  if (q.inStockOnly && !inStock(p)) return false;
  return true;
}

function count(products: Product[], values: (p: Product) => string[]): Facet[] {
  const counts = new Map<string, number>();
  for (const p of products) for (const v of new Set(values(p))) counts.set(v, (counts.get(v) ?? 0) + 1);
  return [...counts].map(([value, count]) => ({ value, count }));
}

/**
 * Filter, sort and facet the catalogue. Each facet is counted with every
 * other filter applied but its own, so options never disappear while you pick.
 */
export function queryCatalogue(products: Product[], q: CatalogueQuery): CatalogueResult {
  const items = products.filter((p) => matches(p, q));

  const sorters: Record<SortKey, (a: Product, b: Product) => number> = {
    featured: (a, b) => Number(b.isNew) - Number(a.isNew) || products.indexOf(a) - products.indexOf(b),
    newest: (a, b) => b.createdAt.localeCompare(a.createdAt),
    "price-asc": (a, b) => a.priceCents - b.priceCents,
    "price-desc": (a, b) => b.priceCents - a.priceCents,
  };
  items.sort(sorters[q.sort ?? "featured"]);

  const prices = products.map((p) => p.priceCents / 100);
  return {
    items,
    total: items.length,
    facets: {
      categories: count(products.filter((p) => matches(p, q, "category")), (p) => [p.category]).sort(
        (a, b) => CATEGORIES.indexOf(a.value as Category) - CATEGORIES.indexOf(b.value as Category),
      ),
      sizes: count(products.filter((p) => matches(p, q, "sizes")), (p) => p.sizes).sort(
        (a, b) => SIZE_ORDER.indexOf(a.value as Size) - SIZE_ORDER.indexOf(b.value as Size),
      ),
      colors: count(products.filter((p) => matches(p, q, "colors")), (p) => p.colorways.map((c) => c.name)).sort(
        (a, b) => b.count - a.count || a.value.localeCompare(b.value),
      ),
      fibres: count(products.filter((p) => matches(p, q, "fibres")), (p) => p.passport.fibres.map((f) => f.fibre)).sort(
        (a, b) => b.count - a.count || a.value.localeCompare(b.value),
      ),
    },
    priceRange: { min: Math.min(...prices), max: Math.max(...prices) },
  };
}

/** Serialise a query back to a URL search string, dropping defaults. */
export function toSearch(q: CatalogueQuery): string {
  const p = new URLSearchParams();
  if (q.q) p.set("q", q.q);
  if (q.category) p.set("category", q.category);
  if (q.sizes?.length) p.set("size", q.sizes.join(","));
  if (q.colors?.length) p.set("color", q.colors.join(","));
  if (q.fibres?.length) p.set("fibre", q.fibres.join(","));
  if (q.minPrice !== undefined) p.set("min", String(q.minPrice));
  if (q.maxPrice !== undefined) p.set("max", String(q.maxPrice));
  if (q.inStockOnly) p.set("stock", "1");
  if (q.sort && q.sort !== "featured") p.set("sort", q.sort);
  const s = p.toString();
  return s ? `?${s}` : "";
}
