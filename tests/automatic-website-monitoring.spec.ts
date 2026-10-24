import { test, expect } from "@playwright/test";
import { readFileSync, existsSync } from "node:fs";
import { nextMonitorState } from "../src/lib/cms/website-monitor-state";
import { isWebsiteLive } from "../src/lib/cms/availability";
import {
  ensureMonitoringSchema,
  monitorProject,
  monitoringSchema,
} from "../src/lib/cms/website-monitor.server";
import { database, rows, json } from "../src/lib/cms/db.server";
import type { CheckOutcome } from "../src/lib/cms/website-monitor-state";

test("three spaced failures, two recoveries, inconclusive results and manual overrides", () => {
  let state = { state: "unknown" as const, failures: 0, successes: 0 } as Parameters<
    typeof nextMonitorState
  >[0];
  state = nextMonitorState(state, "unavailable");
  expect(state.state).toBe("unknown");
  state = nextMonitorState(state, "unavailable");
  expect(state.state).toBe("unknown");
  state = nextMonitorState(state, "inconclusive");
  expect(state.failures).toBe(0);
  for (let n = 0; n < 3; n++) state = nextMonitorState(state, "unavailable");
  expect(state.state).toBe("unavailable");
  expect(isWebsiteLive({ websiteMonitorState: state.state })).toBe(false);
  state = nextMonitorState(state, "available");
  expect(state.state).toBe("unavailable");
  state = nextMonitorState(state, "available");
  expect(state.state).toBe("healthy");
  expect(isWebsiteLive({ websiteMonitorState: state.state })).toBe(true);
  expect(
    isWebsiteLive({ websiteAvailability: "domain_expired", websiteMonitorState: "healthy" }),
  ).toBe(false);
  expect(
    isWebsiteLive({ websiteMonitoringEnabled: false, websiteMonitorState: "unavailable" }),
  ).toBe(true);
});

test("runtime table bootstrap matches the additive SQL migration", () => {
  const sql = readFileSync("database/migrations/20261024-automatic-website-monitoring.sql", "utf8");
  const normalize = (value: string) =>
    value
      .replace(/^--.*$/gm, "")
      .replace(/;/g, "")
      .replace(/\s+/g, " ")
      .trim();
  expect(normalize(sql)).toBe(normalize(monitoringSchema));
});

