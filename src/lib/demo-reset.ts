import "server-only";
import { sql } from "drizzle-orm";
import { catalogue } from "@/data/catalogue";
import type { Db } from "@/lib/db/client";

/**
 * Undoes demo edits in one statement: every variant goes back to its seeded
 * stock minus what paid orders have sold, so real (test-mode) sales still show.
 */
export async function resetDemoStock(db: Db): Promise<number> {
  const rows = catalogue.flatMap((p) => p.variants.map((v) => sql`(${v.sku}, ${v.stock}::int)`));
  await db.execute(sql`
    update variants as v
    set stock = greatest(seed.stock - coalesce(sold.quantity, 0), 0)
    from (values ${sql.join(rows, sql`, `)}) as seed(sku, stock)
    left join (
      select line->>'sku' as sku, sum((line->>'quantity')::int) as quantity
      from orders, jsonb_array_elements(orders.lines) as line
      where orders.status = 'paid'
      group by 1
    ) as sold on sold.sku = seed.sku
    where v.sku = seed.sku
  `);
  return rows.length;
}
