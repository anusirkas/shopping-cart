import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

export type Db = ReturnType<typeof createDb>;

function createDb(url: string) {
  return drizzle(neon(url), { schema });
}

let db: Db | null | undefined;

/** Returns a Drizzle client, or null when no DATABASE_URL is configured. */
export function getDb(): Db | null {
  if (db === undefined) db = process.env.DATABASE_URL ? createDb(process.env.DATABASE_URL) : null;
  return db;
}
