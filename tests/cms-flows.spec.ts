import { test, expect } from "@playwright/test";
import { existsSync, readFileSync } from "node:fs";
import { loadEnvFile } from "node:process";
import mysql from "mysql2/promise";
import { unlink } from "node:fs/promises";
import { resolve } from "node:path";
if (existsSync(".env")) loadEnvFile(".env");
const credentials: { email: string; password: string } = existsSync(".local/admin-login.json")
  ? JSON.parse(readFileSync(".local/admin-login.json", "utf8"))
  : { email: "", password: "" };
const origin = process.env["QA_BASE_URL"] || "http://127.0.0.1:8080";
const headers = { Origin: origin };
test.skip(!credentials.email, "Requires the isolated local CMS database.");
test("contact form, enquiry status, valid uploads, settings, category editor, and blog publish work end to end", async ({
  page,
  request,
}) => {
  test.setTimeout(120000);
  page.setDefaultTimeout(15000);
  const db = await mysql.createConnection({
    host: process.env["DB_HOST"],
    port: Number(process.env["DB_PORT"]),
    user: process.env["DB_USER"],
    password: process.env["DB_PASSWORD"],
    database: process.env["DB_NAME"],
  });
  const email = `qa-${Date.now()}@example.com`;
  const slug = "qa-browser-" + Date.now();
  let uploaded = "";
  let categoryId: number | undefined;
  let blogId: number | undefined;
  let settings: Record<string, string> | undefined;
  try {
    await page.goto("/contact");
    await page.getByLabel("Full Name").fill("CMS Verification");
    await page.getByLabel("Business Name").fill("Local QA");
    await page.getByLabel("Phone Number").fill("+91 9000000000");
    await page.getByLabel("Email Address").fill(email);
    await page.getByLabel("Service Required").selectOption("Website Development");
    await page
      .getByLabel("Project Description")
      .fill("A temporary enquiry to verify the MySQL contact form flow.");
    await page.getByRole("checkbox").check();
    await page.getByRole("button", { name: "Send Project Enquiry" }).click();
    await expect(
      page.getByText("Your project enquiry has been sent.", { exact: false }),
    ).toBeVisible();
    const login = await request.post("/api/cms/login", {
      headers,
      data: { ...credentials, remember: false },
    });
    expect(login.status(), await login.text()).toBe(200);
    await page.context().addCookies((await request.storageState()).cookies);
    await page.goto("/admin/enquiries");
    await page
      .locator("tr")
      .filter({ hasText: "CMS Verification" })
      .getByTitle("View enquiry")
      .click();
    await expect(page.getByRole("dialog")).toContainText(email);
    await page.getByRole("button", { name: "Mark as Contacted" }).click();
    await expect(page.getByText("Enquiry status updated.")).toBeVisible();
    await page.getByRole("button", { name: "Mark as Closed" }).click();
    await expect(page.getByRole("dialog").getByText("closed", { exact: true })).toBeVisible();
    await page.keyboard.press("Escape");
    const image = readFileSync("src/assets/project-skincity-desktop.png");
    const upload = await request.post("/api/cms/upload", {
      headers,
      multipart: {
        folder: "blog",
        file: { name: "qa-image.png", mimeType: "image/png", buffer: image },
      },
    });
    expect(upload.status(), await upload.text()).toBe(200);
    uploaded = (await upload.json()).url;
    expect((await request.get(uploaded)).headers()["content-type"]).toBe("image/png");
    settings = await (await request.get("/api/cms/settings")).json();
    expect(
      (
        await request.put("/api/cms/settings", {
          headers,
          data: {
            ...settings,
            email: "cms-test@example.com",
            metaTitle: "Verified CMS default title",
            favicon: uploaded,
          },
        })
      ).ok(),
    ).toBeTruthy();
    await page.goto("/");
    await expect(page).toHaveTitle("Verified CMS default title | Webakoof");
    await expect(page.locator("link[rel=icon]")).toHaveAttribute("href", uploaded);
    await page.goto("/contact");
    await expect(page.locator(".contact-methods")).toContainText("cms-test@example.com");
    await page.goto("/admin/blogs/categories");
    await page.getByRole("button", { name: "Add Category" }).click();
    await page.getByLabel("Category Name *").fill(slug);
    await page.getByRole("button", { name: "Save Category" }).click();
    await expect(page.getByText("Category saved successfully.")).toBeVisible();
    categoryId = (await (await request.get("/api/cms/blog-categories")).json()).find(
      (r: { slug: string }) => r.slug === slug,
    ).id;
    await page.goto("/admin/blogs/new");
    await page.getByLabel("Blog Title *").fill(slug);
    await page.getByLabel("Category *").selectOption(String(categoryId));
    await page.locator(".tiptap").fill("Published through the real blog editor.");
    await page.getByLabel("Status", { exact: true }).selectOption("published");
    await page.getByRole("button", { name: "Save Blog" }).click();
    await expect(page).toHaveURL(/\/admin\/blogs$/);
    blogId = (await (await request.get("/api/cms/blogs")).json()).find(
      (r: { slug: string }) => r.slug === slug,
    ).id;
    await page.goto("/blog/" + slug);
    await expect(page.locator(".article-body")).toContainText(
      "Published through the real blog editor.",
    );
  } finally {
    if (settings)
      await db.execute("UPDATE website_settings SET content=? WHERE id=1", [
        JSON.stringify(settings),
      ]);
    if (blogId) await db.execute("DELETE FROM blog_posts WHERE id=?", [blogId]);
    if (categoryId) await db.execute("DELETE FROM blog_categories WHERE id=?", [categoryId]);
    await db.execute("DELETE FROM contact_enquiries WHERE email=?", [email]);
    if (uploaded) {
      await db.execute("DELETE FROM media WHERE url=?", [uploaded]);
      await unlink(resolve("uploads", uploaded.replace("/uploads/", "")));
    }
    await db.end();
  }
});
