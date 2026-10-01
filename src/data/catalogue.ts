import { specs } from "@/data/silhouettes";
import type { Category, Colorway, Construction, Fibre, Fit, Passport, Product, Silhouette, SupplyStage } from "@/lib/types";

/* ---------- Colour library ---------- */
const C = {
  ecru: { name: "Ecru", hex: "#ece5d3" },
  ivory: { name: "Ivory", hex: "#f3efe4" },
  charcoal: { name: "Charcoal", hex: "#3a3a3c" },
  black: { name: "Black", hex: "#1d1d1f" },
  camel: { name: "Camel", hex: "#b98b5e" },
  bordeaux: { name: "Bordeaux", hex: "#5c1a2b" },
  plum: { name: "Plum", hex: "#5a2e4a" },
  forest: { name: "Forest", hex: "#2f4a3a" },
  sage: { name: "Sage", hex: "#9aa98c" },
  sky: { name: "Sky", hex: "#a9c3d9" },
  navy: { name: "Navy", hex: "#1f2a44" },
  butter: { name: "Butter", hex: "#f1d98a" },
  rust: { name: "Rust", hex: "#a4522d" },
  stone: { name: "Stone", hex: "#a8a39a" },
  cobalt: { name: "Cobalt", hex: "#2d4ba0" },
  rose: { name: "Dusty rose", hex: "#c99a9a" },
} satisfies Record<string, Colorway>;

/* ---------- Supply chains ---------- */
const chains: Record<string, SupplyStage[]> = {
  merinoEE: [
    { stage: "Fibre", facility: "Mulesing-free merino farms", country: "Uruguay" },
    { stage: "Spinning", facility: "Biella yarn mill", country: "Italy" },
    { stage: "Knitting", facility: "Auro knit studio", country: "Estonia" },
    { stage: "Finishing", facility: "Auro knit studio", country: "Estonia" },
  ],
  cashmerePT: [
    { stage: "Fibre", facility: "Herder cooperative", country: "Mongolia" },
    { stage: "Spinning", facility: "Scottish Borders mill", country: "United Kingdom" },
    { stage: "Knitting", facility: "Family knitwear factory", country: "Portugal" },
    { stage: "Finishing", facility: "Family knitwear factory", country: "Portugal" },
  ],
  linenLT: [
    { stage: "Fibre", facility: "Flax growers, Normandy", country: "France" },
    { stage: "Spinning", facility: "Wet-spinning mill", country: "Lithuania" },
    { stage: "Weaving", facility: "Linen weavers", country: "Lithuania" },
    { stage: "Cut & sew", facility: "Atelier partner", country: "Lithuania" },
  ],
  woolIT: [
    { stage: "Fibre", facility: "Responsible Wool farms", country: "New Zealand" },
    { stage: "Spinning", facility: "Prato worsted mill", country: "Italy" },
    { stage: "Weaving", facility: "Prato weaving mill", country: "Italy" },
    { stage: "Cut & sew", facility: "Tailoring workshop", country: "Portugal" },
  ],
  cottonPT: [
    { stage: "Fibre", facility: "Organic cotton farms", country: "Türkiye" },
    { stage: "Spinning", facility: "Ring-spinning mill", country: "Portugal" },
    { stage: "Knitting", facility: "Jersey knitting mill", country: "Portugal" },
    { stage: "Dyeing", facility: "Closed-loop dye house", country: "Portugal" },
    { stage: "Cut & sew", facility: "Atelier partner", country: "Portugal" },
  ],
  silkIT: [
    { stage: "Fibre", facility: "Sericulture cooperative", country: "China" },
    { stage: "Weaving", facility: "Como silk weavers", country: "Italy" },
    { stage: "Dyeing", facility: "Como dye house", country: "Italy" },
    { stage: "Cut & sew", facility: "Atelier partner", country: "Italy" },
  ],
  tencelPT: [
    { stage: "Fibre", facility: "Lenzing lyocell plant", country: "Austria" },
    { stage: "Weaving", facility: "Fluid-fabric mill", country: "Portugal" },
    { stage: "Cut & sew", facility: "Atelier partner", country: "Portugal" },
  ],
  canvasEE: [
    { stage: "Fibre", facility: "Recycled cotton offcuts", country: "Estonia" },
    { stage: "Weaving", facility: "Canvas mill", country: "Latvia" },
    { stage: "Cut & sew", facility: "Auro workroom", country: "Estonia" },
  ],
};

