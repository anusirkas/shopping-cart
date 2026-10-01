import { relations } from "drizzle-orm";
import { boolean, integer, jsonb, pgEnum, pgTable, real, smallint, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

export const categoryEnum = pgEnum("category", ["knitwear", "outerwear", "dresses", "shirts", "trousers", "skirts", "accessories"]);
export const fitEnum = pgEnum("fit", ["slim", "regular", "relaxed", "oversized"]);
export const sizeEnum = pgEnum("size", ["XS", "S", "M", "L", "XL", "ONE"]);
export const orderStatusEnum = pgEnum("order_status", ["pending", "paid", "cancelled"]);

export const products = pgTable("products", {
  id: text("id").primaryKey(), // equals the passport id, e.g. AU-001-CRE
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  category: categoryEnum("category").notNull(),
  silhouette: text("silhouette").notNull(),
  construction: text("construction").notNull(),
  description: text("description").notNull(),
  priceCents: integer("price_cents").notNull(),
  fit: fitEnum("fit").notNull(),
  stretch: real("stretch").notNull(),
  isNew: boolean("is_new").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const colorways = pgTable(
  "colorways",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    productId: text("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    hex: text("hex").notNull(),
    position: smallint("position").notNull(),
  },
  (t) => [uniqueIndex("colorways_product_name").on(t.productId, t.name)],
);

export const variants = pgTable("variants", {
  sku: text("sku").primaryKey(),
  productId: text("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  colorway: text("colorway").notNull(),
  size: sizeEnum("size").notNull(),
  stock: integer("stock").notNull().default(0),
});

/** Digital product passport: one per product. */
export const passports = pgTable("passports", {
  productId: text("product_id").primaryKey().references(() => products.id, { onDelete: "cascade" }),
  certifications: text("certifications").array().notNull(),
  care: text("care").array().notNull(),
  repair: text("repair").notNull(),
  endOfLife: text("end_of_life").notNull(),
  co2Kg: real("co2_kg").notNull(),
  waterL: integer("water_l").notNull(),
});

export const passportFibres = pgTable("passport_fibres", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  productId: text("product_id").notNull().references(() => passports.productId, { onDelete: "cascade" }),
  fibre: text("fibre").notNull(),
  percent: smallint("percent").notNull(),
  origin: text("origin").notNull(),
});

export const supplyStages = pgTable("supply_stages", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  productId: text("product_id").notNull().references(() => passports.productId, { onDelete: "cascade" }),
  position: smallint("position").notNull(),
  stage: text("stage").notNull(),
  facility: text("facility").notNull(),
  country: text("country").notNull(),
});

export const orders = pgTable("orders", {
  id: text("id").primaryKey(),
  stripeSessionId: text("stripe_session_id").unique(),
  email: text("email"),
  status: orderStatusEnum("status").notNull().default("pending"),
  totalCents: integer("total_cents").notNull(),
  lines: jsonb("lines").$type<{ sku: string; name: string; quantity: number; unitCents: number }[]>().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const productRelations = relations(products, ({ many, one }) => ({
  colorways: many(colorways),
  variants: many(variants),
  passport: one(passports, { fields: [products.id], references: [passports.productId] }),
}));
export const colorwayRelations = relations(colorways, ({ one }) => ({
  product: one(products, { fields: [colorways.productId], references: [products.id] }),
}));
export const variantRelations = relations(variants, ({ one }) => ({
  product: one(products, { fields: [variants.productId], references: [products.id] }),
}));
export const passportRelations = relations(passports, ({ many }) => ({
  fibres: many(passportFibres),
  stages: many(supplyStages),
}));
export const passportFibreRelations = relations(passportFibres, ({ one }) => ({
  passport: one(passports, { fields: [passportFibres.productId], references: [passports.productId] }),
}));
export const supplyStageRelations = relations(supplyStages, ({ one }) => ({
  passport: one(passports, { fields: [supplyStages.productId], references: [passports.productId] }),
}));
