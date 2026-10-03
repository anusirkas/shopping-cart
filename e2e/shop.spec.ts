import { expect, test } from "@playwright/test";

test.describe("shop", () => {
  test("filters live in the URL and narrow the grid", async ({ page }) => {
    await page.goto("/shop");
    await expect(page.getByText("29 products")).toBeVisible();

    // the first click can land before hydration on a busy machine, so retry it
    await expect(async () => {
      await page.getByRole("listitem").filter({ hasText: /^Knitwear/ }).click();
      await expect(page).toHaveURL(/category=knitwear/, { timeout: 1000 });
    }).toPass();
    await expect(page.getByRole("heading", { level: 1, name: "Knitwear" })).toBeVisible();
    await expect(page.getByText("6 products")).toBeVisible();

    await page.getByRole("button", { name: "Filters" }).click();
    await page.getByRole("button", { name: /^Cashmere/ }).click();
    await expect(page).toHaveURL(/fibre=Cashmere/);
    await expect(page.getByText("2 products")).toBeVisible();
    await expect(page.locator(".card-name")).toHaveText(["Saare Turtleneck", "Pilv Cardigan"]);

    // a shared link restores the same view
    await page.goto(page.url());
    await expect(page.getByText("2 products")).toBeVisible();
  });

  test("search matches every term", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Search", exact: true }).click();
    await page.getByRole("searchbox", { name: "Search products" }).fill("silk black");
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/q=silk/);
    await expect(page.locator(".card-name").first()).toBeVisible();
    for (const fibre of await page.locator(".card-fibre").allTextContents()) expect(fibre).toContain("Silk");
  });

  test("unknown products show the not-found page", async ({ page }) => {
    const res = await page.goto("/product/does-not-exist");
    expect(res?.status()).toBe(404);
  });
});

test.describe("product page", () => {
  test("fit finder recommends and selects a size", async ({ page }) => {
    await page.goto("/product/saare-turtleneck");
    await page.getByRole("button", { name: "Find my size" }).click();
    await page.getByLabel("Chest (cm)").fill("92");
    await page.getByRole("button", { name: "Recommend a size" }).click();

    await expect(page.getByText("We recommend")).toContainText("S");
    await expect(page.getByText("Chest: 3 cm room, as designed")).toBeVisible();
    await page.getByRole("button", { name: "Select S" }).click();
    await expect(page.locator(".pdp-sizes").getByRole("button", { name: "S", exact: true })).toHaveAttribute("aria-pressed", "true");
  });

  test("switches to the 3D fabric view on demand", async ({ page }) => {
    await page.goto("/product/pohja-coat");
    await expect(page.locator(".fabric-viewer canvas")).toHaveCount(0); // three.js isn't loaded up front
    await page.getByRole("button", { name: "3D fabric" }).click();
    await expect(page.getByRole("img", { name: /3D view of Camel Põhja Coat fabric/ })).toBeVisible();
    await expect(page.locator(".fabric-viewer canvas")).toBeVisible();
    await page.getByRole("button", { name: "Technical flat" }).click();
    await expect(page.getByRole("img", { name: "Põhja Coat in Camel" })).toBeVisible();
  });

  test("asks for a size before adding to the bag", async ({ page }) => {
    await page.goto("/product/vale-crew");
    await page.getByRole("button", { name: "Add to bag" }).click();
    await expect(page.getByText("Choose a size first.")).toBeVisible();
    await expect(page.getByRole("button", { name: /Open bag, 0 items/ })).toBeVisible();
  });
});

