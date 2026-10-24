import { test, expect } from "@playwright/test";
import { existsSync, readFileSync } from "node:fs";

const credentials = existsSync(".local/admin-login.json")
  ? JSON.parse(readFileSync(".local/admin-login.json", "utf8"))
  : null;
test("local CMS availability, privacy, screenshots, internal cards, SEO and offline PDF", async ({
  page,
  request,
  playwright,
  baseURL,
}) => {
  test.skip(
    !credentials || !["127.0.0.1", "localhost"].includes(new URL(baseURL!).hostname),
    "Local fixtures only.",
  );
  test.setTimeout(120000);
  const headers = { Origin: baseURL! };
  const anonymous = await playwright.request.newContext({ baseURL });
  expect(
    (
      await anonymous.post("/api/cms/check-website", { headers, data: { url: "http://127.0.0.1" } })
    ).status(),
  ).toBe(401);
  await anonymous.dispose();
  expect(
    (
      await request.post("/api/cms/login", { headers, data: { ...credentials, remember: false } })
    ).ok(),
  ).toBeTruthy();
  await page.context().addCookies((await request.storageState()).cookies);
  const before = await (await request.get("/api/cms/portfolio")).json();
  const categories = await (await request.get("/api/cms/portfolio-categories")).json();
  const image =
    before.find((p: { image: string }) => p.image.startsWith("/uploads/"))?.image ||
    "/projects/Rockals.png";
  const slug = "qa-availability-" + Date.now();
  let id: number | undefined;
  try {
    const created = await request.post("/api/cms/portfolio", {
      headers,
      data: {
        name: slug,
        slug,
        category_id: categories[0].id,
        status: "published",
        featured: false,
        image,
        desktopImage: image,
        mobileImage: image,
        gallery: [{ url: image, alt: "Independent screenshot" }],
        description: "Availability regression fixture",
        overview: "Preserved overview",
        challenge: "Preserved challenge",
        approach: "Preserved approach",
        solution: "Preserved solution",
        result: "Preserved result",
        features: ["Responsive layout"],
        tags: ["React"],
        liveUrl: "https://example.invalid/offline-client",
        include_in_catalogue: true,
        adminNotes: "PRIVATE-AVAILABILITY-NOTE",
        metaTitle: slug + " SEO",
        metaDescription: "Preserved SEO description",
      },
    });
    expect(created.ok(), await created.text()).toBeTruthy();
    const records = await (await request.get("/api/cms/portfolio")).json();
    id = records.find((p: { slug: string }) => p.slug === slug).id;
    await page.goto(`/portfolio/${slug}`);
    await expect(page.locator(".case-actions a")).toHaveAttribute(
      "href",
      "https://example.invalid/offline-client",
    );
    await expect(page.locator(".case-availability-notice")).toHaveCount(0);
    await page.goto(`/admin/portfolio/${id}`);
    await page.getByRole("tab", { name: "Project Details", exact: true }).click();
    await expect(page.getByLabel("Website Availability", { exact: true })).toHaveValue("live");
    await page.getByLabel("Website Availability", { exact: true }).selectOption("domain_expired");
    await page.getByRole("button", { name: "Save Project", exact: true }).click();
    await expect(page.getByText("Project saved successfully.", { exact: true })).toBeVisible();
    const saved = (await (await request.get(`/api/cms/portfolio/${id}`)).json())[0];
    expect(saved.websiteAvailability).toBe("domain_expired");
    expect(saved.websiteStatusUpdatedAt).toMatch(/^\d{4}-/);
    expect(saved.liveUrl).toBe("https://example.invalid/offline-client");
    expect(saved.approach).toBe("Preserved approach");
    await page.getByRole("tab", { name: "Basic Info", exact: true }).click();
    await page.getByLabel("Website URL", { exact: true }).fill("http://127.0.0.1");
    await page.getByRole("tab", { name: "Project Details", exact: true }).click();
    await page.getByRole("button", { name: "Check Website Status", exact: true }).click();
    await expect(
      page.getByText(/Private, internal and reserved destinations are blocked/),
    ).toBeVisible();
    await expect(page.getByLabel("Website Availability", { exact: true })).toHaveValue(
      "domain_expired",
    );
    await page.getByRole("button", { name: "Save Project", exact: true }).click();
    await expect
      .poll(
        async () =>
          (await (await request.get(`/api/cms/portfolio/${id}`)).json())[0].lastCheckResult,
      )
      .toContain("blocked");
    await page.getByRole("tab", { name: "Basic Info", exact: true }).click();
    await page.getByLabel("Website URL", { exact: true }).fill(saved.liveUrl);
    await page.getByRole("button", { name: "Save Project", exact: true }).click();
    await expect
      .poll(async () => (await (await request.get(`/api/cms/portfolio/${id}`)).json())[0].liveUrl)
      .toBe(saved.liveUrl);
    expect((await (await request.get(`/api/cms/portfolio/${id}`)).json())[0].lastCheckResult).toBe(
      "",
    );
    expect(
      (
        await request.put(`/api/cms/portfolio/${id}`, {
          headers,
          data: { ...saved, image: "https://client.invalid/screenshot.png" },
        })
      ).status(),
    ).toBe(400);
    const checked = await (
      await request.post("/api/cms/check-website", {
        headers,
        data: { url: "http://169.254.169.254" },
      })
    ).json();
    expect(checked.result).toContain("blocked");
    expect(
      (await (await request.get(`/api/cms/portfolio/${id}`)).json())[0].websiteAvailability,
    ).toBe("domain_expired");
    const response = await page.goto(`/portfolio/${slug}`);
    expect(response!.status()).toBe(200);
    const html = await response!.text();
    expect(html).not.toContain("PRIVATE-AVAILABILITY-NOTE");
    await expect(page.locator(".case-actions a")).toHaveCount(0);
    await expect(page.locator(".case-availability-notice")).toBeVisible();
    await expect(page).toHaveTitle(slug + " SEO | Webakoof");
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      "content",
      "Preserved SEO description",
    );
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      new RegExp(`/portfolio/${slug}$`),
    );
    await expect
      .poll(() =>
        page
          .locator(".case-main-image")
          .evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0),
      )
      .toBe(true);
    expect((await request.get(image)).status()).toBe(200);
    expect(await (await request.get("/sitemap.xml")).text()).toContain(`/portfolio/${slug}`);
    await page.setViewportSize({ width: 390, height: 844 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      391,
    );
    await page.goto("/portfolio");
    const card = page
      .locator(".project-card")
      .filter({ has: page.getByRole("heading", { name: slug, exact: true }) });
    await expect(card.locator(".project-image")).toHaveAttribute("href", `/portfolio/${slug}`);
    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.getByRole("button", { name: "Download Complete Portfolio" }).click(),
    ]);
    const pdf = readFileSync((await download.path())!).toString("latin1");
    expect(pdf).toContain(`/portfolio/${slug}`);
    expect(pdf).not.toContain("/URI (https://example.invalid/offline-client)");
    expect(pdf).not.toContain("PRIVATE-AVAILABILITY-NOTE");
    expect(pdf).toContain("/Subtype /Image");
    for (const status of ["temporarily_unavailable", "permanently_offline", "live"]) {
      expect(
        (
          await request.put(`/api/cms/portfolio/${id}`, {
            headers,
            data: { ...saved, websiteAvailability: status },
          })
        ).ok(),
      ).toBeTruthy();
      await page.goto(`/portfolio/${slug}`);
      await expect(page.locator(".case-actions a")).toHaveCount(status === "live" ? 1 : 0);
    }
  } finally {
    if (id) await request.delete(`/api/cms/portfolio/${id}`, { headers });
    const after = await (await request.get("/api/cms/portfolio")).json();
    expect(after).toEqual(before);
  }
});
