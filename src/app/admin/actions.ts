"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getRole, signInDemo, signInOwner, signOut } from "@/lib/admin-auth";
import { getDb } from "@/lib/db/client";
import { variants } from "@/lib/db/schema";

export type ActionState = { ok: boolean; message: string } | null;

/** Demo admins can't zero out or flood the shop beyond this. */
const DEMO_MAX_STOCK = 50;

export async function login(_: ActionState, form: FormData): Promise<ActionState> {
  const ok = await signInOwner(String(form.get("password") ?? ""));
  if (ok) revalidatePath("/admin");
  return ok ? { ok, message: "Signed in." } : { ok, message: "Wrong password." };
}

export async function tryDemo() {
  await signInDemo();
  revalidatePath("/admin");
}

export async function logout() {
  await signOut();
  revalidatePath("/admin");
}

/** Saves the stock levels of one product row (one input per SKU). */
export async function updateStock(_: ActionState, form: FormData): Promise<ActionState> {
  const role = await getRole();
  if (!role) return { ok: false, message: "Sign in to edit stock." };
  const db = getDb();
  if (!db) return { ok: false, message: "No database connected." };

  const max = role === "owner" ? 999 : DEMO_MAX_STOCK;
  const updates: { sku: string; stock: number }[] = [];
  for (const [key, value] of form.entries()) {
    if (!key.startsWith("stock:")) continue;
    const stock = Number(value);
    if (!Number.isInteger(stock) || stock < 0 || stock > max) return { ok: false, message: `Stock must be a whole number from 0 to ${max}.` };
    updates.push({ sku: key.slice("stock:".length), stock });
  }

  for (const u of updates) await db.update(variants).set({ stock: u.stock }).where(eq(variants.sku, u.sku));

  revalidatePath("/admin");
  revalidatePath("/product/[slug]", "page");
  return { ok: true, message: `Saved ${updates.length} sizes.` };
}
