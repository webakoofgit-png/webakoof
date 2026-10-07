import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  timeout: 60000,
  expect: { timeout: 10000 },
  workers: 2,
  reporter: "list",
  use: {
    baseURL: process.env["QA_BASE_URL"] || "http://127.0.0.1:8080",
    channel: "chrome",
    headless: true,
    trace: "retain-on-failure",
  },
  outputDir: "qa-artifacts/test-results",
});
