export type Category = "knitwear" | "outerwear" | "dresses" | "shirts" | "trousers" | "skirts" | "accessories";

export type Silhouette =
  | "crew"
  | "turtleneck"
  | "cardigan"
  | "tee"
  | "shirt"
  | "coat"
  | "blazer"
  | "slip-dress"
  | "knit-dress"
  | "wide-trouser"
  | "straight-trouser"
  | "midi-skirt"
  | "scarf"
  | "tote"
  | "beanie";

export type Fit = "slim" | "regular" | "relaxed" | "oversized";

/** Fabric structure, used for the texture on technical flats and in passports. */
export type Construction = "knit" | "rib" | "twill" | "plain-weave" | "satin" | "canvas";

export type Size = "XS" | "S" | "M" | "L" | "XL" | "ONE";

export type Fibre = { fibre: string; percent: number; origin: string };

export type SupplyStage = {
  stage: "Fibre" | "Spinning" | "Knitting" | "Weaving" | "Dyeing" | "Cut & sew" | "Finishing";
  facility: string;
  country: string;
};

export type Passport = {
  id: string;
  fibres: Fibre[];
  stages: SupplyStage[];
  certifications: string[];
  care: string[];
  repair: string;
  endOfLife: string;
  /** Illustrative estimates for the demo, not audited figures. */
  footprint: { co2Kg: number; waterL: number };
};

export type Colorway = { name: string; hex: string };

export type Variant = { sku: string; colorway: string; size: Size; stock: number };

export type Product = {
  id: string;
  slug: string;
  name: string;
  category: Category;
  silhouette: Silhouette;
  construction: Construction;
  description: string;
  priceCents: number;
  fit: Fit;
  /** 0 = rigid woven, 1 = very stretchy knit. Used by the fit finder. */
  stretch: number;
  colorways: Colorway[];
  sizes: Size[];
  variants: Variant[];
  passport: Passport;
  isNew: boolean;
  createdAt: string;
};
