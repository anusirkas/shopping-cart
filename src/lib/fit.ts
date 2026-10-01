import { measurementsFor } from "@/data/silhouettes";
import type { Fit, Silhouette, Size } from "@/lib/types";

/**
 * Fit finder: recommends a size by comparing body measurements with the
 * garment's finished measurements, the way a garment technologist would.
 *
 * Ease = garment circumference − body circumference. Every fit intent has a
 * target ease (a relaxed sweater is designed to have ~18 cm of room at the
 * chest). Stretchy knits may go below zero ease; rigid wovens may not.
 */

export type Body = { chest?: number; waist?: number; hip?: number };
export type Preference = "closer" | "as-designed" | "looser";
type Point = "chest" | "waist" | "hip";

/** Target ease in cm by fit intent, per measuring point. */
export const TARGET_EASE: Record<Point, Record<Fit, number>> = {
  chest: { slim: 4, regular: 10, relaxed: 18, oversized: 28 },
  waist: { slim: 1, regular: 2, relaxed: 4, oversized: 6 },
  hip: { slim: 4, regular: 8, relaxed: 14, oversized: 22 },
};

const PREFERENCE_SHIFT: Record<Preference, number> = { closer: -5, "as-designed": 0, looser: 6 };

/** Which body points matter for each silhouette, with weights. */
const POINTS: Partial<Record<Silhouette, Partial<Record<Point, number>>>> = {
  crew: { chest: 1 },
  turtleneck: { chest: 1 },
  cardigan: { chest: 1 },
  tee: { chest: 1 },
  shirt: { chest: 1 },
  coat: { chest: 1 },
  blazer: { chest: 1 },
  "slip-dress": { chest: 1, hip: 1 },
  "knit-dress": { chest: 1, hip: 1 },
  "wide-trouser": { waist: 1.5, hip: 1 },
  "straight-trouser": { waist: 1.5, hip: 1 },
  "midi-skirt": { waist: 1.5, hip: 1 },
};

export type PointResult = { point: Point; body: number; garment: number; ease: number; target: number; verdict: "tight" | "close" | "as-designed" | "roomy" };

export type FitResult =
  | { kind: "not-applicable" }
  | { kind: "missing"; needs: Point[] }
  | {
      kind: "recommendation";
      size: Size;
      confidence: "high" | "medium" | "low";
      points: PointResult[];
      note?: string;
      alternative?: Size;
    };

type Garment = { silhouette: Silhouette; fit: Fit; stretch: number; sizes: Size[] };

/** How far below zero ease the fabric can comfortably stretch, in cm. */
const minEase = (stretch: number) => -Math.round(stretch * 8);

function verdict(ease: number, target: number, floor: number): PointResult["verdict"] {
  if (ease < floor) return "tight";
  const d = ease - target;
  if (d < -4) return "close";
  if (d > 6) return "roomy";
  return "as-designed";
}

export function recommendSize(garment: Garment, body: Body, preference: Preference = "as-designed"): FitResult {
  const weights = POINTS[garment.silhouette];
  if (!weights || garment.sizes.includes("ONE")) return { kind: "not-applicable" };

  const needs = (Object.keys(weights) as Point[]).filter((p) => !body[p] || body[p]! <= 0);
  if (needs.length === Object.keys(weights).length) return { kind: "missing", needs };

  const floor = minEase(garment.stretch);
  const scored = garment.sizes.map((size) => {
    const m = measurementsFor(garment.silhouette, size);
    const points: PointResult[] = [];
    let score = 0;
    let tight = false;
    for (const [point, weight] of Object.entries(weights) as [Point, number][]) {
      const b = body[point];
      const g = m[point];
      if (!b || g === undefined) continue;
      const ease = Math.round((g - b) * 10) / 10;
      const target = TARGET_EASE[point][garment.fit] + PREFERENCE_SHIFT[preference] * (point === "waist" ? 0.3 : 1);
      const v = verdict(ease, target, floor);
      if (v === "tight") tight = true;
      // being too small is worse than being too big
      const miss = ease - target;
      score += weight * (miss < 0 ? Math.abs(miss) * 1.6 : miss);
      points.push({ point, body: b, garment: g, ease, target: Math.round(target), verdict: v });
    }
    return { size, points, score: tight ? score + 1000 : score, tight };
  });

  const ranked = [...scored].sort((a, b) => a.score - b.score);
  const best = ranked[0];
  const runnerUp = ranked[1];

  let note: string | undefined;
  if (best.tight) note = "Even the largest size will feel tight. This style may not suit your measurements.";
  else if (best.points.every((p) => p.verdict === "roomy") && best.size === garment.sizes[0])
    note = "The smallest size will still be roomier than designed.";

  const gap = runnerUp ? runnerUp.score - best.score : Infinity;
  const confidence = best.tight ? "low" : gap > 6 ? "high" : gap > 2 ? "medium" : "low";

  return {
    kind: "recommendation",
    size: best.size,
    confidence,
    points: best.points,
    note,
    alternative: confidence !== "high" && runnerUp && !runnerUp.tight ? runnerUp.size : undefined,
  };
}

export function describePoint(p: PointResult): string {
  const name = p.point[0].toUpperCase() + p.point.slice(1);
  const room = p.ease >= 0 ? `${p.ease} cm room` : `${Math.abs(p.ease)} cm stretch`;
  const tail = {
    tight: "too snug",
    close: "closer than designed",
    "as-designed": "as designed",
    roomy: "roomier than designed",
  }[p.verdict];
  return `${name}: ${room}, ${tail}`;
}
