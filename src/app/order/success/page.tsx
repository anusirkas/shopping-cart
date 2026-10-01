import type { Metadata } from "next";
import Link from "next/link";
import ClearBag from "@/components/ClearBag";
import { getStripe } from "@/lib/stripe";

export const metadata: Metadata = { title: "Order confirmed" };

type Props = { searchParams: Promise<{ session_id?: string }> };

export default async function SuccessPage({ searchParams }: Props) {
  const { session_id } = await searchParams;
  const stripe = getStripe();
  let email: string | null = null;
  let orderId: string | null = null;
  if (stripe && session_id) {
    try {
      const session = await stripe.checkout.sessions.retrieve(session_id);
      email = session.customer_details?.email ?? null;
      orderId = session.metadata?.orderId ?? null;
    } catch {
      /* unknown session: show the generic message */
    }
  }

  return (
    <div className="page narrow confirm">
      <ClearBag />
      <p className="eyebrow">Order confirmed</p>
      <h1>Thank you.</h1>
      <p>
        {orderId ? <>Your order <strong>{orderId}</strong> is confirmed</> : "Your order is confirmed"}
        {email ? <> and a receipt would go to {email}</> : ""}. This is a demo store, so nothing will be shipped and no real payment was taken.
      </p>
      <Link href="/passport" className="btn btn-outline">Read your garments’ passports</Link>
    </div>
  );
}
