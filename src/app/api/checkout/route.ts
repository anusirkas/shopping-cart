import { NextResponse } from "next/server";
import { validateCart, type RequestedLine } from "@/lib/checkout";
import { getDb } from "@/lib/db/client";
import { orders } from "@/lib/db/schema";
import { getCatalogueForCheckout } from "@/lib/repository";
import { getStripe } from "@/lib/stripe";

/** Creates a Stripe Checkout session (test mode) for the bag. */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid-json" }, { status: 400 });
  }
  const requested = (body as { lines?: unknown })?.lines;
  if (!Array.isArray(requested) || requested.length > 50) {
    return NextResponse.json({ error: "invalid-bag" }, { status: 400 });
  }
  const lines: RequestedLine[] = requested
    .filter((l): l is RequestedLine => typeof l?.sku === "string" && typeof l?.quantity === "number")
    .map((l) => ({ sku: l.sku, quantity: l.quantity }));

  let catalogue;
  try {
    catalogue = await getCatalogueForCheckout();
  } catch (err) {
    console.error("Checkout could not read stock", err);
    return NextResponse.json({ error: "checkout-unavailable" }, { status: 503 });
  }
  const validation = validateCart(lines, catalogue);
  if (!validation.ok) return NextResponse.json({ error: "bag-changed", details: validation.errors }, { status: 409 });

  const stripe = getStripe();
  if (!stripe) return NextResponse.json({ error: "checkout-unavailable" }, { status: 503 });

  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? new URL(request.url).origin;
  const orderId = `AUR-${Date.now().toString(36).toUpperCase()}`;

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: validation.lines.map((l) => ({
      quantity: l.quantity,
      price_data: {
        currency: "eur",
        unit_amount: l.unitCents,
        product_data: { name: l.name, description: l.description, metadata: { sku: l.sku } },
      },
    })),
    shipping_address_collection: { allowed_countries: ["EE", "LV", "LT", "FI", "SE", "DE", "FR", "NL", "GB"] },
    metadata: { orderId },
    success_url: `${origin}/order/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/bag`,
  });

  const db = getDb();
  if (db) {
    await db.insert(orders).values({
      id: orderId,
      stripeSessionId: session.id,
      totalCents: validation.totalCents,
      lines: validation.lines.map(({ sku, name, quantity, unitCents }) => ({ sku, name, quantity, unitCents })),
    });
  }

  return NextResponse.json({ url: session.url });
}