/* Typical origin for secondary fibres; the main fibre takes the chain's fibre country. */
const FIBRE_ORIGIN: Record<string, string> = {
  Cashmere: "Mongolia",
  Alpaca: "Peru",
  Elastane: "Germany",
  "Recycled polyamide": "Italy",
  "Organic cotton": "Türkiye",
  Lyocell: "Austria",
};

/* ---------- Illustrative footprint factors per kg of fibre ---------- */
const FACTORS: Record<string, { co2: number; water: number }> = {
  "Merino wool": { co2: 20, water: 500 },
  "Recycled wool": { co2: 4, water: 50 },
  Cashmere: { co2: 38, water: 700 },
  Linen: { co2: 4.5, water: 600 },
  "Organic cotton": { co2: 3.8, water: 2800 },
  "Recycled cotton": { co2: 1.5, water: 100 },
  Silk: { co2: 25, water: 1500 },
  Lyocell: { co2: 3, water: 250 },
  Alpaca: { co2: 15, water: 350 },
  Elastane: { co2: 20, water: 150 },
  "Recycled polyamide": { co2: 3.5, water: 80 },
};

const CARE: Record<Construction, string[]> = {
  knit: ["Hand wash cold or wool cycle", "Dry flat in shape", "De-pill with a comb", "Store folded, never hung"],
  rib: ["Hand wash cold or wool cycle", "Dry flat in shape", "Store folded"],
  twill: ["Dry clean or air between wears", "Steam to refresh", "Brush with a garment brush"],
  "plain-weave": ["Machine wash 30°C", "Line dry", "Iron damp for crisp finish"],
  satin: ["Hand wash cold", "Do not wring", "Iron on silk setting, reverse side"],
  canvas: ["Spot clean", "Machine wash 30°C if needed", "Air dry"],
};

const REPAIR: Record<Construction, string> = {
  knit: "Free darning for holes and snags, plus a spare yarn card in every box.",
  rib: "Free darning for holes and snags, plus a spare yarn card in every box.",
  twill: "Lifetime button replacement and seam repairs at cost in our partner workshop.",
  "plain-weave": "Free seam and button repairs for two years.",
  satin: "Seam repairs at cost; we keep matching thread for every season.",
  canvas: "Handle and seam repairs for life.",
};

/* ---------- Product definitions ---------- */
type Def = {
  name: string;
  silhouette: Silhouette;
  category: Category;
  construction: Construction;
  price: number;
  fit: Fit;
  stretch: number;
  fibres: [string, number][];
  chain: keyof typeof chains;
  colors: Colorway[];
  certs: string[];
  description: string;
  isNew?: boolean;
};

