import { and, eq, gte, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getDb } from "@/lib/db/client";
import { orders, variants } from "@/lib/db/schema";
import { getStripe } from "@/lib/stripe";

/**
 * Stripe webhook: marks the order paid and decrements stock once payment is
 * confirmed. Stock is only taken when it is still available, so two buyers
 * racing for the last item can't drive it negative.
 */
export async function POST(request: Request) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) return NextResponse.json({ error: "not-configured" }, { status: 503 });

  const signature = request.headers.get("stripe-signature");
  if (!signature) return NextResponse.json({ error: "missing-signature" }, { status: 400 });

  let event;
  try {
    event = stripe.webhooks.constructEvent(await request.text(), signature, secret);
  } catch {
    return NextResponse.json({ error: "bad-signature" }, { status: 400 });
  }

  if (event.type !== "checkout.session.completed") return NextResponse.json({ received: true });

  const session = event.data.object;
  const db = getDb();
  if (!db) return NextResponse.json({ received: true });

  const order = await db.query.orders.findFirst({ where: eq(orders.stripeSessionId, session.id) });
  // idempotent: Stripe may deliver the same event more than once
  if (!order || order.status === "paid") return NextResponse.json({ received: true });

  for (const line of order.lines) {
    await db
      .update(variants)
      .set({ stock: sql`${variants.stock} - ${line.quantity}` })
      .where(and(eq(variants.sku, line.sku), gte(variants.stock, line.quantity)));
  }
  await db
    .update(orders)
    .set({ status: "paid", email: session.customer_details?.email ?? null })
    .where(eq(orders.id, order.id));

  // product pages are statically cached; refresh them on their next visit
  revalidatePath("/product/[slug]", "page");
  revalidatePath("/admin");

  return NextResponse.json({ received: true });
}