test.describe("bag", () => {
  test("adds, updates and keeps items across reloads", async ({ page }) => {
    await page.goto("/product/vale-crew");
    await page.locator(".pdp-sizes button:not([disabled])").first().click();
    await page.getByRole("button", { name: "Add to bag" }).click();

    const drawer = page.getByRole("dialog", { name: "Shopping bag" });
    await expect(drawer).toContainText("Vale Crew");
    await expect(page.getByRole("button", { name: /Open bag, 1 items/ })).toBeVisible();

    await drawer.getByRole("link", { name: "View bag & checkout" }).click();
    await expect(page).toHaveURL(/\/bag$/);
    await expect(page.locator(".bag-total")).toContainText("€220");

    await page.locator(".bag").getByRole("button", { name: "Increase Vale Crew" }).click();
    await expect(page.locator(".bag-total")).toContainText("€440");

    await page.reload();
    await expect(page.locator(".bag-total")).toContainText("€440");

    await page.locator(".bag").getByRole("button", { name: "Remove" }).click();
    await expect(page.getByRole("main").getByText("Your bag is empty.")).toBeVisible();
  });
});

test.describe("checkout API", () => {
  test("rejects SKUs that don't exist", async ({ request }) => {
    const res = await request.post("/api/checkout", { data: { lines: [{ sku: "NOPE", quantity: 1 }] } });
    expect(res.status()).toBe(409);
    expect(await res.json()).toMatchObject({ error: "bag-changed", details: [{ sku: "NOPE", reason: "unknown" }] });
  });

  test("rejects malformed bodies", async ({ request }) => {
    const res = await request.post("/api/checkout", { data: { lines: "everything" } });
    expect(res.status()).toBe(400);
  });

  test("reports checkout unavailable when Stripe is not configured", async ({ request }) => {
    const res = await request.post("/api/checkout", { data: { lines: [{ sku: "AU-001-CRE-ECRU-L", quantity: 1 }] } });
    // stock is seeded deterministically; this SKU has stock, so the only blocker is the missing key
    expect(res.status()).toBe(503);
  });

  test("webhook refuses unsigned requests", async ({ request }) => {
    const res = await request.post("/api/stripe/webhook", { data: {} });
    expect([400, 503]).toContain(res.status());
  });
});

test.describe("passports and stores", () => {
  test("passport shows composition, chain and a QR code", async ({ page }) => {
    await page.goto("/passport/AU-007-COA");
    await expect(page.getByRole("heading", { level: 1, name: "Põhja Coat" })).toBeVisible();
    await expect(page.getByRole("img", { name: /QR code linking to/ })).toBeVisible();
    await expect(page.locator(".data-table")).toContainText("Cashmere");
    await expect(page.locator(".timeline li")).toHaveCount(4);
  });

  test("store search narrows the list", async ({ page }) => {
    await page.goto("/stores");
    await page.getByRole("searchbox", { name: "Search stores" }).fill("cop");
    await expect(page.locator(".store-city")).toHaveText(["Copenhagen"]);
    await page.getByRole("searchbox", { name: "Search stores" }).fill("zzz");
    await expect(page.getByText("No stores match")).toBeVisible();
  });
});

test("admin is open to visitors and offers a one-click demo session", async ({ page }) => {
  await page.goto("/admin");
  await expect(page.getByText("Read-only", { exact: true })).toBeVisible();
  await expect(page.getByText("Owner sign-in")).toHaveCount(0); // no owner password configured
  await expect(page.locator(".inventory tbody tr")).not.toHaveCount(0);
  await expect(page.locator(".inventory input")).toHaveCount(0);

  await page.getByRole("link", { name: "Needs attention" }).click();
  await expect(page).toHaveURL(/filter=attention/);
  const rows = await page.locator(".inventory tbody tr").count();
  const flagged = await page.locator(".inventory tbody tr").filter({ has: page.locator("td.is-low, td.is-out") }).count();
  expect(flagged).toBe(rows);

  await page.getByRole("button", { name: "Try the back office →" }).click();
  await expect(page.getByText("Demo admin", { exact: true })).toBeVisible();
  await expect(page.getByText(/resets every night/)).toBeVisible();
  // no database in CI, so stock stays read-only even for a signed-in admin
  await expect(page.locator(".inventory input")).toHaveCount(0);

  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page.getByText("Read-only", { exact: true })).toBeVisible();
});