const defs: Def[] = [
  { name: "Vale Crew", silhouette: "crew", category: "knitwear", construction: "knit", price: 220, fit: "relaxed", stretch: 0.6, fibres: [["Merino wool", 100]], chain: "merinoEE", colors: [C.ecru, C.charcoal, C.butter], certs: ["ZQ Merino", "OEKO-TEX Standard 100"], description: "A relaxed crew in extra-fine merino, knitted in Tallinn on a 12-gauge machine. Dropped shoulders and a deep rib hem.", isNew: true },
  { name: "Saare Turtleneck", silhouette: "turtleneck", category: "knitwear", construction: "rib", price: 290, fit: "slim", stretch: 0.8, fibres: [["Cashmere", 100]], chain: "cashmerePT", colors: [C.black, C.camel, C.plum], certs: ["Good Cashmere Standard"], description: "Fine-rib cashmere turtleneck with a fold-over collar. Close to the body, made for layering under tailoring." },
  { name: "Lumi Cardigan", silhouette: "cardigan", category: "knitwear", construction: "knit", price: 260, fit: "oversized", stretch: 0.6, fibres: [["Merino wool", 70], ["Alpaca", 30]], chain: "merinoEE", colors: [C.ivory, C.sage, C.rust], certs: ["ZQ Merino", "RAS"], description: "An oversized V-neck cardigan in a soft merino-alpaca blend with horn buttons and patch pockets.", isNew: true },
  { name: "Mere Crew", silhouette: "crew", category: "knitwear", construction: "knit", price: 180, fit: "regular", stretch: 0.6, fibres: [["Recycled wool", 80], ["Recycled polyamide", 20]], chain: "merinoEE", colors: [C.navy, C.stone, C.cobalt], certs: ["Global Recycled Standard"], description: "Classic crew spun from post-consumer wool. Regular fit, saddle shoulders." },
  { name: "Halla Turtleneck", silhouette: "turtleneck", category: "knitwear", construction: "rib", price: 190, fit: "regular", stretch: 0.8, fibres: [["Merino wool", 100]], chain: "merinoEE", colors: [C.ecru, C.forest, C.bordeaux], certs: ["ZQ Merino"], description: "Mid-weight merino turtleneck in a 2x2 rib. The everyday base layer." },
  { name: "Pilv Cardigan", silhouette: "cardigan", category: "knitwear", construction: "knit", price: 340, fit: "relaxed", stretch: 0.6, fibres: [["Cashmere", 100]], chain: "cashmerePT", colors: [C.rose, C.charcoal], certs: ["Good Cashmere Standard"], description: "Relaxed cashmere cardigan with mother-of-pearl buttons. Light enough for summer evenings." },
  { name: "Põhja Coat", silhouette: "coat", category: "outerwear", construction: "twill", price: 690, fit: "oversized", stretch: 0.05, fibres: [["Merino wool", 80], ["Cashmere", 20]], chain: "woolIT", colors: [C.camel, C.black, C.charcoal], certs: ["Responsible Wool Standard"], description: "Double-faced wool-cashmere coat, unlined and hand-finished. Dropped shoulder, belted waist.", isNew: true },
  { name: "Raba Coat", silhouette: "coat", category: "outerwear", construction: "twill", price: 520, fit: "regular", stretch: 0.03, fibres: [["Recycled wool", 70], ["Recycled polyamide", 30]], chain: "woolIT", colors: [C.forest, C.navy], certs: ["Global Recycled Standard"], description: "A single-breasted coat in recycled wool twill with a storm flap and deep pockets." },
  { name: "Kivi Blazer", silhouette: "blazer", category: "outerwear", construction: "twill", price: 420, fit: "regular", stretch: 0.05, fibres: [["Merino wool", 100]], chain: "woolIT", colors: [C.charcoal, C.stone, C.black], certs: ["Responsible Wool Standard"], description: "Soft-shouldered blazer in tropical-weight wool. Half-lined for movement." },
  { name: "Linna Blazer", silhouette: "blazer", category: "outerwear", construction: "plain-weave", price: 360, fit: "relaxed", stretch: 0.02, fibres: [["Linen", 100]], chain: "linenLT", colors: [C.ecru, C.sky], certs: ["European Flax", "OEKO-TEX Standard 100"], description: "Unstructured linen blazer for warm days. Patch pockets, no shoulder pads." },
  { name: "Liiv Shirt", silhouette: "shirt", category: "shirts", construction: "plain-weave", price: 140, fit: "relaxed", stretch: 0.02, fibres: [["Linen", 100]], chain: "linenLT", colors: [C.ivory, C.sky, C.sage], certs: ["European Flax"], description: "A relaxed linen shirt, garment-washed for softness. Mother-of-pearl buttons.", isNew: true },
  { name: "Sõna Shirt", silhouette: "shirt", category: "shirts", construction: "plain-weave", price: 120, fit: "regular", stretch: 0.03, fibres: [["Organic cotton", 100]], chain: "cottonPT", colors: [C.ivory, C.cobalt, C.butter], certs: ["GOTS"], description: "Crisp organic poplin shirt with a classic collar. Regular fit." },
  { name: "Siid Shirt", silhouette: "shirt", category: "shirts", construction: "satin", price: 260, fit: "relaxed", stretch: 0.02, fibres: [["Silk", 100]], chain: "silkIT", colors: [C.ivory, C.bordeaux, C.black], certs: ["OEKO-TEX Standard 100"], description: "Sand-washed silk shirt with a concealed placket. Fluid and matte." },
  { name: "Aja Tee", silhouette: "tee", category: "shirts", construction: "knit", price: 60, fit: "regular", stretch: 0.5, fibres: [["Organic cotton", 100]], chain: "cottonPT", colors: [C.ivory, C.black, C.stone, C.butter], certs: ["GOTS"], description: "Heavyweight organic cotton tee, 220 g/m². A ribbed neck that keeps its shape." },
  { name: "Udu Tee", silhouette: "tee", category: "shirts", construction: "knit", price: 70, fit: "slim", stretch: 0.55, fibres: [["Lyocell", 60], ["Organic cotton", 40]], chain: "tencelPT", colors: [C.sage, C.sky, C.ecru], certs: ["FSC", "GOTS"], description: "A fitted tee in a cool lyocell-cotton blend with a subtle sheen." },
  { name: "Öö Slip Dress", silhouette: "slip-dress", category: "dresses", construction: "satin", price: 320, fit: "regular", stretch: 0.03, fibres: [["Silk", 100]], chain: "silkIT", colors: [C.black, C.bordeaux, C.butter], certs: ["OEKO-TEX Standard 100"], description: "Bias-cut silk slip dress with adjustable straps. Midi length.", isNew: true },
  { name: "Vesi Slip Dress", silhouette: "slip-dress", category: "dresses", construction: "satin", price: 180, fit: "relaxed", stretch: 0.03, fibres: [["Lyocell", 100]], chain: "tencelPT", colors: [C.sage, C.navy], certs: ["FSC"], description: "A fluid lyocell slip with a cowl neckline and relaxed, easy fit." },
  { name: "Talv Knit Dress", silhouette: "knit-dress", category: "dresses", construction: "rib", price: 310, fit: "slim", stretch: 0.8, fibres: [["Merino wool", 100]], chain: "merinoEE", colors: [C.charcoal, C.camel, C.plum], certs: ["ZQ Merino"], description: "A long rib-knit dress that follows the body. Fully fashioned in Tallinn." },
  { name: "Sammal Knit Dress", silhouette: "knit-dress", category: "dresses", construction: "knit", price: 280, fit: "relaxed", stretch: 0.6, fibres: [["Merino wool", 70], ["Alpaca", 30]], chain: "merinoEE", colors: [C.forest, C.ecru], certs: ["ZQ Merino", "RAS"], description: "Relaxed jumper dress in a brushed merino-alpaca blend." },
  { name: "Laine Wide Trouser", silhouette: "wide-trouser", category: "trousers", construction: "twill", price: 240, fit: "relaxed", stretch: 0.05, fibres: [["Merino wool", 100]], chain: "woolIT", colors: [C.charcoal, C.camel, C.black], certs: ["Responsible Wool Standard"], description: "High-waisted wide-leg trouser in wool twill with double pleats and a long rise.", isNew: true },
  { name: "Põld Wide Trouser", silhouette: "wide-trouser", category: "trousers", construction: "plain-weave", price: 160, fit: "relaxed", stretch: 0.02, fibres: [["Linen", 100]], chain: "linenLT", colors: [C.ecru, C.rust], certs: ["European Flax"], description: "Drawstring linen trouser with a wide leg. Made for heat." },
  { name: "Tee Straight Trouser", silhouette: "straight-trouser", category: "trousers", construction: "twill", price: 190, fit: "regular", stretch: 0.15, fibres: [["Organic cotton", 97], ["Elastane", 3]], chain: "cottonPT", colors: [C.stone, C.navy, C.black], certs: ["GOTS"], description: "Straight-leg trouser in a cotton twill with a little stretch for comfort." },
  { name: "Ranna Straight Trouser", silhouette: "straight-trouser", category: "trousers", construction: "plain-weave", price: 170, fit: "slim", stretch: 0.02, fibres: [["Linen", 55], ["Organic cotton", 45]], chain: "linenLT", colors: [C.ecru, C.sage], certs: ["European Flax"], description: "A slim, cropped linen-cotton trouser with a flat front." },
  { name: "Õie Midi Skirt", silhouette: "midi-skirt", category: "skirts", construction: "satin", price: 210, fit: "regular", stretch: 0.03, fibres: [["Silk", 100]], chain: "silkIT", colors: [C.butter, C.black, C.plum], certs: ["OEKO-TEX Standard 100"], description: "Bias-cut silk midi skirt with an elasticated back waist." },
  { name: "Metsa Midi Skirt", silhouette: "midi-skirt", category: "skirts", construction: "twill", price: 230, fit: "regular", stretch: 0.05, fibres: [["Recycled wool", 100]], chain: "woolIT", colors: [C.forest, C.charcoal], certs: ["Global Recycled Standard"], description: "A-line pleated skirt in recycled wool flannel." },
  { name: "Tuul Scarf", silhouette: "scarf", category: "accessories", construction: "knit", price: 150, fit: "regular", stretch: 0.6, fibres: [["Cashmere", 100]], chain: "cashmerePT", colors: [C.camel, C.bordeaux, C.ivory], certs: ["Good Cashmere Standard"], description: "A long cashmere scarf with fringed ends. 190 cm." },
  { name: "Udu Scarf", silhouette: "scarf", category: "accessories", construction: "plain-weave", price: 90, fit: "regular", stretch: 0.02, fibres: [["Linen", 100]], chain: "linenLT", colors: [C.sky, C.ecru], certs: ["European Flax"], description: "A light, open-weave linen scarf for spring." },
  { name: "Turg Tote", silhouette: "tote", category: "accessories", construction: "canvas", price: 85, fit: "regular", stretch: 0, fibres: [["Recycled cotton", 100]], chain: "canvasEE", colors: [C.ecru, C.black, C.forest], certs: ["Global Recycled Standard"], description: "Heavy canvas tote woven from cotton offcuts. Inside pocket, long handles.", isNew: true },
  { name: "Hõbe Beanie", silhouette: "beanie", category: "accessories", construction: "rib", price: 70, fit: "regular", stretch: 0.9, fibres: [["Merino wool", 100]], chain: "merinoEE", colors: [C.butter, C.charcoal, C.rust, C.cobalt], certs: ["ZQ Merino"], description: "A chunky merino rib beanie with a deep turn-up." },
];

