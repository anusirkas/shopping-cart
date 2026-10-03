import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

/**
 * Minimal admin session for the demo: one password from ADMIN_PASSWORD, and a
 * signed, http-only cookie. Without the env var the admin is read-only.
 */
const COOKIE = "auro-admin";
const MAX_AGE = 60 * 60 * 8;

const secret = () => process.env.ADMIN_PASSWORD ?? "";

function sign(value: string) {
  return createHmac("sha256", secret()).update(value).digest("hex");
}

function safeEqual(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

export const adminConfigured = () => secret().length >= 8;

export async function isAdmin(): Promise<boolean> {
  if (!adminConfigured()) return false;
  const value = (await cookies()).get(COOKIE)?.value;
  if (!value) return false;
  const [issued, signature] = value.split(".");
  if (!issued || !signature || Date.now() - Number(issued) > MAX_AGE * 1000) return false;
  return safeEqual(signature, sign(issued));
}

export async function signIn(password: string): Promise<boolean> {
  if (!adminConfigured() || !safeEqual(sign(password), sign(secret()))) return false;
  const issued = String(Date.now());
  (await cookies()).set(COOKIE, `${issued}.${sign(issued)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/admin",
    maxAge: MAX_AGE,
  });
  return true;
}

export async function signOut() {
  (await cookies()).delete({ name: COOKIE, path: "/admin" });
}
