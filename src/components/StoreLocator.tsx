"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import type { Store } from "@/data/editorial";

// Leaflet touches `window`, so the map only renders in the browser
const StoreMap = dynamic(() => import("@/components/StoreMap"), {
  ssr: false,
  loading: () => <div className="store-map store-map-loading">Loading map…</div>,
});

export default function StoreLocator({ stores, initialCity }: { stores: Store[]; initialCity?: string }) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Store | null>(() => stores.find((s) => s.city === initialCity) ?? null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? stores.filter((s) => `${s.city} ${s.country} ${s.address}`.toLowerCase().includes(q)) : stores;
  }, [query, stores]);

  return (
    <div className="store-locator">
      <StoreMap stores={results} selected={selected} onSelect={setSelected} />
      <aside className="store-side">
        <label className="store-search">
          <span className="sr-only">Search stores</span>
          <input
            type="search"
            placeholder="Search city or country"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              const q = e.target.value.trim().toLowerCase();
              // fly to the first match as you type, like the original Auro locator
              const first = q ? stores.find((s) => `${s.city} ${s.country} ${s.address}`.toLowerCase().includes(q)) : undefined;
              setSelected(first ?? null);
            }}
          />
        </label>
        <ul className="store-list">
          {results.map((s) => (
            <li key={s.city}>
              <button className={selected?.city === s.city ? "is-active" : ""} onClick={() => setSelected(s)} aria-pressed={selected?.city === s.city}>
                <span className="store-city">{s.city}</span>
                <span className="muted">{s.address}, {s.country}</span>
                <span className="muted">{s.hours}</span>
                <span className="store-note">{s.note}</span>
              </button>
            </li>
          ))}
          {results.length === 0 && <li className="muted">No stores match “{query}”.</li>}
        </ul>
      </aside>
    </div>
  );
}
