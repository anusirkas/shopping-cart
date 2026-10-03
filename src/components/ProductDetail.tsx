"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { useCart } from "@/components/CartProvider";
import FitFinder from "@/components/FitFinder";
import FlatSketch from "@/components/FlatSketch";
import { formatPrice } from "@/lib/money";
import { LOW_STOCK } from "@/lib/stock";
import type { Product, Size } from "@/lib/types";

// three.js is ~600 kB, so the 3D view only loads when someone asks for it
const FabricViewer = dynamic(() => import("@/components/FabricViewer"), {
  ssr: false,
  loading: () => <div className="fabric-viewer fabric-loading">Weaving the fabric…</div>,
});

type Props = { product: Product; children?: React.ReactNode };

/** Interactive part of the product page: colourway, size and add to bag. */
export default function ProductDetail({ product, children }: Props) {
  const { add } = useCart();
  const [color, setColor] = useState(product.colorways[0]);
  const oneSize = product.sizes.length === 1;
  const [size, setSize] = useState<Size | null>(oneSize ? product.sizes[0] : null);
  const [error, setError] = useState(false);
  const [view, setView] = useState<"flat" | "fabric">("flat");

  const stockOf = (s: Size) => product.variants.find((v) => v.colorway === color.name && v.size === s)?.stock ?? 0;
  const variant = size ? product.variants.find((v) => v.colorway === color.name && v.size === size) : undefined;
  const available = variant ? variant.stock : 0;

  const onAdd = () => {
    if (!variant) {
      setError(true);
      return;
    }
    add({
      sku: variant.sku,
      slug: product.slug,
      name: product.name,
      colorway: color.name,
      hex: color.hex,
      size: variant.size === "ONE" ? "One size" : variant.size,
      silhouette: product.silhouette,
      construction: product.construction,
      unitCents: product.priceCents,
      maxQuantity: variant.stock,
    });
  };

  return (
    <div className="pdp">
      <div className="pdp-media">
        {view === "flat" ? (
          <FlatSketch silhouette={product.silhouette} construction={product.construction} color={color.hex} className="pdp-flat" title={`${product.name} in ${color.name}`} />
        ) : (
          <FabricViewer color={color.hex} construction={product.construction} label={`${color.name} ${product.name} fabric`} />
        )}
        <div className="view-toggle" role="group" aria-label="Product view">
          <button aria-pressed={view === "flat"} onClick={() => setView("flat")}>Technical flat</button>
          <button aria-pressed={view === "fabric"} onClick={() => setView("fabric")}>3D fabric</button>
        </div>
        <span className="pdp-spec">{view === "flat" ? "Technical flat" : "Fabric swatch"} · {product.passport.id}</span>
      </div>

      <div className="pdp-info">
        <h1>{product.name}</h1>
        <p className="pdp-price">{formatPrice(product.priceCents)}</p>
        <p className="pdp-desc">{product.description}</p>

        <fieldset className="pdp-field">
          <legend>
            Colour <span className="muted">{color.name}</span>
          </legend>
          <div className="pdp-colors">
            {product.colorways.map((c) => (
              <button
                key={c.name}
                className={c.name === color.name ? "is-active" : ""}
                aria-pressed={c.name === color.name}
                aria-label={c.name}
                title={c.name}
                onClick={() => setColor(c)}
                style={{ background: c.hex }}
              />
            ))}
          </div>
        </fieldset>

        {!oneSize && (
          <fieldset className="pdp-field">
            <legend>Size</legend>
            <div className="pdp-sizes">
              {product.sizes.map((s) => {
                const stock = stockOf(s);
                return (
                  <button
                    key={s}
                    className={`${size === s ? "is-active" : ""}${stock === 0 ? " is-out" : ""}`}
                    aria-pressed={size === s}
                    disabled={stock === 0}
                    onClick={() => {
                      setSize(s);
                      setError(false);
                    }}
                  >
                    {s}
                    {stock === 0 && <span className="sr-only"> (sold out)</span>}
                    {stock > 0 && stock <= LOW_STOCK && <span className="size-left">{stock} left</span>}
                  </button>
                );
              })}
            </div>
            <div className="size-tools">
              <FitFinder
                product={product}
                onSelect={(s) => {
                  setSize(s);
                  setError(false);
                }}
              />
              {children}
            </div>
          </fieldset>
        )}

        <p className="pdp-stock" aria-live="polite">
          {error && <span className="warn">Choose a size first.</span>}
          {!error && size && available > 0 && available <= LOW_STOCK && <span className="warn">Only {available} left in {color.name}</span>}
          {!error && size && available === 0 && <span className="muted">Sold out in {color.name}</span>}
        </p>

        <button className="btn btn-block" onClick={onAdd} disabled={Boolean(size) && available === 0}>
          {size && available === 0 ? "Sold out" : "Add to bag"}
        </button>
      </div>
    </div>
  );
}
