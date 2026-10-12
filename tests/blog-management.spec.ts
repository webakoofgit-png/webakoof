import { test, expect } from "@playwright/test";
import { readFileSync, existsSync } from "node:fs";
import { loadEnvFile } from "node:process";
import mysql from "mysql2/promise";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

if (existsSync(".env")) loadEnvFile(".env");
const origin = process.env["QA_BASE_URL"] || "http://127.0.0.1:8080";
const local = /^http:\/\/(127\.0\.0\.1|localhost):/.test(origin);
const headers = { Origin: origin };
const manifest: { slug: string; category: string; date: string; image: string }[] = JSON.parse(
  readFileSync("content/blog/manifest.json", "utf8"),
);
const credentials =
  local && existsSync(".local/admin-login.json")
    ? JSON.parse(readFileSync(".local/admin-login.json", "utf8"))
    : null;
test.describe.configure({ mode: "serial" });
test.skip(!credentials, "These tests mutate temporary content in the local CMS only.");

test("ten MySQL articles, metadata, categories, redirects and mobile layouts", async ({
  page,
  request,
}) => {
  test.setTimeout(120000);
  await page.goto("/blog");
  await expect(page.locator(".article-grid > .article-card")).toHaveCount(10);
  await expect(page.locator(".featured-article")).toHaveCount(0);
  await expect(page.locator(".article-grid > .article-card").first()).toContainText(
    "How Website Speed",
  );
  for (const category of new Set(manifest.map((r) => r.category))) {
    await page.getByRole("button", { name: category, exact: true }).click();
    await expect(page.locator(".article-grid > .article-card")).toHaveCount(
      manifest.filter((r) => r.category === category).length,
    );
  }
  for (const article of manifest) {
    const response = await page.goto(`/blog/${article.slug}`);
    expect(response?.status()).toBe(200);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator(".cms-rich-content h2").first()).toBeVisible();
    const description = await page.locator('meta[name="description"]').getAttribute("content");
    expect(description!.length).toBeGreaterThanOrEqual(150);
    expect(description!.length).toBeLessThanOrEqual(160);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      origin + `/blog/${article.slug}`,
    );
    const scripts = await page.locator('script[type="application/ld+json"]').allTextContents();
    const schema = scripts
      .map((s) => JSON.parse(s))
      .flatMap((s) => s["@graph"] || [])
      .find((s) => s["@type"] === "BlogPosting");
    expect(schema.datePublished).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(new Date(schema.datePublished).getTime()).toBeGreaterThan(
      new Date(article.date).getTime(),
    );
    expect(schema.dateModified).toBeTruthy();
    expect((await request.get(article.image)).status()).toBe(200);
    await page.setViewportSize({ width: 390, height: 844 });
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
    ).toBeTruthy();
    await page.setViewportSize({ width: 1440, height: 900 });
  }
  const redirect = await request.get("/blog/plan-a-business-website", { maxRedirects: 0 });
  expect(redirect.status()).toBe(301);
  expect(redirect.headers()["location"]).toContain("choose-website-development-company-pune");
  const sitemap = await (await request.get("/sitemap.xml")).text();
  for (const article of manifest) expect(sitemap).toContain(`/blog/${article.slug}`);
  expect(sitemap).not.toContain("/blog/plan-a-business-website");
});

