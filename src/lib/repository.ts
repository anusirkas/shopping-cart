import "server-only";
import { asc, desc } from "drizzle-orm";
import { cache } from "react";
import { catalogue as seedCatalogue } from "@/data/catalogue";
import { getDb, type Db } from "@/lib/db/client";
import { colorways, orders, passportFibres, supplyStages } from "@/lib/db/schema";
import type { Construction, Product, Silhouette, Size, SupplyStage } from "@/lib/types";

/**
 * Catalogue data access. Reads from Postgres (Neon) when DATABASE_URL is set,
 * otherwise from the bundled seed catalogue, so the demo never goes down.
 *
 * The catalogue is small (~30 products), so it is loaded in one relational query
 * and filtered in memory by `queryCatalogue`. At a few thousand SKUs the filters
 * would move into SQL with indexes on category, fibre and colour.
 */
export const getCatalogue = cache(async (): Promise<Product[]> => {
  const db = getDb();
  if (!db) return seedCatalogue;
  try {
    return await loadFromDb(db);
  } catch (err) {
    // a cold or unreachable database shouldn't take browsing down; checkout
    // uses getCatalogueForCheckout, which never falls back
    console.error("Catalogue query failed, serving the bundled catalogue", err);
    return seedCatalogue;
  }
});

/** Live stock for checkout: fails loudly instead of trusting bundled data. */
export async function getCatalogueForCheckout(): Promise<Product[]> {
  const db = getDb();
  return db ? loadFromDb(db) : seedCatalogue;
}

async function loadFromDb(db: Db): Promise<Product[]> {
  const rows = await db.query.products.findMany({
    with: {
      colorways: { orderBy: [asc(colorways.position)] },
      variants: true,
      passport: {
        with: {
          fibres: { orderBy: [asc(passportFibres.id)] },
          stages: { orderBy: [asc(supplyStages.position)] },
        },
      },
    },
  });

  const sizeOrder: Size[] = ["XS", "S", "M", "L", "XL", "ONE"];
  return rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    name: r.name,
    category: r.category,
    silhouette: r.silhouette as Silhouette,
    construction: r.construction as Construction,
    description: r.description,
    priceCents: r.priceCents,
    fit: r.fit,
    stretch: r.stretch,
    isNew: r.isNew,
    createdAt: r.createdAt.toISOString(),
    colorways: r.colorways.map((c) => ({ name: c.name, hex: c.hex })),
    sizes: sizeOrder.filter((s) => r.variants.some((v) => v.size === s)),
    variants: r.variants.map((v) => ({ sku: v.sku, colorway: v.colorway, size: v.size, stock: v.stock })),
    passport: {
      id: r.id,
      fibres: r.passport.fibres.map((f) => ({ fibre: f.fibre, percent: f.percent, origin: f.origin })),
      stages: r.passport.stages.map((s) => ({ stage: s.stage as SupplyStage["stage"], facility: s.facility, country: s.country })),
      certifications: r.passport.certifications,
      care: r.passport.care,
      repair: r.passport.repair,
      endOfLife: r.passport.endOfLife,
      footprint: { co2Kg: r.passport.co2Kg, waterL: r.passport.waterL },
    },
  }));
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  return (await getCatalogue()).find((p) => p.slug === slug);
}

export async function getProductByPassportId(id: string): Promise<Product | undefined> {
  return (await getCatalogue()).find((p) => p.passport.id.toLowerCase() === id.toLowerCase());
}

export type OrderSummary = {
  id: string;
  status: "pending" | "paid" | "cancelled";
  totalCents: number;
  items: number;
  lines: { name: string; sku: string; quantity: number }[];
  createdAt: string;
};

/** Recent orders for the admin. Customer emails are deliberately left out. */
export async function getRecentOrders(limit = 30): Promise<OrderSummary[]> {
  const db = getDb();
  if (!db) return [];
  const rows = await db.select().from(orders).orderBy(desc(orders.createdAt)).limit(limit);
  return rows.map((o) => ({
    id: o.id,
    status: o.status,
    totalCents: o.totalCents,
    items: o.lines.reduce((n, l) => n + l.quantity, 0),
    lines: o.lines.map(({ name, sku, quantity }) => ({ name, sku, quantity })),
    createdAt: o.createdAt.toISOString(),
  }));
}
