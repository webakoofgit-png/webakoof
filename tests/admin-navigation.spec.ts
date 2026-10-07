import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";

test("all admin pages support direct loads and sidebar navigation", async ({ page }) => {
  const credentials = JSON.parse(readFileSync(".local/admin-login.json", "utf8"));
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  const response = await page.request.post("/api/cms/login", {
    headers: { Origin: "http://127.0.0.1:8080" },
    data: { ...credentials, remember: false },
  });
  expect(response.status()).toBe(200);
  const paths = [
    "/admin",
    "/admin/homepage",
    "/admin/portfolio",
    "/admin/portfolio/new",
    "/admin/portfolio/categories",
    "/admin/blogs",
    "/admin/blogs/new",
    "/admin/blogs/categories",
    "/admin/enquiries",
    "/admin/settings",
    "/admin/profile",
  ];
  for (const path of paths) {
    await page.goto(path);
    await expect(page.getByRole("navigation", { name: "Admin navigation" })).toBeVisible();
    await expect(page.locator(".adm-page-heading")).toBeVisible();
    await expect(page.locator(".adm-skeleton")).toHaveCount(0);
    expect(errors, path).toEqual([]);
  }
  for (const path of [...paths, ...paths.slice().reverse()]) {
    await page.locator(`nav[aria-label="Admin navigation"] a[href="${path}"]`).click();
    await expect(page).toHaveURL(path);
    await expect(page.locator(".adm-page-heading")).toBeVisible();
    await expect(page.locator(".adm-skeleton")).toHaveCount(0);
    expect(errors, path).toEqual([]);
  }
});
