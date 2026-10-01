import type { Silhouette, Size } from "@/lib/types";

/**
 * Garment measurements (cm) per size, as on a factory size spec.
 * Circumferences are full garment circumferences, not body measurements.
 */
export type GarmentMeasurements = {
  chest?: number;
  waist?: number;
  hip?: number;
  length: number;
};

type SpecSheet = {
  label: string;
  /** Typical finished garment weight in kg, used for footprint estimates. */
  weightKg: number;
  sizes: Size[];
  /** Base measurements for size M and grading per size step. */
  base: GarmentMeasurements;
  grade: Partial<GarmentMeasurements>;
};

const TOP_SIZES: Size[] = ["XS", "S", "M", "L", "XL"];

export const specs: Record<Silhouette, SpecSheet> = {
  crew: { label: "Crew-neck sweater", weightKg: 0.45, sizes: TOP_SIZES, base: { chest: 108, length: 66 }, grade: { chest: 5, length: 1.5 } },
  turtleneck: { label: "Turtleneck", weightKg: 0.5, sizes: TOP_SIZES, base: { chest: 100, length: 64 }, grade: { chest: 5, length: 1.5 } },
  cardigan: { label: "Cardigan", weightKg: 0.55, sizes: TOP_SIZES, base: { chest: 112, length: 68 }, grade: { chest: 5, length: 1.5 } },
  tee: { label: "T-shirt", weightKg: 0.18, sizes: TOP_SIZES, base: { chest: 104, length: 68 }, grade: { chest: 5, length: 1.5 } },
  shirt: { label: "Shirt", weightKg: 0.25, sizes: TOP_SIZES, base: { chest: 110, length: 74 }, grade: { chest: 5, length: 1.5 } },
  coat: { label: "Coat", weightKg: 1.6, sizes: TOP_SIZES, base: { chest: 118, length: 112 }, grade: { chest: 5, length: 2 } },
  blazer: { label: "Blazer", weightKg: 0.9, sizes: TOP_SIZES, base: { chest: 104, length: 72 }, grade: { chest: 5, length: 1.5 } },
  "slip-dress": { label: "Slip dress", weightKg: 0.22, sizes: TOP_SIZES, base: { chest: 92, hip: 104, length: 118 }, grade: { chest: 5, hip: 5, length: 1.5 } },
  "knit-dress": { label: "Knitted dress", weightKg: 0.6, sizes: TOP_SIZES, base: { chest: 94, hip: 100, length: 112 }, grade: { chest: 5, hip: 5, length: 1.5 } },
  "wide-trouser": { label: "Wide-leg trouser", weightKg: 0.55, sizes: TOP_SIZES, base: { waist: 76, hip: 112, length: 104 }, grade: { waist: 5, hip: 5, length: 1 } },
  "straight-trouser": { label: "Straight trouser", weightKg: 0.5, sizes: TOP_SIZES, base: { waist: 76, hip: 102, length: 102 }, grade: { waist: 5, hip: 5, length: 1 } },
  "midi-skirt": { label: "Midi skirt", weightKg: 0.35, sizes: TOP_SIZES, base: { waist: 72, hip: 104, length: 80 }, grade: { waist: 5, hip: 5, length: 1 } },
  scarf: { label: "Scarf", weightKg: 0.25, sizes: ["ONE"], base: { length: 190 }, grade: {} },
  tote: { label: "Tote bag", weightKg: 0.4, sizes: ["ONE"], base: { length: 40 }, grade: {} },
  beanie: { label: "Beanie", weightKg: 0.1, sizes: ["ONE"], base: { length: 24 }, grade: {} },
};

const STEP: Record<Size, number> = { XS: -2, S: -1, M: 0, L: 1, XL: 2, ONE: 0 };

export function measurementsFor(silhouette: Silhouette, size: Size): GarmentMeasurements {
  const { base, grade } = specs[silhouette];
  const step = STEP[size];
  const graded = (key: keyof GarmentMeasurements) => {
    const value = base[key];
    return value === undefined ? undefined : Math.round((value + (grade[key] ?? 0) * step) * 10) / 10;
  };
  return { chest: graded("chest"), waist: graded("waist"), hip: graded("hip"), length: graded("length")! };
}
