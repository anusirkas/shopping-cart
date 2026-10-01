"use client";

import { useEffect } from "react";
import { useCart } from "@/components/CartProvider";

/** Empties the bag once an order is confirmed. */
export default function ClearBag() {
  const { clear } = useCart();
  useEffect(() => clear(), [clear]);
  return null;
}