test("local automatic failure/recovery, due times, leases, stale forms, URL races, privacy and offline PDF", async ({
  page,
  request,
  baseURL,
}) => {
  test.setTimeout(180000);
  test.skip(
    !["127.0.0.1", "localhost"].includes(new URL(baseURL!).hostname) ||
      !existsSync(".local/admin-login.json"),
    "Local fixtures only",
  );
  process.loadEnvFile(".env");
  test.skip(
    !["127.0.0.1", "localhost"].includes(process.env.DB_HOST || "127.0.0.1"),
    "Local database only",
  );
  await ensureMonitoringSchema();
  const credentials = JSON.parse(readFileSync(".local/admin-login.json", "utf8"));
  const headers = { Origin: baseURL! };
  expect(
    (
      await request.post("/api/cms/login", { headers, data: { ...credentials, remember: false } })
    ).ok(),
  ).toBeTruthy();
  await page.context().addCookies((await request.storageState()).cookies);
  const before = await (await request.get("/api/cms/portfolio")).json();
  const categories = await (await request.get("/api/cms/portfolio-categories")).json();
  const slug = "qa-auto-monitor-" + Date.now();
  let id: number | undefined;
  const check = (outcome: CheckOutcome) => async () => ({
    outcome,
    checkedAt: new Date().toISOString(),
    status: outcome === "available" ? 200 : 503,
    redirects: 0,
    result: "PRIVATE-AUTOMATIC-CHECK-RESULT",
  });
  const due = async () =>
    database().execute(
      "UPDATE portfolio_website_checks SET next_check_at=DATE_SUB(UTC_TIMESTAMP(3),INTERVAL 1 MINUTE) WHERE project_id=?",
      [id],
    );
  const record = async () => (await (await request.get(`/api/cms/portfolio/${id}`)).json())[0];
  const state = async () =>
    (
      await rows<{ state: string; failures: number; successes: number }>(
        "SELECT state,failures,successes FROM portfolio_website_checks WHERE project_id=?",
        [id!],
      )
    )[0];
  try {
    const response = await request.post("/api/cms/portfolio", {
      headers,
      data: {
        name: slug,
        slug,
        category_id: categories[0].id,
        status: "published",
        featured: false,
        image: "/projects/Rockals.png",
        description: "Automatic monitoring fixture",
        liveUrl: "https://example.com/auto-monitor-fixture",
        include_in_catalogue: true,
        adminNotes: "PRIVATE-MONITOR-NOTE",
        features: ["Preserved feature"],
      },
    });
    expect(response.ok(), await response.text()).toBe(true);
    id = (await (await request.get("/api/cms/portfolio")).json()).find(
      (p: { slug: string }) => p.slug === slug,
    ).id;
    const original = (
      await rows("SELECT content,updated_at FROM portfolio_projects WHERE id=?", [id!])
    )[0];
    const saved = await record();
    expect(await monitorProject(id, check("unavailable"))).toBe(true);
    expect((await state()).failures).toBe(1);
    let called = false;
    expect(
      await monitorProject(id, async () => {
        called = true;
        return check("unavailable")();
      }),
    ).toBe(false);
    expect(called).toBe(false);
    await due();
    await monitorProject(id, check("unavailable"));
    expect((await state()).state).toBe("unknown");
    await due();
    await monitorProject(id, check("unavailable"));
    expect((await state()).state).toBe("unavailable");
    expect((await record()).websiteAvailability).toBe("live");
    const unchanged = (
      await rows("SELECT content,updated_at FROM portfolio_projects WHERE id=?", [id!])
    )[0];
    expect(unchanged).toEqual(original);
    await ensureMonitoringSchema();
    expect((await state()).state).toBe("unavailable");
    const publicResponse = await page.goto(`/portfolio/${slug}`);
    expect(publicResponse!.status()).toBe(200);
    const html = await publicResponse!.text();
    expect(html).not.toContain("PRIVATE-AUTOMATIC-CHECK-RESULT");
    expect(html).not.toContain("PRIVATE-MONITOR-NOTE");
    await expect(page.locator(".case-availability-notice")).toBeVisible();
    await expect(page.locator(".case-actions a")).toHaveCount(0);
    expect(await (await request.get("/sitemap.xml")).text()).toContain(`/portfolio/${slug}`);
    // A stale admin save must not erase automatic failure/recovery state.
    expect(
      (await request.put(`/api/cms/portfolio/${id}`, { headers, data: saved })).ok(),
    ).toBeTruthy();
    expect((await state()).state).toBe("unavailable");
    await page.goto("/portfolio");
    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.getByRole("button", { name: "Download Complete Portfolio" }).click(),
    ]);
    const pdf = readFileSync((await download.path())!).toString("latin1");
    expect(pdf).toContain(`/portfolio/${slug}`);
    expect(pdf).not.toContain("/URI (https://example.com/auto-monitor-fixture)");
    await due();
    await monitorProject(id, check("available"));
    expect((await state()).state).toBe("unavailable");
    await due();
    await monitorProject(id, check("available"));
    expect((await state()).state).toBe("healthy");
    await page.goto(`/portfolio/${slug}`);
    await expect(page.locator(".case-actions a")).toHaveCount(1);
    await expect(page.locator(".case-availability-notice")).toHaveCount(0);
    // Prevent overlapping processes from counting the same observation twice.
    await due();
    let release: (value: Awaited<ReturnType<ReturnType<typeof check>>>) => void;
    let started: () => void;
    const starting = new Promise<void>((resolve) => {
      started = resolve;
    });
    const pending = monitorProject(
      id,
      () =>
        new Promise((resolve) => {
          release = resolve;
          started();
        }),
    );
    await starting;
    expect(await monitorProject(id, check("unavailable"))).toBe(false);
    // An admin changing the URL while an old check is running invalidates its lease/result.
    const latest = await record();
    expect(
      (
        await request.put(`/api/cms/portfolio/${id}`, {
          headers,
          data: { ...latest, liveUrl: "https://example.com/new-url" },
        })
      ).ok(),
    ).toBeTruthy();
    release!(await check("unavailable")());
    await pending;
    expect(await state()).toBeUndefined();
    await monitorProject(id, check("unavailable"));
    expect((await state()).failures).toBe(1);
    // Disabling monitoring clears old state but retains the URL and project content.
    expect(
      (
        await request.put(`/api/cms/portfolio/${id}`, {
          headers,
          data: { ...(await record()), websiteMonitoringEnabled: false },
        })
      ).ok(),
    ).toBeTruthy();
    expect(await state()).toBeUndefined();
    expect(await monitorProject(id, check("unavailable"))).toBe(false);
    await page.goto(`/admin/portfolio/${id}`);
    await page.getByRole("tab", { name: "Project Details", exact: true }).click();
    await expect(
      page.getByRole("checkbox", { name: "Enable automatic unavailable notice and recovery" }),
    ).not.toBeChecked();
    expect(
      (
        await request.put(`/api/cms/portfolio/${id}`, {
          headers,
          data: {
            ...(await record()),
            websiteMonitoringEnabled: true,
            websiteAvailability: "domain_expired",
          },
        })
      ).ok(),
    ).toBeTruthy();
    expect(await monitorProject(id, check("available"))).toBe(false);
    await page.goto(`/portfolio/${slug}`);
    await expect(page.locator(".case-actions a")).toHaveCount(0);
    expect(json<{ description: string }>(original!["content"]).description).toBe(
      "Automatic monitoring fixture",
    );
  } finally {
    if (id) await request.delete(`/api/cms/portfolio/${id}`, { headers });
    expect(await (await request.get("/api/cms/portfolio")).json()).toEqual(before);
    await database().end();
  }
});
