import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
const projects = JSON.parse(readFileSync("content/portfolio/new-projects.json", "utf8")) as {
  name: string;
  slug: string;
  liveUrl: string;
  service: string;
}[];

test("four portfolio projects, categories, images, links and responsive layout", async ({
  page,
  baseURL,
}) => {
  await page.goto("/portfolio");
  for (const project of projects) {
    const card = page
      .locator(".project-card")
      .filter({ has: page.getByRole("heading", { name: project.name, exact: true }) });
    await expect(card).toHaveCount(1);
    await expect(card.locator(".project-service")).toHaveText(project.service);
    await expect(card.locator(".project-image")).toHaveAttribute(
      "href",
      `/portfolio/${project.slug}`,
    );
    await card.locator("img").scrollIntoViewIfNeeded();
    await expect
      .poll(() =>
        card
          .locator("img")
          .evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0),
      )
      .toBe(true);
    const response = await page.request.get(`/portfolio/${project.slug}`);
    expect(response.status()).toBe(200);
  }
  for (const [category, expected] of [
    ["Industrial", projects.slice(0, 3)],
    ["Construction", projects.slice(0, 1)],
    ["Agro Tourism", projects.slice(3)],
  ] as const) {
    await page.getByRole("button", { name: category, exact: true }).click();
    await expect(page.locator(".project-card")).toHaveCount(expected.length);
    for (const project of expected)
      await expect(page.getByRole("heading", { name: project.name, exact: true })).toBeVisible();
  }
  await page.getByRole("button", { name: "All", exact: true }).click();
  for (const width of [390, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      width + 1,
    );
    await page.screenshot({
      path: `qa-artifacts/portfolio-${new URL(baseURL!).hostname}-${width}.png`,
      fullPage: true,
    });
  }
});

test("admin editor preserves additional categories; API validates references and supports CRUD", async ({
  page,
  baseURL,
}) => {
  test.skip(
    !baseURL || !/^http:\/\/(127\.0\.0\.1|localhost):/.test(baseURL),
    "Local mutations only",
  );
  const headers = { Origin: baseURL! };
  const credentials = JSON.parse(readFileSync(".local/admin-login.json", "utf8"));
  expect(
    (
      await page.request.post("/api/cms/login", {
        headers,
        data: { ...credentials, remember: false },
      })
    ).status(),
  ).toBe(200);
  const records = await (await page.request.get("/api/cms/portfolio")).json();
  const impact = records.find((record: { slug: string }) => record.slug === "impact-infra-india");
  await page.goto(`/admin/portfolio/${impact.id}`);
  await expect(page.getByLabel("Project Name *")).toHaveValue("Impact Infra India");
  await expect(page.getByRole("checkbox", { name: "Construction", exact: true })).toBeChecked();
  const categories = await (await page.request.get("/api/cms/portfolio-categories")).json();
  const slug = `qa-multi-category-${Date.now()}`;
  let id: number | undefined;
  let secondaryId: number | undefined;
  try {
    expect(
      (
        await page.request.post("/api/cms/portfolio-categories", {
          headers,
          data: { name: slug, slug, status: "active" },
        })
      ).ok(),
    ).toBeTruthy();
    secondaryId = (await (await page.request.get("/api/cms/portfolio-categories")).json()).find(
      (c: { slug: string }) => c.slug === slug,
    ).id;
    const data = {
      ...impact,
      slug,
      name: "QA multi category",
      category_id: categories[0].id,
      category_ids: [secondaryId],
      status: "draft",
    };
    expect((await page.request.post("/api/cms/portfolio", { headers, data })).ok()).toBeTruthy();
    id = (await (await page.request.get("/api/cms/portfolio")).json()).find(
      (p: { slug: string }) => p.slug === slug,
    ).id;
    expect(
      (
        await page.request.delete(`/api/cms/portfolio-categories/${secondaryId}`, { headers })
      ).status(),
    ).toBe(409);
    expect(
      (
        await page.request.put(`/api/cms/portfolio/${id}`, {
          headers,
          data: { ...data, description: "Verified edit" },
        })
      ).ok(),
    ).toBeTruthy();
    expect((await (await page.request.get(`/api/cms/portfolio/${id}`)).json())[0].description).toBe(
      "Verified edit",
    );
    expect(
      (
        await page.request.put(`/api/cms/portfolio/${id}`, {
          headers,
          data: { ...data, category_ids: [2147483647] },
        })
      ).status(),
    ).toBe(400);
    expect(
      (
        await page.request.post("/api/cms/portfolio", {
          headers: { Origin: "https://wrong.invalid" },
          data,
        })
      ).status(),
    ).toBe(403);
  } finally {
    if (id)
      expect(
        (await page.request.delete(`/api/cms/portfolio/${id}`, { headers })).ok(),
      ).toBeTruthy();
    if (secondaryId)
      expect(
        (
          await page.request.delete(`/api/cms/portfolio-categories/${secondaryId}`, { headers })
        ).ok(),
      ).toBeTruthy();
    await page.request.post("/api/cms/logout", { headers, data: {} });
  }
  expect((await page.request.get("/api/cms/portfolio")).status()).toBe(401);
});
