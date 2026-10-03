import Link from "next/link";
import FlatSketch from "@/components/FlatSketch";
import { journal } from "@/data/editorial";
import ProductCard from "@/components/ProductCard";
import { queryCatalogue } from "@/lib/catalogue-query";
import { categoryLabel } from "@/lib/labels";
import { getCatalogue } from "@/lib/repository";
import type { Category } from "@/lib/types";
import "./home.css";

export const revalidate = 300;

// Crops are chosen per photo: `focus` for wide screens (cropped top and
// bottom) and `mobileFocus` for portrait screens (cropped at the sides)
const heroes = [
  { src: "/images/hero.jpg", focus: "50% 50%", mobileFocus: "70% 30%", alt: "Two models in white shirting lying on a stone floor" },
  { src: "/images/campaign.jpg", focus: "50% 35%", mobileFocus: "76% 40%", alt: "Black and white portrait of a woman in a silk vest and pendant, laughing on the sand" },
  { src: "/images/coat.jpg", focus: "50% 12%", mobileFocus: "38% 20%", alt: "A model in an oversized black coat, in silhouette against a white background" },
];

export default async function Home() {
  const catalogue = await getCatalogue();
  const newIn = queryCatalogue(catalogue, { sort: "newest" }).items.slice(0, 4);
  const coat = catalogue.find((p) => p.silhouette === "coat")!;
  const categories = [...new Set(catalogue.map((p) => p.category))] as Category[];

  return (
    <>
      <section className="hero" aria-label="Auro">
        <div className="hero-logo" aria-hidden="true">Auro</div>
        {heroes.map((h, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={h.src}
            src={h.src}
            alt={h.alt}
            className="hero-img"
            loading={i === 0 ? "eager" : "lazy"}
            style={{ "--focus": h.focus, "--mobile-focus": h.mobileFocus } as React.CSSProperties}
          />
        ))}
      </section>

      <section className="intro">
        <p className="eyebrow">Autumn / Winter 2026</p>
        <h1>Considered clothing, documented from fibre to finish.</h1>
        <Link href="/shop" className="btn">Shop the collection</Link>
      </section>

      <section className="home-section">
        <div className="section-head">
          <h2>New in</h2>
          <Link href="/shop?sort=newest" className="link-arrow">View all</Link>
        </div>
        <div className="home-grid">
          {newIn.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      <section className="features">
        <Link href="/passport" className="feature">
          <span className="eyebrow">01 · Transparency</span>
          <h3>A passport for every piece</h3>
          <p>Fibre origins, every factory in the chain, care, repair and an estimated footprint. Scan the QR on the care label.</p>
          <span className="link-arrow">Explore passports</span>
        </Link>
        <Link href={`/product/${coat.slug}`} className="feature">
          <span className="eyebrow">02 · Fit</span>
          <h3>Sizes chosen by measurement</h3>
          <p>Our fit finder compares your measurements with the finished garment and its designed ease, the way a technologist checks a fit sample.</p>
          <span className="link-arrow">Try it on the Põhja Coat</span>
        </Link>
        <Link href="/shop" className="feature feature-flat">
          <span className="eyebrow">03 · Drawn, not retouched</span>
          <h3>Technical flats</h3>
          <p>Every product is shown as the line drawing sent to the factory, recoloured for each colourway.</p>
          <FlatSketch silhouette="coat" construction="twill" color="#b98b5e" className="feature-sketch" />
        </Link>
      </section>

      <section className="home-section">
        <div className="section-head">
          <h2>Shop by category</h2>
        </div>
        <ul className="category-list">
          {categories.map((c) => {
            const sample = catalogue.find((p) => p.category === c)!;
            return (
              <li key={c}>
                <Link href={`/shop?category=${c}`}>
                  <span className="cat-flat">
                    <FlatSketch silhouette={sample.silhouette} construction={sample.construction} color={sample.colorways[0].hex} />
                  </span>
                  <span>{categoryLabel[c]}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="journal" aria-labelledby="journal-title">
        <h2 id="journal-title">Journal</h2>
        <ul className="journal-grid">
          {journal.map((story) => (
            <li key={story.title}>
              <Link href={story.href} className="story">
                <span className="story-media">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={story.image} alt="" loading="lazy" />
                </span>
                <h3>{story.title}</h3>
                <p>{story.text}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
