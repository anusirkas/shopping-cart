"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { isAdmin, signIn, signOut } from "@/lib/admin-auth";
import { getDb } from "@/lib/db/client";
import { variants } from "@/lib/db/schema";

export type ActionState = { ok: boolean; message: string } | null;

export async function login(_: ActionState, form: FormData): Promise<ActionState> {
  const ok = await signIn(String(form.get("password") ?? ""));
  if (ok) revalidatePath("/admin");
  return ok ? { ok, message: "Signed in." } : { ok, message: "Wrong password." };
}

export async function logout() {
  await signOut();
  revalidatePath("/admin");
}

/** Saves the stock levels of one product row (one input per SKU). */
export async function updateStock(_: ActionState, form: FormData): Promise<ActionState> {
  if (!(await isAdmin())) return { ok: false, message: "Sign in to edit stock." };
  const db = getDb();
  if (!db) return { ok: false, message: "No database connected." };

  const updates: { sku: string; stock: number }[] = [];
  for (const [key, value] of form.entries()) {
    if (!key.startsWith("stock:")) continue;
    const stock = Number(value);
    if (!Number.isInteger(stock) || stock < 0 || stock > 999) return { ok: false, message: "Stock must be a whole number from 0 to 999." };
    updates.push({ sku: key.slice("stock:".length), stock });
  }

  for (const u of updates) await db.update(variants).set({ stock: u.stock }).where(eq(variants.sku, u.sku));

  revalidatePath("/admin");
  revalidatePath("/product/[slug]", "page");
  return { ok: true, message: `Saved ${updates.length} sizes.` };
}
