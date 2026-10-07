import { test, expect } from "@playwright/test";
import { existsSync, readFileSync } from "node:fs";
import { inflateSync } from "node:zlib";

const credentials = existsSync(".local/admin-login.json")
  ? JSON.parse(readFileSync(".local/admin-login.json", "utf8"))
  : null;
test.skip(!credentials, "Requires local CMS test credentials.");
const headers = { Origin: process.env["QA_BASE_URL"] || "http://127.0.0.1:8080" };

test("MySQL sector filters, catalogue controls, PDF eligibility, links and mobile layout", async ({
  page,
  request,
}) => {
  test.setTimeout(120000);
  const prefix = "qa-catalogue-" + Date.now();
  const categoryIds: number[] = [];
  const projectIds: number[] = [];
  const login = await request.post("/api/cms/login", {
    headers,
    data: { ...credentials, remember: false },
  });
  expect(login.ok()).toBeTruthy();
  await page.context().addCookies((await request.storageState()).cookies);
  const settings = await (await request.get("/api/cms/settings")).json();
  try {
    for (const suffix of ["sector", "empty"]) {
      const response = await request.post("/api/cms/portfolio-categories", {
        headers,
        data: {
          name: prefix + "-" + suffix,
          slug: prefix + "-" + suffix,
          status: "active",
          description: "",
        },
      });
      expect(response.ok()).toBeTruthy();
      const categories = await (await request.get("/api/cms/portfolio-categories")).json();
      categoryIds.push(
        categories.find((c: { slug: string }) => c.slug === prefix + "-" + suffix).id,
      );
    }
    const initialResponse = await request.post("/api/cms/portfolio", {
      headers,
      data: {
        name: prefix + "-first",
        slug: prefix + "-first",
        category_id: categoryIds[0],
        status: "draft",
        featured: false,
        image: "/projects/Rockals.png",
        description: "Catalogue verification",
      },
    });
    expect(initialResponse.ok()).toBeTruthy();
    const initialRecords = await (await request.get("/api/cms/portfolio")).json();
    const initialId = initialRecords.find((p: { slug: string }) => p.slug === prefix + "-first").id;
    projectIds.push(initialId);
    await page.goto(`/admin/portfolio/${initialId}`);
    await page.getByLabel("Project Name *", { exact: true }).fill(prefix + "-first");
    await page.getByLabel("Category *", { exact: true }).selectOption(String(categoryIds[0]));
    await page.getByLabel("Website URL", { exact: true }).fill("https://example.com/first");
    await page.getByRole("switch").check();
    await page.getByLabel("Catalogue Order", { exact: true }).fill("1");
    await page.getByLabel("Status", { exact: true }).selectOption("published");
    await page.getByRole("button", { name: "Save Project", exact: true }).click();
    await expect(page.getByText("Project saved successfully.", { exact: true })).toBeVisible();
    let records = await (await request.get("/api/cms/portfolio")).json();
    const first = records.find((p: { slug: string }) => p.slug === prefix + "-first");
    expect(first.include_in_catalogue).toBe(true);
    expect(first.catalogue_order).toBe(1);
    for (const [name, status, included, order] of [
      ["second", "published", true, 2],
      ["newest", "published", true, null],
      ["excluded", "published", false, 0],
      ["draft", "draft", true, 0],
    ] as const) {
      const response = await request.post("/api/cms/portfolio", {
        headers,
        data: {
          name: prefix + "-" + name,
          slug: prefix + "-" + name,
          category_id: categoryIds[0],
          status,
          featured: false,
          image: "/projects/Rockals.png",
          description: "Catalogue verification",
          service: "Corporate Website",
          liveUrl: "https://example.com/" + name,
          include_in_catalogue: included,
          catalogue_order: order,
        },
      });
      expect(response.ok(), await response.text()).toBeTruthy();
      records = await (await request.get("/api/cms/portfolio")).json();
      projectIds.push(records.find((p: { slug: string }) => p.slug === prefix + "-" + name).id);
    }
    await page.goto(`/portfolio?sector=${prefix}-sector`);
    await expect(
      page.getByRole("button", { name: prefix + "-sector", exact: true }),
    ).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator(".result-count")).toContainText("4 Projects");
    await expect(page.locator(".project-card")).toHaveCount(4);
    const downloadButton = page.getByRole("button", {
      name: `Download ${prefix}-sector Catalogue`,
    });
    const [download] = await Promise.all([page.waitForEvent("download"), downloadButton.click()]);
    expect(download.suggestedFilename()).toBe(`WEBakoof-${prefix}-sector-portfolio.pdf`);
    const file = await download.path();
    await download.saveAs("qa-artifacts/portfolio-sector-catalogue.pdf");
    const raw = readFileSync(file!).toString("latin1");
    expect(raw.startsWith("%PDF-")).toBeTruthy();
    const streams = [...raw.matchAll(/stream\r?\n([\s\S]*?)\r?\nendstream/g)]
      .map((match) => {
        try {
          return inflateSync(Buffer.from(match[1]!, "latin1")).toString("latin1");
        } catch {
          return match[1]!;
        }
      })
      .join("\n");
    expect(streams).toContain(prefix + "-first");
    expect(streams.indexOf(prefix + "-first")).toBeLessThan(streams.indexOf(prefix + "-second"));
    expect(streams.indexOf(prefix + "-second")).toBeLessThan(streams.indexOf(prefix + "-newest"));
    expect(streams).not.toContain(prefix + "-excluded");
    expect(streams).not.toContain(prefix + "-draft");
    expect(raw).toContain("/URI (https://example.com/first)");
    expect(raw).toContain("/Subtype /Image");
    expect(streams).toContain("Have a project in mind?");
    if (settings.email) expect(raw).toContain("mailto:" + settings.email);
    await page.getByRole("button", { name: prefix + "-empty", exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`sector=${prefix}-empty`));
    await expect(page.getByText("No projects available in this sector yet.")).toBeVisible();
    await expect(page.locator(".catalogue-download")).toHaveCount(0);
    await page.goBack();
    await expect(page.locator(".project-card")).toHaveCount(4);
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(page.locator(".catalogue-download")).toBeVisible();
    const countBox = await page.locator(".result-count").boundingBox();
    const buttonBox = await page.locator(".catalogue-download").boundingBox();
    expect(buttonBox!.y).toBeGreaterThan(countBox!.y + countBox!.height);
    await page.screenshot({ path: "qa-artifacts/portfolio-catalogue-mobile.png", fullPage: true });
    await page.getByRole("button", { name: "All", exact: true }).click();
    await expect(page).not.toHaveURL(/sector=/);
    await expect(page.getByRole("button", { name: "Download Complete Portfolio" })).toBeVisible();
    const [complete] = await Promise.all([
      page.waitForEvent("download"),
      page.getByRole("button", { name: "Download Complete Portfolio" }).click(),
    ]);
    expect(complete.suggestedFilename()).toBe("WEBakoof-complete-portfolio.pdf");
    await complete.saveAs("qa-artifacts/portfolio-complete-catalogue.pdf");
  } finally {
    // Remove only the fixtures created by this test.
    for (const id of projectIds) await request.delete(`/api/cms/portfolio/${id}`, { headers });
    for (const id of categoryIds)
      await request.delete(`/api/cms/portfolio-categories/${id}`, { headers });
  }
});
