import { test, expect } from "@playwright/test";

test("swap page loads", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("link", { name: "Swap", exact: true })).toBeVisible();
});