/* ---------- Build products ---------- */
const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

/** Deterministic pseudo-random stock so the catalogue is the same on every build. */
function stockFor(key: string): number {
  let h = 0;
  for (const ch of key) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const n = h % 13;
  return n < 2 ? 0 : n; // roughly 1 in 6 variants sold out
}

function footprint(fibres: Fibre[], weightKg: number) {
  let co2 = 0;
  let water = 0;
  for (const f of fibres) {
    const factor = FACTORS[f.fibre] ?? { co2: 10, water: 500 };
    co2 += factor.co2 * weightKg * (f.percent / 100);
    water += factor.water * weightKg * (f.percent / 100);
  }
  return { co2Kg: Math.round(co2 * 10) / 10, waterL: Math.round(water) };
}

function build(def: Def, index: number): Product {
  const slug = slugify(def.name);
  const spec = specs[def.silhouette];
  const chainOrigin = chains[def.chain].find((s) => s.stage === "Fibre")?.country ?? "Unknown";
  const fibres: Fibre[] = def.fibres.map(([fibre, percent], i) => ({
    fibre,
    percent,
    origin: i === 0 ? chainOrigin : (FIBRE_ORIGIN[fibre] ?? chainOrigin),
  }));
  const passport: Passport = {
    id: `AU-${String(index + 1).padStart(3, "0")}-${def.silhouette.slice(0, 3).toUpperCase()}`,
    fibres,
    stages: chains[def.chain],
    certifications: def.certs,
    care: CARE[def.construction],
    repair: REPAIR[def.construction],
    endOfLife: fibres.some((f) => f.fibre === "Elastane")
      ? "Blended with elastane: return it to Auro and we route it to textile-to-textile sorting."
      : "Mono-material or natural blend: return it to Auro for resale, repair or fibre recycling.",
    footprint: footprint(fibres, spec.weightKg),
  };
  const variants = def.colors.flatMap((c) =>
    spec.sizes.map((size) => ({
      sku: `${passport.id}-${slugify(c.name).toUpperCase()}-${size}`,
      colorway: c.name,
      size,
      stock: stockFor(`${slug}-${c.name}-${size}`),
    })),
  );
  return {
    id: passport.id,
    slug,
    name: def.name,
    category: def.category,
    silhouette: def.silhouette,
    construction: def.construction,
    description: def.description,
    priceCents: def.price * 100,
    fit: def.fit,
    stretch: def.stretch,
    colorways: def.colors,
    sizes: spec.sizes,
    variants,
    passport,
    isNew: Boolean(def.isNew),
    // spread creation dates so "newest" sorting is meaningful
    createdAt: new Date(Date.UTC(2026, 8, 30) - index * 86_400_000 * (def.isNew ? 1 : 9)).toISOString(),
  };
}

export const catalogue: Product[] = defs.map(build);
