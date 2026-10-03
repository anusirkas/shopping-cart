import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

/**
 * Admin sessions for the demo, stored in a signed http-only cookie.
 *
 * - "owner": signs in with ADMIN_PASSWORD.
 * - "demo": one click, no password, so visitors can try the back office.
 *   Demo edits are limited and the nightly cron restores the seeded stock.
 */
export type Role = "owner" | "demo";

const COOKIE = "auro-admin";
const MAX_AGE = 60 * 60 * 8;

const password = () => process.env.ADMIN_PASSWORD ?? "";
// any server-only secret works as the signing key; a dedicated one is preferred
const signingKey = () => process.env.ADMIN_SESSION_SECRET || password() || process.env.DATABASE_URL || "";

function sign(value: string) {
  return createHmac("sha256", signingKey()).update(value).digest("hex");
}

function safeEqual(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

export const ownerLoginEnabled = () => password().length >= 8;
export const demoLoginEnabled = () => signingKey().length >= 8;

export async function getRole(): Promise<Role | null> {
  if (!demoLoginEnabled()) return null;
  const value = (await cookies()).get(COOKIE)?.value;
  if (!value) return null;
  const [issued, role, signature] = value.split(".");
  if (!issued || !signature || (role !== "owner" && role !== "demo")) return null;
  if (Date.now() - Number(issued) > MAX_AGE * 1000) return null;
  if (role === "owner" && !ownerLoginEnabled()) return null;
  return safeEqual(signature, sign(`${issued}.${role}`)) ? role : null;
}

async function startSession(role: Role) {
  const issued = String(Date.now());
  (await cookies()).set(COOKIE, `${issued}.${role}.${sign(`${issued}.${role}`)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/admin",
    maxAge: MAX_AGE,
  });
}

export async function signInOwner(attempt: string): Promise<boolean> {
  if (!ownerLoginEnabled() || !safeEqual(sign(attempt), sign(password()))) return false;
  await startSession("owner");
  return true;
}

export async function signInDemo(): Promise<boolean> {
  if (!demoLoginEnabled()) return false;
  await startSession("demo");
  return true;
}

export async function signOut() {
  (await cookies()).delete({ name: COOKIE, path: "/admin" });
}
