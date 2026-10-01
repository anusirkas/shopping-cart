"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { CatalogueQuery, CatalogueResult, SortKey } from "@/lib/catalogue-query";
import { toSearch } from "@/lib/catalogue-query";
import { categoryLabel } from "@/lib/labels";
import type { Category, Size } from "@/lib/types";

type Props = { query: CatalogueQuery; facets: CatalogueResult["facets"]; total: number; swatches: Record<string, string> };

const sorts: { value: SortKey; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
];

const toggle = <T,>(list: T[] | undefined, value: T) =>
  list?.includes(value) ? list.filter((v) => v !== value) : [...(list ?? []), value];

/** Filter panel. All state lives in the URL, so every filtered view is shareable. */
export default function Filters({ query, facets, total, swatches }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  const update = (next: CatalogueQuery) =>
    startTransition(() => router.replace(`${pathname}${toSearch(next)}`, { scroll: false }));

  const activeCount =
    (query.category ? 1 : 0) +
    (query.sizes?.length ?? 0) +
    (query.colors?.length ?? 0) +
    (query.fibres?.length ?? 0) +
    (query.inStockOnly ? 1 : 0) +
    (query.minPrice !== undefined || query.maxPrice !== undefined ? 1 : 0);

  return (
    <>
      <div className="toolbar" data-pending={pending || undefined}>
        <button className="text-btn" onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-controls="filter-panel">
          Filters{activeCount ? ` (${activeCount})` : ""}
        </button>
        <span className="muted">{total} {total === 1 ? "product" : "products"}</span>
        <label className="sort">
          <span className="sr-only">Sort by</span>
          <select value={query.sort ?? "featured"} onChange={(e) => update({ ...query, sort: e.target.value as SortKey })}>
            {sorts.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="category-tabs" role="list">
        <button role="listitem" className={!query.category ? "is-active" : ""} onClick={() => update({ ...query, category: undefined })}>
          All
        </button>
        {facets.categories.map((c) => (
          <button
            role="listitem"
            key={c.value}
            className={query.category === c.value ? "is-active" : ""}
            onClick={() => update({ ...query, category: query.category === c.value ? undefined : (c.value as Category) })}
          >
            {categoryLabel[c.value as Category]} <span className="muted">{c.count}</span>
          </button>
        ))}
      </div>

      <div id="filter-panel" className={`filter-panel${open ? " is-open" : ""}`}>
        <fieldset>
          <legend>Size</legend>
          <div className="chip-row">
            {facets.sizes.map((s) => (
              <button
                key={s.value}
                className={`chip${query.sizes?.includes(s.value as Size) ? " is-active" : ""}`}
                aria-pressed={query.sizes?.includes(s.value as Size)}
                onClick={() => update({ ...query, sizes: toggle(query.sizes, s.value as Size) })}
              >
                {s.value === "ONE" ? "One size" : s.value}
              </button>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend>Colour</legend>
          <div className="chip-row">
            {facets.colors.map((c) => (
              <button
                key={c.value}
                className={`chip chip-color${query.colors?.includes(c.value) ? " is-active" : ""}`}
                aria-pressed={query.colors?.includes(c.value)}
                onClick={() => update({ ...query, colors: toggle(query.colors, c.value) })}
              >
                <span className="dot" style={{ background: swatches[c.value] }} aria-hidden="true" />
                {c.value} <span className="muted">{c.count}</span>
              </button>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend>Fibre</legend>
          <div className="chip-row">
            {facets.fibres.map((f) => (
              <button
                key={f.value}
                className={`chip${query.fibres?.includes(f.value) ? " is-active" : ""}`}
                aria-pressed={query.fibres?.includes(f.value)}
                onClick={() => update({ ...query, fibres: toggle(query.fibres, f.value) })}
              >
                {f.value} <span className="muted">{f.count}</span>
              </button>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend>Price (€)</legend>
          <form
            className="price-row"
            onSubmit={(e) => {
              e.preventDefault();
              const data = new FormData(e.currentTarget);
              const n = (k: string) => (data.get(k) ? Number(data.get(k)) : undefined);
              update({ ...query, minPrice: n("min"), maxPrice: n("max") });
            }}
          >
            <input name="min" type="number" min={0} placeholder="Min" defaultValue={query.minPrice} aria-label="Minimum price" />
            <span>–</span>
            <input name="max" type="number" min={0} placeholder="Max" defaultValue={query.maxPrice} aria-label="Maximum price" />
            <button className="chip" type="submit">Apply</button>
          </form>
          <label className="check">
            <input type="checkbox" checked={Boolean(query.inStockOnly)} onChange={(e) => update({ ...query, inStockOnly: e.target.checked })} />
            In stock only
          </label>
        </fieldset>
        {activeCount > 0 && (
          <button className="link-btn" onClick={() => update({ q: query.q, sort: query.sort })}>
            Clear all filters
          </button>
        )}
      </div>
    </>
  );
}
