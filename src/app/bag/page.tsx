import type { Metadata } from "next";
import BagView from "@/components/BagView";

// read the Stripe key at request time so connecting Stripe needs no rebuild
export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Bag" };

export default function BagPage() {
  return (
    <div className="page narrow">
      <div className="page-head">
        <h1>Your bag</h1>
      </div>
      <BagView checkoutEnabled={Boolean(process.env.STRIPE_SECRET_KEY)} />
    </div>
  );
}
