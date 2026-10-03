/**
 * Loads the bundled catalogue into Postgres. Run after `npm run db:push`:
 *   npm run db:seed
 * Safe to re-run: it clears catalogue tables first (orders are kept).
 */
import { existsSync } from "node:fs";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { catalogue } from "../src/data/catalogue";
import * as s from "../src/lib/db/schema";

if (existsSync(".env.local")) process.loadEnvFile(".env.local");

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set. Add it to .env.local first.");
  process.exit(1);
}

const db = drizzle(neon(url), { schema: s });

async function main() {
  await db.delete(s.products); // cascades to colorways, variants, passports, fibres, stages

  await db.insert(s.products).values(
    catalogue.map((p) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      category: p.category,
      silhouette: p.silhouette,
      construction: p.construction,
      description: p.description,
      priceCents: p.priceCents,
      fit: p.fit,
      stretch: p.stretch,
      isNew: p.isNew,
      createdAt: new Date(p.createdAt),
    })),
  );
  await db.insert(s.colorways).values(
    catalogue.flatMap((p) => p.colorways.map((c, position) => ({ productId: p.id, name: c.name, hex: c.hex, position }))),
  );
  await db.insert(s.variants).values(catalogue.flatMap((p) => p.variants.map((v) => ({ ...v, productId: p.id }))));
  await db.insert(s.passports).values(
    catalogue.map((p) => ({
      productId: p.id,
      certifications: p.passport.certifications,
      care: p.passport.care,
      repair: p.passport.repair,
      endOfLife: p.passport.endOfLife,
      co2Kg: p.passport.footprint.co2Kg,
      waterL: p.passport.footprint.waterL,
    })),
  );
  await db.insert(s.passportFibres).values(catalogue.flatMap((p) => p.passport.fibres.map((f) => ({ ...f, productId: p.id }))));
  await db.insert(s.supplyStages).values(
    catalogue.flatMap((p) => p.passport.stages.map((st, position) => ({ ...st, position, productId: p.id }))),
  );

  const variantCount = catalogue.reduce((n, p) => n + p.variants.length, 0);
  console.log(`Seeded ${catalogue.length} products and ${variantCount} variants.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
