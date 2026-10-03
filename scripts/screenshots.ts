/**
 * Captures README / case-study screenshots from a running Auro instance.
 *   npx tsx scripts/screenshots.ts [baseUrl]
 * Defaults to the live site. Output: docs/screenshots/*.webp
 */
import { mkdirSync } from "node:fs";
import { chromium } from "@playwright/test";
import sharp from "sharp";

const base = process.argv[2] ?? "https://auro-studio.vercel.app";
const out = "docs/screenshots";
mkdirSync(out, { recursive: true });

async function main() {
  const browser = await chromium.launch();
  // OpenStreetMap refuses tiles to the default headless user agent
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    userAgent: `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${browser.version()} Safari/537.36`,
  });
  const page = await context.newPage();
  const shot = async (name: string) =>
    sharp(await page.screenshot()).webp({ quality: 82 }).toFile(`${out}/${name}.webp`);

  await page.goto(`${base}/`);
  await page.waitForLoadState("networkidle");
  await shot("home");

  await page.goto(`${base}/shop`);
  await page.waitForLoadState("networkidle");
  await shot("shop");

  await page.goto(`${base}/product/saare-turtleneck`);
  await page.getByRole("button", { name: "Find my size" }).click();
  await page.getByLabel("Chest (cm)").fill("92");
  await page.getByRole("button", { name: "Recommend a size" }).click();
  await page.getByText("We recommend").waitFor();
  await page.evaluate(() => window.scrollTo(0, 60));
  await shot("product-fit-finder");

  await page.goto(`${base}/passport/AU-007-COA`);
  await page.waitForLoadState("networkidle");
  await shot("passport");

  await page.goto(`${base}/stores?city=Paris`);
  await page.locator(".leaflet-tile-loaded").first().waitFor({ timeout: 15000 });
  await page.waitForTimeout(2500); // fly-to animation and remaining tiles
  await shot("stores");

  await browser.close();
  console.log(`Saved screenshots to ${out}/`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
