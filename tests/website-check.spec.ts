import { test, expect } from "@playwright/test";
import {
  checkWebsite,
  isPublicAddress,
  websiteCheckUrl,
} from "../src/lib/cms/website-check.server";
import { isWebsiteLive, publicProject } from "../src/lib/cms/availability";

test("blocks internal/reserved IPv4, IPv6 and unusual URL encodings", () => {
  for (const address of [
    "0.0.0.0",
    "127.0.0.1",
    "10.2.3.4",
    "172.16.0.1",
    "192.168.1.1",
    "169.254.169.254",
    "100.64.0.1",
    "198.18.0.1",
    "224.0.0.1",
    "::1",
    "::ffff:127.0.0.1",
    "fc00::1",
    "fe80::1",
    "2002:7f00:1::",
    "2001:db8::1",
  ])
    expect(isPublicAddress(address), address).toBe(false);
  for (const url of [
    "http://2130706433",
    "http://0x7f000001",
    "http://127.1",
    "http://[::1]",
    "http://localhost.",
    "http://localhost",
    "http://internal",
    "ftp://example.com",
    "https://user:pass@example.com",
    "http://example.com:3306",
  ]) {
    expect(() => websiteCheckUrl(url), url).toThrow();
  }
  expect(isPublicAddress("8.8.8.8")).toBe(true);
  expect(isPublicAddress("2606:4700:4700::1111")).toBe(true);
});

test("rejects mixed public/private DNS and redirects to private networks", async () => {
  let calls = 0;
  const request = async () => {
    calls++;
    return { status: 302, location: "http://169.254.169.254/latest/meta-data" };
  };
  const result = await checkWebsite("https://example.com", {
    resolve: async () => [
      { address: "8.8.8.8", family: 4 },
      { address: "127.0.0.1", family: 4 },
    ],
    request,
  });
  expect(result.result).toContain("blocked");
  expect(calls).toBe(0);
  const redirect = await checkWebsite("https://example.com", {
    resolve: async () => [{ address: "8.8.8.8", family: 4 }],
    request,
  });
  expect(redirect.result).toContain("blocked");
  expect(calls).toBe(1);
});

test("bounds redirects and handles HEAD fallback, non-200, DNS and TLS failures", async () => {
  const resolve = async () => [{ address: "8.8.8.8", family: 4 }];
  let calls = 0;
  const loop = await checkWebsite("https://example.com", {
    resolve,
    request: async () => {
      calls++;
      return { status: 302, location: "/loop" };
    },
  });
  expect(calls).toBe(4);
  expect(loop.result).toContain("Redirect limit");
  const methods: string[] = [];
  const fallback = await checkWebsite("https://example.com", {
    resolve,
    request: async (_url, address, method) => {
      expect(address.address).toBe("8.8.8.8");
      methods.push(method);
      return { status: method === "HEAD" ? 405 : 503, location: undefined };
    },
  });
  expect(methods).toEqual(["HEAD", "GET"]);
  expect(fallback.status).toBe(503);
  for (const code of ["ENOTFOUND", "CERT_HAS_EXPIRED", "ECONNREFUSED"]) {
    const failure = await checkWebsite("https://example.com", {
      resolve: async () => {
        throw Object.assign(new Error("test"), { code });
      },
      request: async () => {
        throw new Error("Should not request");
      },
    });
    expect(failure.status).toBeNull();
    expect(failure.checkedAt).toBeTruthy();
    expect(failure.result).toContain(
      code === "ENOTFOUND"
        ? "does not establish domain expiry"
        : code === "CERT_HAS_EXPIRED"
          ? "TLS/SSL"
          : "ECONNREFUSED",
    );
  }
});

test("times out unresolved DNS without treating it as domain expiry", async () => {
  const result = await checkWebsite("https://example.com", {
    resolve: () => new Promise(() => {}),
    request: async () => {
      throw new Error("Should not request");
    },
  });
  expect(result.result).toContain("timed out");
  expect(result.status).toBeNull();
});

test("legacy Live default is independent of checks and private fields never serialize", () => {
  expect(isWebsiteLive({})).toBe(true);
  expect(isWebsiteLive({ websiteAvailability: "domain_expired" })).toBe(false);
  const safe = publicProject({
    slug: "unchanged",
    liveUrl: "https://example.com",
    adminNotes: "private-secret",
    lastCheckedAt: "private-date",
    lastCheckResult: "private-result",
    websiteStatusUpdatedAt: "private-updated",
  });
  expect(JSON.stringify(safe)).toBe('{"slug":"unchanged","liveUrl":"https://example.com"}');
});
