import Link from "next/link";
import FlatSketch from "@/components/FlatSketch";
import { formatPrice } from "@/lib/money";
import type { Product } from "@/lib/types";
import "./product-card.css";

export default function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  const [first, second] = product.colorways;
  const soldOut = product.variants.every((v) => v.stock === 0);
  const fibres = product.passport.fibres.map((f) => (f.percent === 100 ? f.fibre : `${f.percent}% ${f.fibre}`)).join(", ");

  return (
    <article className="card">
      <Link href={`/product/${product.slug}`} className="card-media" aria-label={product.name} prefetch={priority}>
        <FlatSketch silhouette={product.silhouette} construction={product.construction} color={first.hex} className="card-flat" title={`${product.name} in ${first.name}`} />
        {second && (
          <FlatSketch silhouette={product.silhouette} construction={product.construction} color={second.hex} className="card-flat card-flat-alt" title={`${product.name} in ${second.name}`} />
        )}
        {product.isNew && <span className="badge">New</span>}
        {soldOut && <span className="badge badge-muted">Sold out</span>}
      </Link>
      <div className="card-body">
        <div className="row-between">
          <Link href={`/product/${product.slug}`} className="card-name">{product.name}</Link>
          <span>{formatPrice(product.priceCents)}</span>
        </div>
        <p className="card-fibre muted">{fibres}</p>
        <ul className="swatches" aria-label="Colours">
          {product.colorways.map((c) => (
            <li key={c.name} title={c.name} style={{ background: c.hex }}>
              <span className="sr-only">{c.name}</span>
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}
