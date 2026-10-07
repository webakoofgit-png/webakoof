import { test, expect } from "@playwright/test";
import { deliverEnquiry } from "../src/lib/enquiry-delivery.server";
test("delivery only succeeds on provider acceptance", async () => {
  let called = 0;
  const send: typeof fetch = async (_url, init) => {
    called++;
    expect(init?.method).toBe("POST");
    expect(init?.headers).toMatchObject({ Authorization: "Bearer test-only" });
    expect(JSON.parse(String(init?.body))).toMatchObject({
      name: "Local test",
      source: "Webakoof website",
    });
    return new Response("", { status: 202 });
  };
  expect(
    (
      await deliverEnquiry(
        { name: "Local test" },
        { endpoint: "https://example.invalid/enquiries", token: "test-only" },
        send,
      )
    ).ok,
  ).toBe(true);
  expect(called).toBe(1);
});
test("unconfigured or insecure delivery never sends a request", async () => {
  let called = 0;
  const send: typeof fetch = async () => {
    called++;
    return new Response();
  };
  expect((await deliverEnquiry({}, {}, send)).ok).toBe(false);
  expect((await deliverEnquiry({}, { endpoint: "http://example.invalid" }, send)).ok).toBe(false);
  expect(called).toBe(0);
});
test("provider errors and network failures preserve failure status", async () => {
  const reject: typeof fetch = async () => new Response("", { status: 503 });
  const offline: typeof fetch = async () => {
    throw new Error("Network unavailable");
  };
  expect((await deliverEnquiry({}, { endpoint: "https://example.invalid" }, reject)).ok).toBe(
    false,
  );
  expect((await deliverEnquiry({}, { endpoint: "https://example.invalid" }, offline)).ok).toBe(
    false,
  );
});