test("admin create, rich editing, publish, unpublish, preview, upload and delete", async ({
  page,
  request,
}) => {
  test.setTimeout(120000);
  expect((await request.get("/api/cms/blogs")).status()).toBe(401);
  const login = await request.post("/api/cms/login", {
    headers,
    data: { ...credentials, remember: false },
  });
  expect(login.status(), await login.text()).toBe(200);
  await page.context().addCookies((await request.storageState()).cookies);
  const db = await mysql.createConnection({
    host: process.env["DB_HOST"],
    port: Number(process.env["DB_PORT"]),
    user: process.env["DB_USER"],
    password: process.env["DB_PASSWORD"],
    database: process.env["DB_NAME"],
  });
  const slug = "qa-blog-lifecycle-" + Date.now();
  let id: number | undefined;
  let uploadUrl = "";
  try {
    await page.goto("/admin/blogs/new");
    await page.getByLabel("Blog Title *", { exact: true }).fill("QA Blog Lifecycle");
    await page.getByLabel("Slug *", { exact: true }).fill(slug);
    const categories = await (await request.get("/api/cms/blog-categories")).json();
    await page.getByLabel("Category *", { exact: true }).selectOption(String(categories[0].id));
    await page.getByLabel("Editorial Display Date *", { exact: true }).fill("2026-06-05");
    await page
      .locator('.tiptap[contenteditable="true"]')
      .fill(
        "An article created through the existing admin editor, with enough content to exercise publishing and public rendering.",
      );
    await page.getByRole("button", { name: "Save Blog", exact: true }).click();
    await expect(page).toHaveURL(/\/admin\/blogs$/);
    let record = (await (await request.get("/api/cms/blogs")).json()).find(
      (r: { slug: string }) => r.slug === slug,
    );
    id = record.id;
    expect(record.status).toBe("draft");
    expect(record.published_at).toBeNull();
    expect((await request.get("/blog/" + slug)).status()).toBe(404);
    await page.goto(`/admin/preview/blogs/${id}`);
    await expect(
      page.getByRole("heading", { name: "QA Blog Lifecycle", exact: true }),
    ).toBeVisible();
    await page.goto(`/admin/blogs/${id}`);
    await page.getByLabel("Status", { exact: true }).selectOption("published");
    await page.getByRole("button", { name: "Save Blog", exact: true }).click();
    await expect(page.getByText("Blog published successfully.")).toBeVisible();
    record = (await (await request.get(`/api/cms/blogs/${id}`)).json())[0];
    expect(record.published_at).toBeTruthy();
    const publishedAt = record.published_at;
    const unsafe =
      '<h2>Updated heading</h2><p>A saved update visible without deploying code, with a useful paragraph for readers.</p><script>alert(1)</script><img src="x" onerror="alert(1)">';
    expect(
      (
        await request.put(`/api/cms/blogs/${id}`, { headers, data: { ...record, html: unsafe } })
      ).status(),
    ).toBe(200);
    const html = await (await request.get("/blog/" + slug)).text();
    expect(html).toContain("Updated heading");
    expect(html).not.toContain("onerror=");
    expect(html).not.toContain("<script>alert(1)</script>");
    record = (await (await request.get(`/api/cms/blogs/${id}`)).json())[0];
    expect(record.published_at).toBe(publishedAt);
    const image = readFileSync("src/assets/webakoof_logo.png");
    const upload = await request.post("/api/cms/upload", {
      headers,
      multipart: {
        folder: "blog",
        file: { name: "qa.png", mimeType: "image/png", buffer: image },
      },
    });
    expect(upload.status(), await upload.text()).toBe(200);
    uploadUrl = (await upload.json()).url;
    const imageResponse = await request.get(uploadUrl);
    expect(await imageResponse.body()).toEqual(image);
    const [stored] = await db.query<mysql.RowDataPacket[]>(
      "SELECT LENGTH(b.bytes) size FROM media_blobs b JOIN media m ON m.id=b.media_id WHERE m.url=?",
      [uploadUrl],
    );
    expect(stored[0]!["size"]).toBe(image.length);
    const invalid = await request.post("/api/cms/upload", {
      headers,
      multipart: {
        folder: "blog",
        file: {
          name: "bad.svg",
          mimeType: "image/svg+xml",
          buffer: Buffer.from('<svg onload="alert(1)"/>'),
        },
      },
    });
    expect(invalid.status()).toBe(400);
    expect(
      (
        await request.put(`/api/cms/blogs/${id}`, { headers, data: { ...record, status: "draft" } })
      ).status(),
    ).toBe(200);
    expect((await request.get("/blog/" + slug)).status()).toBe(404);
    expect(await (await request.get("/sitemap.xml")).text()).not.toContain("/blog/" + slug);
    await page.goto("/admin/blogs");
    await page.getByLabel("Search content").fill("QA Blog Lifecycle");
    await page
      .locator("tr")
      .filter({ hasText: "QA Blog Lifecycle" })
      .getByTitle("Delete", { exact: true })
      .click();
    await expect(page.getByRole("dialog")).toContainText("cannot be undone");
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "Delete Blog?", exact: true })
      .click();
    await expect(page.getByText("Deleted successfully.")).toBeVisible();
    expect((await (await request.get(`/api/cms/blogs/${id}`)).json()).length).toBe(0);
  } finally {
    if (id) await request.delete(`/api/cms/blogs/${id}`, { headers });
    if (uploadUrl) await db.execute("DELETE FROM media WHERE url=?", [uploadUrl]);
    await db.end();
  }
});

test("repeatable import preserves admin-edited seed content", async ({ request }) => {
  test.setTimeout(120000);
  const login = await request.post("/api/cms/login", {
    headers,
    data: { ...credentials, remember: false },
  });
  expect(login.status()).toBe(200);
  const before = await (await request.get("/api/cms/blogs")).json();
  const record = before.find((r: { slug: string }) => r.slug === manifest[0]!.slug);
  try {
    const updated = { ...record, title: "QA admin edit must survive import" };
    expect(
      (await request.put(`/api/cms/blogs/${record.id}`, { headers, data: updated })).status(),
    ).toBe(200);
    await promisify(execFile)(
      process.execPath,
      ["--env-file=.env", "--import", "tsx", "scripts/import-blogs.ts", "--apply"],
      { timeout: 60000 },
    );
    const after = await (await request.get("/api/cms/blogs")).json();
    expect(after.length).toBe(before.length);
    expect(after.find((r: { id: number }) => r.id === record.id).title).toBe(updated.title);
  } finally {
    expect(
      (await request.put(`/api/cms/blogs/${record.id}`, { headers, data: record })).status(),
    ).toBe(200);
  }
});
