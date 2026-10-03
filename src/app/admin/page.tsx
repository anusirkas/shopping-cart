import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm, LogoutButton, StockRow, TryDemoButton } from "@/app/admin/forms";
import { demoLoginEnabled, getRole, ownerLoginEnabled } from "@/lib/admin-auth";
import { getDb } from "@/lib/db/client";
import { formatPrice } from "@/lib/money";
import { getCatalogueForCheckout, getRecentOrders } from "@/lib/repository";
import { LOW_STOCK as LOW } from "@/lib/stock";
import type { Size } from "@/lib/types";
import "./admin.css";

export const metadata: Metadata = { title: "Admin", robots: { index: false } };
export const dynamic = "force-dynamic";

const SIZES: Size[] = ["XS", "S", "M", "L", "XL", "ONE"];

type Props = { searchParams: Promise<{ filter?: string }> };

export default async function AdminPage({ searchParams }: Props) {
  const { filter } = await searchParams;
  const [role, orders, catalogue] = await Promise.all([getRole(), getRecentOrders(), getCatalogueForCheckout()]);
  const connected = Boolean(getDb());

  const paid = orders.filter((o) => o.status === "paid");
  const revenue = paid.reduce((n, o) => n + o.totalCents, 0);
  const units = paid.reduce((n, o) => n + o.items, 0);
  const variants = catalogue.flatMap((p) => p.variants);
  const soldOut = variants.filter((v) => v.stock === 0).length;
  const low = variants.filter((v) => v.stock > 0 && v.stock <= LOW).length;

  const rows = catalogue.flatMap((p) =>
    p.colorways.map((c) => ({
      product: p,
      colorway: c,
      cells: SIZES.map((size) => p.variants.find((v) => v.colorway === c.name && v.size === size)),
    })),
  );
  const visible = filter === "attention" ? rows.filter((r) => r.cells.some((v) => v && v.stock <= LOW)) : rows;

  return (
    <div className="page admin">
      <header className="admin-head">
        <div>
          <p className="eyebrow">Back office</p>
          <h1>Admin</h1>
        </div>
        <div className="admin-session">
          {role ? (
            <>
              <span className="pill pill-ok">{role === "owner" ? "Signed in as owner" : "Demo admin"}</span>
              <LogoutButton />
            </>
          ) : (
            <>
              <span className="pill">Read-only</span>
              {demoLoginEnabled() && <TryDemoButton />}
            </>
          )}
        </div>
      </header>

      {role === "demo" && (
        <p className="notice">
          You&apos;re in a demo session. Try it: set a size to 0, 1 or 2, press Save, then open the product (click its name). Sold-out sizes
          are crossed out and the last ones show &ldquo;1 left&rdquo;. Demo stock is capped at 50 and resets every night, so you can&apos;t break anything.
        </p>
      )}
      {!role && demoLoginEnabled() && connected && (
        <p className="notice">This is the store&apos;s back office. Press <strong>Try the back office</strong> to edit stock, no password needed.</p>
      )}

      {!connected && <p className="notice">No database connected: showing the bundled catalogue. Orders appear once DATABASE_URL is set.</p>}

      <dl className="kpis">
        <div><dt>Paid orders</dt><dd>{paid.length}</dd></div>
        <div><dt>Revenue (test mode)</dt><dd>{formatPrice(revenue)}</dd></div>
        <div><dt>Units sold</dt><dd>{units}</dd></div>
        <div><dt>Sold-out sizes</dt><dd>{soldOut}</dd></div>
        <div><dt>Low stock (≤{LOW})</dt><dd>{low}</dd></div>
      </dl>

      <section className="admin-section">
        <h2>Recent orders</h2>
        {orders.length === 0 ? (
          <p className="muted">No orders yet.</p>
        ) : (
          <div className="table-wrap">
            <table className="admin-table">
              <thead>
                <tr><th>Order</th><th>Placed</th><th>Status</th><th>Items</th><th className="num">Total</th></tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id}>
                    <td className="mono">{o.id}</td>
                    <td>{new Date(o.createdAt).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/Tallinn" })}</td>
                    <td><span className={`pill pill-${o.status}`}>{o.status}</span></td>
                    <td>{o.lines.map((l) => `${l.quantity} × ${l.name} (${l.sku.split("-").slice(-2).join(" ")})`).join(", ")}</td>
                    <td className="num">{formatPrice(o.totalCents)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="muted small-note">Pending orders are checkouts that were started but not paid. Customer emails are never shown here.</p>
      </section>

      <section className="admin-section">
        <div className="row-between">
          <h2>Inventory</h2>
          <nav className="admin-filter" aria-label="Inventory filter">
            <Link href="/admin" aria-current={filter !== "attention" ? "page" : undefined}>All ({rows.length})</Link>
            <Link href="/admin?filter=attention" aria-current={filter === "attention" ? "page" : undefined}>Needs attention</Link>
          </nav>
        </div>
        <div className="table-wrap">
          <table className="admin-table inventory">
            <thead>
              <tr>
                <th>Product</th>
                <th>Colour</th>
                {SIZES.map((s) => <th key={s} className="num">{s === "ONE" ? "One size" : s}</th>)}
                <th />
              </tr>
            </thead>
            <tbody>
              {visible.map((r) => (
                <StockRow
                  key={`${r.product.id}-${r.colorway.name}`}
                  product={{ name: r.product.name, slug: r.product.slug }}
                  colorway={r.colorway}
                  cells={r.cells.map((v) => (v ? { sku: v.sku, stock: v.stock } : null))}
                  low={LOW}
                  editable={Boolean(role) && connected}
                  maxStock={role === "owner" ? 999 : 50}
                />
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {!role && ownerLoginEnabled() && (
        <details className="owner-login">
          <summary>Owner sign-in</summary>
          <LoginForm />
        </details>
      )}
    </div>
  );
}
