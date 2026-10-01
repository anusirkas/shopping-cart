import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import QRCode from "qrcode";
import FlatSketch from "@/components/FlatSketch";
import { specs } from "@/data/silhouettes";
import { constructionLabel } from "@/lib/labels";
import { getCatalogue, getProductByPassportId } from "@/lib/repository";
import "../passport.css";

type Props = { params: Promise<{ id: string }> };

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://auro-studio.vercel.app";

export async function generateStaticParams() {
  return (await getCatalogue()).map((p) => ({ id: p.passport.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProductByPassportId((await params).id);
  return product ? { title: `Passport ${product.passport.id} · ${product.name}` } : {};
}

export default async function PassportPage({ params }: Props) {
  const product = await getProductByPassportId((await params).id);
  if (!product) notFound();
  const { passport } = product;
  const url = `${SITE}/passport/${passport.id}`;
  const qr = await QRCode.toString(url, { type: "svg", margin: 0, color: { dark: "#111111", light: "#00000000" } });

  return (
    <div className="page narrow passport">
      <header className="passport-head">
        <div>
          <p className="eyebrow">Digital product passport</p>
          <h1>{product.name}</h1>
          <p className="mono">{passport.id}</p>
        </div>
        <figure className="passport-qr">
          <div dangerouslySetInnerHTML={{ __html: qr }} aria-label={`QR code linking to ${url}`} role="img" />
          <figcaption>Scan from the care label</figcaption>
        </figure>
      </header>

      <div className="passport-grid">
        <div className="passport-flat">
          <FlatSketch silhouette={product.silhouette} construction={product.construction} color={product.colorways[0].hex} />
        </div>
        <dl className="passport-facts">
          <div><dt>Product</dt><dd>{specs[product.silhouette].label}</dd></div>
          <div><dt>Construction</dt><dd>{constructionLabel[product.construction]}</dd></div>
          <div><dt>Colourways</dt><dd>{product.colorways.map((c) => c.name).join(", ")}</dd></div>
          <div><dt>Certifications</dt><dd>{passport.certifications.join(", ")}</dd></div>
          <div>
            <dt>Shop</dt>
            <dd><Link href={`/product/${product.slug}`} className="underline">View product</Link></dd>
          </div>
        </dl>
      </div>

      <section className="passport-section">
        <h2>Composition</h2>
        <div className="composition" role="img" aria-label={passport.fibres.map((f) => `${f.percent}% ${f.fibre}`).join(", ")}>
          {passport.fibres.map((f, i) => (
            <span key={f.fibre} style={{ flexBasis: `${f.percent}%`, opacity: 1 - i * 0.3 }} />
          ))}
        </div>
        <table className="data-table">
          <thead>
            <tr><th>Fibre</th><th>Share</th><th>Origin</th></tr>
          </thead>
          <tbody>
            {passport.fibres.map((f) => (
              <tr key={f.fibre}><td>{f.fibre}</td><td>{f.percent}%</td><td>{f.origin}</td></tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="passport-section">
        <h2>Supply chain</h2>
        <ol className="timeline">
          {passport.stages.map((s, i) => (
            <li key={s.stage}>
              <span className="tl-step">{String(i + 1).padStart(2, "0")}</span>
              <div>
                <strong>{s.stage}</strong>
                <span className="muted">{s.facility}</span>
              </div>
              <span className="tl-country">{s.country}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="passport-section passport-two">
        <div>
          <h2>Care</h2>
          <ul className="plain-list">
            {passport.care.map((c) => <li key={c}>{c}</li>)}
          </ul>
        </div>
        <div>
          <h2>Repair & end of life</h2>
          <p>{passport.repair}</p>
          <p>{passport.endOfLife}</p>
        </div>
      </section>

      <section className="passport-section">
        <h2>Footprint</h2>
        <div className="footprint">
          <div><span className="big">{passport.footprint.co2Kg}</span><span className="muted">kg CO₂e</span></div>
          <div><span className="big">{passport.footprint.waterL.toLocaleString("en")}</span><span className="muted">litres of water</span></div>
        </div>
        <p className="muted small">
          Illustrative estimates for this demo: fibre-level factors × garment weight ({specs[product.silhouette].weightKg} kg). Not audited figures.
        </p>
      </section>
    </div>
  );
}
