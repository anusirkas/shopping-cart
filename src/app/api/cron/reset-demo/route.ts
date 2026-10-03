import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getDb } from "@/lib/db/client";
import { resetDemoStock } from "@/lib/demo-reset";

/**
 * Nightly Vercel cron: puts demo stock back so visitors' admin edits never
 * leave the shop broken. Restoring seed stock is idempotent and harmless, but
 * when CRON_SECRET is set only Vercel's signed cron call is accepted.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const db = getDb();
  if (!db) return NextResponse.json({ skipped: "no database" });

  const variants = await resetDemoStock(db);
  revalidatePath("/product/[slug]", "page");
  revalidatePath("/admin");
  return NextResponse.json({ reset: variants });
}
