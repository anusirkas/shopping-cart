import { describe, expect, it } from "vitest";
import { measurementsFor } from "@/data/silhouettes";
import { describePoint, recommendSize, TARGET_EASE } from "@/lib/fit";
import type { Size } from "@/lib/types";

const SIZES: Size[] = ["XS", "S", "M", "L", "XL"];
const relaxedCrew = { silhouette: "crew" as const, fit: "relaxed" as const, stretch: 0.6, sizes: SIZES };
const slimCrew = { ...relaxedCrew, fit: "slim" as const };

describe("recommendSize", () => {
  it("picks the size whose ease is closest to the designed ease", () => {
    // M crew chest is 108 cm; relaxed target ease is 18 → ideal body chest 90
    const r = recommendSize(relaxedCrew, { chest: 90 });
    expect(r.kind).toBe("recommendation");
    if (r.kind !== "recommendation") return;
    expect(r.size).toBe("M");
    expect(r.points[0].verdict).toBe("as-designed");
  });

  it("recommends a smaller size of a slim style than of a relaxed one for the same body", () => {
    const relaxed = recommendSize(relaxedCrew, { chest: 96 });
    const slim = recommendSize(slimCrew, { chest: 96 });
    if (relaxed.kind !== "recommendation" || slim.kind !== "recommendation") throw new Error("expected recommendations");
    expect(SIZES.indexOf(slim.size)).toBeLessThan(SIZES.indexOf(relaxed.size));
  });

  it("shifts with preference", () => {
    const closer = recommendSize(relaxedCrew, { chest: 92 }, "closer");
    const looser = recommendSize(relaxedCrew, { chest: 92 }, "looser");
    if (closer.kind !== "recommendation" || looser.kind !== "recommendation") throw new Error("expected recommendations");
    expect(SIZES.indexOf(closer.size)).toBeLessThan(SIZES.indexOf(looser.size));
  });

  it("lets stretchy knits go below zero ease but not rigid wovens", () => {
    const xl = measurementsFor("crew", "XL").chest!;
    const body = { chest: xl + 3 }; // 3 cm bigger than the largest garment
    const knit = recommendSize({ ...relaxedCrew, stretch: 0.8 }, body);
    const woven = recommendSize({ ...relaxedCrew, silhouette: "shirt", stretch: 0.02 }, body);
    if (knit.kind !== "recommendation" || woven.kind !== "recommendation") throw new Error("expected recommendations");
    expect(knit.points[0].verdict).not.toBe("tight");
    expect(woven.points[0].verdict).toBe("tight");
    expect(woven.confidence).toBe("low");
    expect(woven.note).toMatch(/tight/);
  });

  it("weights waist above hip for trousers", () => {
    const trouser = { silhouette: "straight-trouser" as const, fit: "regular" as const, stretch: 0.05, sizes: SIZES };
    const m = measurementsFor("straight-trouser", "L");
    const r = recommendSize(trouser, { waist: m.waist! - TARGET_EASE.waist.regular, hip: 90 });
    if (r.kind !== "recommendation") throw new Error("expected recommendation");
    expect(r.size).toBe("L");
  });

  it("asks for measurements it needs", () => {
    expect(recommendSize(relaxedCrew, { waist: 70 })).toEqual({ kind: "missing", needs: ["chest"] });
  });

  it("skips one-size accessories", () => {
    expect(recommendSize({ silhouette: "scarf", fit: "regular", stretch: 0.6, sizes: ["ONE"] }, { chest: 90 }).kind).toBe("not-applicable");
  });
});

describe("describePoint", () => {
  it("phrases ease in plain language", () => {
    expect(describePoint({ point: "chest", body: 90, garment: 108, ease: 18, target: 18, verdict: "as-designed" })).toBe(
      "Chest: 18 cm room, as designed",
    );
    expect(describePoint({ point: "hip", body: 100, garment: 96, ease: -4, target: 4, verdict: "close" })).toBe(
      "Hip: 4 cm stretch, closer than designed",
    );
  });
});
