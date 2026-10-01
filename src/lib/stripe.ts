import "server-only";
import Stripe from "stripe";

let client: Stripe | null | undefined;

/** Stripe client in test mode, or null when no key is configured. */
export function getStripe(): Stripe | null {
  if (client === undefined) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (key && !key.startsWith("sk_test_")) throw new Error("Auro is a demo: only Stripe test-mode keys (sk_test_…) are allowed.");
    client = key ? new Stripe(key) : null;
  }
  return client;
}
