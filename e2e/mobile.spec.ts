import { expect, test } from "@playwright/test";

test("mobile menu opens and closes on navigation", async ({ page }) => {
  await page.goto("/");
  const nav = page.getByRole("navigation", { name: "Main" });
  await expect(nav).toBeHidden();

  await page.getByRole("button", { name: "Menu" }).click();
  await expect(nav).toBeVisible();
  await nav.getByRole("link", { name: "Knitwear" }).click();

  await expect(page).toHaveURL(/category=knitwear/);
  await expect(nav).toBeHidden();
});
