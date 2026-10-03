"use client";

import Link from "next/link";
import { useActionState } from "react";
import { login, logout, tryDemo, updateStock, type ActionState } from "@/app/admin/actions";

export function TryDemoButton() {
  return (
    <form action={tryDemo}>
      <button className="btn">Try the back office →</button>
    </form>
  );
}

export function LoginForm() {
  const [state, action, pending] = useActionState<ActionState, FormData>(login, null);
  return (
    <form action={action} className="admin-login">
      <label className="sr-only" htmlFor="admin-password">Admin password</label>
      <input id="admin-password" name="password" type="password" placeholder="Admin password" autoComplete="current-password" required />
      <button className="btn btn-outline" disabled={pending}>Sign in</button>
      {state && !state.ok && <span className="warn" role="alert">{state.message}</span>}
    </form>
  );
}

export function LogoutButton() {
  return (
    <form action={logout}>
      <button className="link-btn">Sign out</button>
    </form>
  );
}

type Cell = { sku: string; stock: number } | null;
type Props = {
  product: { name: string; slug: string };
  colorway: { name: string; hex: string };
  cells: Cell[];
  low: number;
  editable: boolean;
  maxStock: number;
};

/** One inventory row: a colourway with a stock input per size. */
export function StockRow({ product, colorway, cells, low, editable, maxStock }: Props) {
  const [state, action, pending] = useActionState<ActionState, FormData>(updateStock, null);
  const formId = `stock-${cells.find(Boolean)?.sku ?? product.slug}`;

  return (
    <tr>
      <td><Link href={`/product/${product.slug}`}>{product.name}</Link></td>
      <td>
        <span className="swatch-dot" style={{ background: colorway.hex }} aria-hidden="true" /> {colorway.name}
      </td>
      {cells.map((c, i) =>
        c ? (
          <td key={c.sku} className={`num${c.stock === 0 ? " is-out" : c.stock <= low ? " is-low" : ""}`}>
            {editable ? (
              <input
                form={formId}
                name={`stock:${c.sku}`}
                type="number"
                min={0}
                max={maxStock}
                defaultValue={c.stock}
                aria-label={`Stock for ${product.name} ${colorway.name} ${c.sku.split("-").at(-1)}`}
              />
            ) : (
              c.stock
            )}
          </td>
        ) : (
          <td key={i} className="num muted">–</td>
        ),
      )}
      <td className="row-action">
        {editable && (
          <form id={formId} action={action}>
            <button className="link-btn" disabled={pending}>{pending ? "Saving…" : "Save"}</button>
            {state && <span className={state.ok ? "ok" : "warn"} role="status"> {state.message}</span>}
          </form>
        )}
      </td>
    </tr>
  );
}
