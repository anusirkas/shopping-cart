import type { Category, Construction, Fit } from "@/lib/types";

export const categoryLabel: Record<Category, string> = {
  knitwear: "Knitwear",
  outerwear: "Outerwear",
  dresses: "Dresses",
  shirts: "Shirts & Tees",
  trousers: "Trousers",
  skirts: "Skirts",
  accessories: "Accessories",
};

export const fitLabel: Record<Fit, string> = {
  slim: "Slim fit",
  regular: "Regular fit",
  relaxed: "Relaxed fit",
  oversized: "Oversized fit",
};

export const constructionLabel: Record<Construction, string> = {
  knit: "Jersey knit",
  rib: "Rib knit",
  twill: "Twill weave",
  "plain-weave": "Plain weave",
  satin: "Satin weave",
  canvas: "Canvas",
};
