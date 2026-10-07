import { test, expect } from "@playwright/test";
import { existsSync } from "node:fs";
import { loadEnvFile } from "node:process";
if (existsSync(".env")) loadEnvFile(".env");
const routes = [
  "/",
  "/about",
  "/services",
  "/services/website-development",
  "/services/ecommerce-development",
  "/services/custom-web-development",
  "/services/seo",
  "/services/website-redesign",
  "/services/website-maintenance",
  "/portfolio",
  "/portfolio/rockals",
  "/portfolio/skincity-india",
  "/portfolio/aurora-botanics",
  "/portfolio/vertex-health",
  "/portfolio/northstar-estates",
  "/blog",
  "/blog/plan-a-business-website",
  "/blog/ecommerce-product-page-checklist",
  "/blog/useful-website-measurement",
  "/contact",
  "/privacy-policy",
  "/terms-and-conditions",
];
for (const width of [320, 375, 390, 430, 768, 1024, 1440]) {
  test(`All routes render without overflow at ${width}px`, async ({ page }) => {
    test.setTimeout(180000);
    await page.setViewportSize({ width, height: 900 });
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (m) => {
      if (m.type() === "error" && !m.text().includes("net::ERR_")) errors.push(m.text());
    });
    const titles = new Set<string>();
    for (const path of routes) {
      const response = await page.goto(path);
      expect(response?.status(), path).toBe(200);
      await expect(page.locator("h1")).toHaveCount(1);
      await expect(page.locator("header")).toHaveCount(1);
      await expect(page.locator("footer")).toHaveCount(1);
      await page.waitForTimeout(100);
      const title = await page.title();
      expect(titles.has(title), `unique title ${path}`).toBe(false);
      titles.add(title);
      expect(await page.locator('meta[name="description"]').getAttribute("content")).toBeTruthy();
      const canonical = new URL(
        (await page.locator('link[rel="canonical"]').getAttribute("href"))!,
      );
      expect(canonical.pathname).toBe(path);
      expect(["http:", "https:"]).toContain(canonical.protocol);
      const layout = await page.evaluate(() => ({
        width: innerWidth,
        scroll: document.documentElement.scrollWidth,
        bad: [...document.querySelectorAll("h1,h2,h3,input,select,textarea")]
          .filter((el) => {
            if (el.closest("[aria-hidden=true]")) return false;
            const r = el.getBoundingClientRect();
            return r.width > 0 && (r.right > innerWidth + 1 || r.left < -1);
          })
          .map((el) => el.textContent?.slice(0, 70)),
      }));
      expect(layout.scroll, `${path} document width`).toBeLessThanOrEqual(width + 1);
      expect(layout.bad, `${path} clipped content`).toEqual([]);
      expect(await page.locator('header a[href^="#"],footer a[href^="#"]').count()).toBe(0);
      const brokenImages = await page.evaluate(async () => {
        const results = await Promise.all(
          [...document.images].map(async (element) => {
            const image = new Image();
            image.src = element.currentSrc || element.src;
            try {
              await image.decode();
              return null;
            } catch {
              return image.src;
            }
          }),
        );
        return results.filter(Boolean);
      });
      expect(brokenImages, `images ${path}`).toEqual([]);
    }
    expect(errors).toEqual([]);
  });
}
test("desktop routing, refresh, history, mega-menu and scroll", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await page
    .locator('nav[aria-label="Primary navigation"]')
    .getByRole("link", { name: "About", exact: true })
    .click();
  await expect(page).toHaveURL(/\/about$/);
  await expect(page.locator("h1")).toContainText("creativity");
  await page.reload();
  await expect(page.locator("h1")).toContainText("creativity");
  await page.evaluate(() => scrollTo(0, 1000));
  await page
    .locator('nav[aria-label="Primary navigation"]')
    .getByRole("link", { name: "Services", exact: true })
    .click();
  await expect(page).toHaveURL(/\/services\/?$/);
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
  await page.goBack();
  await expect(page).toHaveURL(/\/about$/);
  await page.goForward();
  await expect(page).toHaveURL(/\/services\/?$/);
  await page.getByRole("button", { name: "Explore services", exact: true }).click();
  await expect(page.locator("#service-menu")).toBeVisible();
  await page
    .locator("#service-menu")
    .getByRole("link", { name: /SEO & Google Growth/ })
    .click();
  await expect(page).toHaveURL(/\/services\/seo$/);
  await expect(page.locator("#service-menu")).toHaveCount(0);
  await page.getByRole("button", { name: "Do you guarantee a first-page ranking?" }).click();
  await expect(page.getByText("No. Rankings depend")).toBeVisible();
});
test("mobile drawer closes on navigation and Escape", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");
  await page.getByRole("button", { name: "Open navigation" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("dialog").getByRole("link", { name: "About", exact: true }).click();
  await expect(page).toHaveURL(/\/about$/);
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.getByRole("button", { name: "Open navigation" }).click();
  await page.getByText("Explore our services", { exact: true }).click();
  await page
    .getByRole("dialog")
    .getByRole("link", { name: "E-Commerce Development", exact: true })
    .click();
  await expect(page).toHaveURL(/\/services\/ecommerce-development$/);
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.getByRole("button", { name: "Open navigation" }).click();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
});
test("portfolio and blog filters and missing slugs", async ({ page }) => {
  await page.goto("/portfolio");
  await page.getByRole("button", { name: "Healthcare", exact: true }).click();
  await expect(page.locator(".project-card")).toHaveCount(2);
  await expect(page.locator(".project-card").filter({ hasText: "Vertex Health" })).toBeVisible();
  await page.getByRole("button", { name: "Corporate", exact: true }).click();
  await expect(page.locator(".project-card")).toHaveCount(1);
  await page.getByRole("button", { name: "All", exact: true }).click();
  await expect(page.locator(".project-card")).toHaveCount(5);
  await page.goto("/blog");
  await page.getByRole("button", { name: "E-Commerce", exact: true }).click();
  await expect(page.locator(".article-card")).toHaveCount(1);
  for (const path of ["/missing", "/services/missing", "/portfolio/missing", "/blog/missing"]) {
    const response = await page.goto(path);
    expect(response?.status()).toBe(404);
    await expect(page.locator("h1")).toContainText("404");
  }
});
test("form validates and never claims delivery when unconfigured", async ({ page }) => {
  test.skip(
    process.env["CMS_ENABLED"] === "true",
    "MySQL form delivery is covered by cms-flows.spec.ts.",
  );
  await page.goto("/contact");
  await page.getByRole("button", { name: "Send Project Enquiry" }).click();
  await expect(page.locator(".form-status")).toHaveCount(0);
  await page.getByLabel("Full Name").fill("QA Test");
  await page.getByLabel("Business Name").fill("Local QA");
  await page.getByLabel("Phone Number").fill("+91 9000000000");
  await page.getByLabel("Email Address").fill("qa@example.com");
  await page.getByLabel("Service Required").selectOption("Website Development");
  await page
    .getByLabel("Project Description")
    .fill("Local test brief for website quality assurance.");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Send Project Enquiry" }).click();
  await expect(page.getByRole("alert")).toContainText("has not been sent");
  await expect(page.getByLabel("Full Name")).toHaveValue("QA Test");
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download your brief" }).click();
  expect((await download).suggestedFilename()).toBe("webakoof-project-brief.txt");
});
