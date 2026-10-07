import { test, expect } from "@playwright/test";
import { existsSync, readFileSync, readdirSync } from "node:fs";

const credentials = existsSync(".local/admin-login.json")
  ? JSON.parse(readFileSync(".local/admin-login.json", "utf8"))
  : null;
const headers = { Origin: process.env["QA_BASE_URL"] || "http://127.0.0.1:8080" };

test("uploaded MP4 recordings decode and the existing public case study plays", async ({
  page,
}) => {
  test.setTimeout(120000);
  await page.goto("/portfolio/rockals");
  const video = page.locator(".case-video-showcase video");
  await expect(video).toHaveAttribute("controls", "");
  await video.scrollIntoViewIfNeeded();
  await video.evaluate((element: HTMLVideoElement) => element.play());
  await expect
    .poll(() => video.evaluate((element: HTMLVideoElement) => element.readyState))
    .toBeGreaterThan(1);
  await expect
    .poll(() => video.evaluate((element: HTMLVideoElement) => element.currentTime))
    .toBeGreaterThan(0);
  const urls = readdirSync("public/projects")
    .filter((file) => file.endsWith(".mp4"))
    .map((file) => `/projects/${encodeURIComponent(file)}`);
  const results = await page.evaluate(async (files) => {
    const results: { url: string; duration: number; error: string }[] = [];
    for (const url of files) {
      results.push(
        await new Promise<{ url: string; duration: number; error: string }>((resolve) => {
          const video = document.createElement("video");
          video.preload = "metadata";
          const finish = (error: string) => {
            clearTimeout(timeout);
            const duration = video.duration;
            video.removeAttribute("src");
            video.load();
            resolve({ url, duration, error });
          };
          const timeout = setTimeout(() => finish("Metadata loading timed out"), 10000);
          video.onloadedmetadata = () => finish("");
          video.onerror = () => finish(video.error?.message || "Unsupported recording");
          video.src = url;
        }),
      );
    }
    return results;
  }, urls);
  expect(
    results.filter((result) => result.error),
    JSON.stringify(results),
  ).toEqual([]);
  expect(results.every((result) => result.duration > 0)).toBe(true);
});

test("imported media remains editable and draft video previews load", async ({ page, request }) => {
  test.skip(!credentials, "Requires local CMS test credentials.");
  const response = await request.post("/api/cms/login", {
    headers,
    data: { ...credentials, remember: false },
  });
  expect(response.ok()).toBeTruthy();
  await page.context().addCookies((await request.storageState()).cookies);
  const projects = await (await request.get("/api/cms/portfolio")).json();
  const project = projects.find((item: { slug: string }) => item.slug === "suntech-solar");
  expect(project).toBeTruthy();
  expect(project.showcaseVideo).toBe("/projects/suntech%20.mp4");
  await page.goto(`/admin/portfolio/${project.id}`);
  await page.getByRole("tab", { name: "Media", exact: true }).click();
  await expect(page.getByLabel("Showcase Video URL", { exact: true })).toHaveValue(
    project.showcaseVideo,
  );
  await page.goto(`/admin/preview/portfolio/${project.id}`);
  const video = page.locator(".case-video-showcase video");
  await expect(video).toBeVisible();
  await expect
    .poll(() => video.evaluate((element: HTMLVideoElement) => element.readyState))
    .toBeGreaterThan(1);
  await page.screenshot({ path: "qa-artifacts/portfolio-video-admin-preview.png", fullPage: true });
});
