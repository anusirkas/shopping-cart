"use client";

import { useState } from "react";
import { describePoint, recommendSize, type Body, type FitResult, type Preference } from "@/lib/fit";
import { fitLabel } from "@/lib/labels";
import type { Product, Size } from "@/lib/types";

const BODY_KEY = "auro-body-v1";
const POINTS_FOR: Record<string, (keyof Body)[]> = {
  top: ["chest"],
  dress: ["chest", "hip"],
  bottom: ["waist", "hip"],
};

function group(silhouette: Product["silhouette"]) {
  if (["slip-dress", "knit-dress"].includes(silhouette)) return "dress";
  if (["wide-trouser", "straight-trouser", "midi-skirt"].includes(silhouette)) return "bottom";
  return "top";
}

function loadBody(): Body {
  try {
    return JSON.parse(localStorage.getItem(BODY_KEY) ?? "{}");
  } catch {
    return {};
  }
}

type Props = { product: Product; onSelect: (size: Size) => void };

export default function FitFinder({ product, onSelect }: Props) {
  const [open, setOpen] = useState(false);
  const [body, setBody] = useState<Body>({});
  const [preference, setPreference] = useState<Preference>("as-designed");
  const [result, setResult] = useState<FitResult | null>(null);
  const points = POINTS_FOR[group(product.silhouette)];

  const toggle = () => {
    if (!open) setBody(loadBody()); // prefill from a previous visit
    setOpen((v) => !v);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      localStorage.setItem(BODY_KEY, JSON.stringify({ ...loadBody(), ...body }));
    } catch {
      /* ignore */
    }
    setResult(recommendSize(product, body, preference));
  };

  return (
    <div className="fit-finder">
      <button type="button" className="link-btn fit-toggle" onClick={toggle} aria-expanded={open}>
        Find my size
      </button>
      {open && (
        <form className="fit-panel" onSubmit={submit}>
          <p className="muted">
            This style is a <strong>{fitLabel[product.fit].toLowerCase()}</strong>. Enter your body measurements and we compare them with the
            finished garment, the way a technologist checks fit.
          </p>
          <div className="fit-inputs">
            {points.map((p) => (
              <label key={p}>
                <span>{p[0].toUpperCase() + p.slice(1)} (cm)</span>
                <input
                  type="number"
                  inputMode="decimal"
                  min={40}
                  max={200}
                  step="0.5"
                  required
                  value={body[p] ?? ""}
                  onChange={(e) => setBody({ ...body, [p]: e.target.value ? Number(e.target.value) : undefined })}
                />
              </label>
            ))}
          </div>
          <fieldset className="fit-pref">
            <legend className="sr-only">Preferred fit</legend>
            {(
              [
                ["closer", "Closer"],
                ["as-designed", "As designed"],
                ["looser", "Looser"],
              ] as [Preference, string][]
            ).map(([value, label]) => (
              <label key={value}>
                <input type="radio" name="pref" value={value} checked={preference === value} onChange={() => setPreference(value)} />
                {label}
              </label>
            ))}
          </fieldset>
          <button className="btn btn-outline btn-block" type="submit">Recommend a size</button>

          {result?.kind === "recommendation" && (
            <div className="fit-result" aria-live="polite">
              <p className="fit-size">
                We recommend <strong>{result.size}</strong>
                <span className={`fit-conf fit-conf-${result.confidence}`}>{result.confidence} confidence</span>
              </p>
              <ul>
                {result.points.map((p) => (
                  <li key={p.point}>{describePoint(p)}</li>
                ))}
              </ul>
              {result.note && <p className="warn">{result.note}</p>}
              {result.alternative && <p className="muted">Between sizes? {result.alternative} is the next best fit.</p>}
              <button type="button" className="btn btn-block" onClick={() => onSelect(result.size)}>
                Select {result.size}
              </button>
            </div>
          )}
        </form>
      )}
    </div>
  );
}
