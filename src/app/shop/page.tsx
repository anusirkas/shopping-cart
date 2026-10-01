import type { Metadata } from "next";
import Filters from "@/components/Filters";
import ProductCard from "@/components/ProductCard";
import { parseQuery, queryCatalogue } from "@/lib/catalogue-query";
import { categoryLabel } from "@/lib/labels";
import { getCatalogue } from "@/lib/repository";
import "./shop.css";

export const metadata: Metadata = { title: "Shop" };

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function ShopPage({ searchParams }: Props) {
  const query = parseQuery(await searchParams);
  const catalogue = await getCatalogue();
  const result = queryCatalogue(catalogue, query);
  const swatches = Object.fromEntries(catalogue.flatMap((p) => p.colorways.map((c) => [c.name, c.hex])));

  const title = query.q ? `“${query.q}”` : query.category ? categoryLabel[query.category] : "Ready to wear";

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <p className="eyebrow">{query.q ? "Search" : "Shop"}</p>
          <h1>{title}</h1>
        </div>
      </div>
      <Filters query={query} facets={result.facets} total={result.total} swatches={swatches} />
      {result.items.length ? (
        <div className="grid">
          {result.items.map((p, i) => (
            <ProductCard key={p.id} product={p} priority={i < 4} />
          ))}
        </div>
      ) : (
        <div className="empty">
          <p>Nothing matches those filters.</p>
          <a href="/shop" className="btn btn-outline">Clear filters</a>
        </div>
      )}
    </div>
  );
}
