import { test, expect, type APIRequestContext } from "@playwright/test";
import { existsSync, readFileSync } from "node:fs";
const credentials: { email: string; password: string } =
  process.env["CMS_TEST_EMAIL"] && process.env["CMS_TEST_PASSWORD"]
    ? { email: process.env["CMS_TEST_EMAIL"], password: process.env["CMS_TEST_PASSWORD"] }
    : existsSync(".local/admin-login.json")
      ? JSON.parse(readFileSync(".local/admin-login.json", "utf8"))
      : { email: "", password: "" };
const origin = process.env["QA_BASE_URL"] || "http://127.0.0.1:8080";
const headers = { Origin: origin };
test.describe.configure({ mode: "serial" });
test.skip(
  !credentials.email,
  "Configure local CMS test credentials before running integration tests.",
);
async function login(request: APIRequestContext) {
  const response = await request.post("/api/cms/login", {
    headers,
    data: { ...credentials, remember: false },
  });
  expect(response.status(), await response.text()).toBe(200);
}
test("admin endpoints reject anonymous requests and cross-origin mutations", async ({
  request,
}) => {
  for (const path of [
    "dashboard",
    "portfolio",
    "blogs",
    "enquiries",
    "homepage",
    "settings",
    "profile",
  ])
    expect((await request.get("/api/cms/" + path)).status()).toBe(401);
  expect(
    (
      await request.post("/api/cms/login", {
        headers: { Origin: "https://wrong.invalid" },
        data: { ...credentials, remember: false },
      })
    ).status(),
  ).toBe(403);
  const response = await request.get("/admin/portfolio", { maxRedirects: 0 });
  expect([302, 307]).toContain(response.status());
});
test("MySQL content lifecycle, sanitization, validation, and category integrity", async ({
  request,
}) => {
  await login(request);
  const categorySlug = "qa-cms-" + Date.now();
  const response = await request.post("/api/cms/portfolio-categories", {
    headers,
    data: {
      name: "QA CMS Category",
      slug: categorySlug,
      description: "Temporary verification category",
      status: "active",
    },
  });
  expect(response.ok(), await response.text()).toBeTruthy();
  const categories = await (await request.get("/api/cms/portfolio-categories")).json();
  const category = categories.find((c: { slug: string }) => c.slug === categorySlug);
  let projectId: number | undefined;
  let blogId: number | undefined;
  try {
    const project = {
      name: "QA CMS Project",
      slug: categorySlug,
      category_id: category.id,
      status: "draft",
      featured: false,
      image: "/projects/Rockals.png",
      description: "QA verification project",
    };
    expect(
      (await request.post("/api/cms/portfolio", { headers, data: project })).ok(),
    ).toBeTruthy();
    projectId = (await (await request.get("/api/cms/portfolio")).json()).find(
      (p: { slug: string }) => p.slug === categorySlug,
    ).id;
    expect((await request.get("/portfolio/" + categorySlug)).status()).toBe(404);
    expect(
      (
        await request.put("/api/cms/portfolio/" + projectId, {
          headers,
          data: { ...project, status: "published", featured: true },
        })
      ).ok(),
    ).toBeTruthy();
    expect((await request.get("/portfolio/" + categorySlug)).status()).toBe(200);
    expect(await (await request.get("/")).text()).toContain("QA CMS Project");
    expect(
      (await request.delete("/api/cms/portfolio-categories/" + category.id, { headers })).status(),
    ).toBe(409);
    expect(
      (
        await request.post("/api/cms/portfolio", {
          headers,
          data: { ...project, slug: categorySlug + "-unsafe", liveUrl: "javascript:alert(1)" },
        })
      ).status(),
    ).toBe(400);
    const bc = (await (await request.get("/api/cms/blog-categories")).json())[0];
    const blog = {
      title: "QA CMS Blog",
      slug: categorySlug,
      category_id: bc.id,
      status: "draft",
      date: "2020-01-01",
      html: '<h2>Useful heading</h2><p>Safe content</p><script>alert(1)</script><img src="x" onerror="alert(1)"><a href="javascript:alert(1)">bad</a>',
    };
    expect((await request.post("/api/cms/blogs", { headers, data: blog })).ok()).toBeTruthy();
    const stored = (await (await request.get("/api/cms/blogs")).json()).find(
      (p: { slug: string }) => p.slug === categorySlug,
    );
    blogId = stored.id;
    expect(stored.html).not.toMatch(/<script|onerror|javascript:/);
    expect((await request.get("/blog/" + categorySlug)).status()).toBe(404);
    expect(
      (
        await request.put("/api/cms/blogs/" + blogId, {
          headers,
          data: { ...blog, status: "published" },
        })
      ).ok(),
    ).toBeTruthy();
    expect((await request.get("/blog/" + categorySlug)).status()).toBe(200);
    expect(
      (
        await request.put("/api/cms/blogs/" + blogId, {
          headers,
          data: { ...blog, status: "published", date: "2099-01-01" },
        })
      ).ok(),
    ).toBeTruthy();
    expect((await request.get("/blog/" + categorySlug)).status()).toBe(404);
    expect(
      (
        await request.post("/api/cms/upload", {
          headers,
          multipart: {
            folder: "blog",
            file: {
              name: "unsafe.svg",
              mimeType: "image/svg+xml",
              buffer: Buffer.from('<svg onload="alert(1)"></svg>'),
            },
          },
        })
      ).status(),
    ).toBe(400);
  } finally {
    if (projectId) await request.delete("/api/cms/portfolio/" + projectId, { headers });
    if (blogId) await request.delete("/api/cms/blogs/" + blogId, { headers });
    await request.delete("/api/cms/portfolio-categories/" + category.id, { headers });
  }
});
test("homepage section editor saves to MySQL, protects unsaved changes, and remains responsive", async ({
  page,
  request,
}) => {
  await login(request);
  await page.context().addCookies((await request.storageState()).cookies);
  const sections = await (await request.get("/api/cms/homepage")).json();
  const heroRow = sections.find((s: { slug: string }) => s.slug === "hero");
  const original =
    typeof heroRow.content === "string" ? JSON.parse(heroRow.content) : heroRow.content;
  try {
    await page.goto("/admin/homepage");
    await expect(page.getByRole("heading", { name: "Hero Banner Settings" })).toBeVisible();
    await page.getByLabel("Main Heading", { exact: true }).fill("A verified CMS headline");
    await page
      .getByRole("navigation", { name: "Homepage sections" })
      .getByRole("button", { name: /Services/ })
      .click();
    await expect(page.getByRole("dialog")).toContainText("unsaved changes");
    await page.getByRole("button", { name: "Cancel", exact: true }).last().click();
    await page.getByRole("button", { name: "Save Changes", exact: true }).click();
    await expect(page.getByText("Banner updated successfully.")).toBeVisible();
    expect(await (await request.get("/")).text()).toContain("A verified CMS headline");
    await page
      .getByRole("navigation", { name: "Homepage sections" })
      .getByRole("button", { name: /Process/ })
      .click();
    await expect(page.getByRole("heading", { name: "Process Settings" })).toBeVisible();
    await expect(page).toHaveURL(/\/admin\/homepage$/);
    for (const width of [390, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
        width + 1,
      );
    }
    await page.setViewportSize({ width: 390, height: 844 });
    await page.getByRole("button", { name: "Open admin navigation" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await page.screenshot({ path: "qa-artifacts/admin-homepage-mobile.png", fullPage: true });
  } finally {
    await request.put("/api/cms/homepage/hero", { headers, data: original });
  }
});
test("login UI, project edit tabs, blog editor, and dashboard render", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/admin/login");
  await page.getByLabel("Email address").fill(credentials.email);
  await page.getByLabel("Password", { exact: false }).fill(credentials.password);
  await page.getByRole("button", { name: "Sign In →" }).click();
  await expect(page).toHaveURL(/\/admin\/?$/);
  await expect(page.getByRole("heading", { name: "Welcome back to WEBakoof." })).toBeVisible();
  await page.screenshot({ path: "qa-artifacts/admin-dashboard.png", fullPage: true });
  await page.goto("/admin/portfolio");
  await expect(page.getByText("Rockals", { exact: true })).toBeVisible();
  await page
    .locator("tr")
    .filter({ hasText: "Rockals" })
    .getByTitle("Edit", { exact: true })
    .click();
  await expect(page.getByLabel("Project Name *")).toHaveValue("Rockals");
  await page.getByRole("tab", { name: "Media", exact: true }).click();
  await expect(page.getByLabel("Showcase Video URL")).toHaveValue("/projects/rockals.mp4");
  await page.getByRole("button", { name: "Save Project", exact: true }).click();
  await expect(page.getByText("Project saved successfully.")).toBeVisible();
  await page.goto("/admin/blogs/new");
  await expect(page.locator(".tiptap")).toBeVisible();
  await page.locator(".tiptap").fill("Unsaved test text");
  await page
    .getByRole("navigation", { name: "Admin navigation" })
    .getByRole("link", { name: "Dashboard" })
    .click();
  await expect(page.getByRole("dialog")).toContainText("unsaved changes");
  await page.getByRole("button", { name: "Leave Anyway" }).click();
  await expect(page).toHaveURL(/\/admin\/?$/);
  expect(errors).toEqual([]);
});
