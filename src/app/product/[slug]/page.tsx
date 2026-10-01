import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import ProductDetail from "@/components/ProductDetail";
import { measurementsFor, specs } from "@/data/silhouettes";
import { categoryLabel, constructionLabel, fitLabel } from "@/lib/labels";
import { getCatalogue, getProductBySlug } from "@/lib/repository";
import "./product.css";

export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getCatalogue()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProductBySlug((await params).slug);
  return product ? { title: product.name, description: product.description } : {};
}

export default async function ProductPage({ params }: Props) {
  const product = await getProductBySlug((await params).slug);
  if (!product) notFound();

  const spec = specs[product.silhouette];
  const rows = product.sizes.map((s) => ({ size: s, ...measurementsFor(product.silhouette, s) }));
  const cols = (["chest", "waist", "hip", "length"] as const).filter((k) => rows.some((r) => r[k] !== undefined));
  const related = (await getCatalogue()).filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);
  const { passport } = product;

  return (
    <div className="page">
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link href="/shop">Shop</Link> / <Link href={`/shop?category=${product.category}`}>{categoryLabel[product.category]}</Link> /{" "}
        <span aria-current="page">{product.name}</span>
      </nav>

      <ProductDetail product={product}>
        <details className="size-guide">
          <summary>Size guide · garment measurements</summary>
          <table>
            <thead>
              <tr>
                <th>Size</th>
                {cols.map((c) => (
                  <th key={c}>{c[0].toUpperCase() + c.slice(1)} (cm)</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.size}>
                  <td>{r.size}</td>
                  {cols.map((c) => (
                    <td key={c}>{r[c] ?? "—"}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <p className="muted">Circumferences are measured on the finished garment, not the body.</p>
        </details>
      </ProductDetail>

      <section className="pdp-sections">
        <div>
          <h2>Details</h2>
          <dl className="spec-list">
            <div><dt>Fit</dt><dd>{fitLabel[product.fit]}</dd></div>
            <div><dt>Construction</dt><dd>{constructionLabel[product.construction]}</dd></div>
            <div><dt>Composition</dt><dd>{passport.fibres.map((f) => `${f.percent}% ${f.fibre}`).join(", ")}</dd></div>
            <div><dt>Style</dt><dd>{spec.label}</dd></div>
            <div><dt>Made in</dt><dd>{passport.stages.at(-1)?.country}</dd></div>
          </dl>
        </div>
        <div>
          <h2>Product passport</h2>
          <ol className="chain">
            {passport.stages.map((s) => (
              <li key={s.stage}>
                <span className="eyebrow">{s.stage}</span>
                <span>{s.country}</span>
              </li>
            ))}
          </ol>
          <p className="muted">
            {passport.certifications.join(" · ")} · approx. {passport.footprint.co2Kg} kg CO₂e
          </p>
          <Link href={`/passport/${passport.id}`} className="btn btn-outline">Open full passport</Link>
        </div>
      </section>

      {related.length > 0 && (
        <section className="related">
          <h2>More {categoryLabel[product.category].toLowerCase()}</h2>
          <div className="grid">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
