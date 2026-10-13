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

test("dashboard Add Project opens the editor and saves a draft", async ({ page, baseURL }) => {
  test.skip(
    !baseURL || !/^http:\/\/(127\.0\.0\.1|localhost):/.test(baseURL),
    "Local database only",
  );
  const credentials = JSON.parse(readFileSync(".local/admin-login.json", "utf8"));
  const headers = { Origin: baseURL! };
  const login = await page.request.post("/api/cms/login", {
    headers,
    data: { ...credentials, remember: false },
  });
  expect(login.status()).toBe(200);
  const slug = `qa-navigation-${Date.now()}`;
  try {
    await page.goto("/admin");
    await expect(page.getByRole("heading", { name: "Welcome back to WEBakoof." })).toBeVisible();
    await page
      .getByRole("navigation", { name: "Admin navigation" })
      .getByRole("link", { name: "Add Project", exact: true })
      .click();
    await expect(page.getByLabel("Project Name *")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Welcome back to WEBakoof." })).toHaveCount(0);
    await page.getByLabel("Project Name *").fill("QA navigation draft");
    await page.getByLabel("Slug *").fill(slug);
    const categories = await (await page.request.get("/api/cms/portfolio-categories")).json();
    await page
      .getByLabel("Category *", { exact: true })
      .selectOption(String(categories.find((c: { status: string }) => c.status === "active").id));
    await page.getByRole("button", { name: "Save Project", exact: true }).click();
    await expect(page).toHaveURL(/\/admin\/portfolio$/);
    const records = await (await page.request.get("/api/cms/portfolio")).json();
    expect(records.find((p: { slug: string }) => p.slug === slug)?.status).toBe("draft");
  } finally {
    const records = await (await page.request.get("/api/cms/portfolio")).json();
    const record = records.find((p: { slug: string }) => p.slug === slug);
    if (record)
      expect(
        (await page.request.delete(`/api/cms/portfolio/${record.id}`, { headers })).ok(),
      ).toBeTruthy();
    await page.request.post("/api/cms/logout", { headers, data: {} });
  }
});
