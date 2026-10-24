import { lookup } from "node:dns/promises";
import { BlockList, isIP } from "node:net";
import { request as httpRequest } from "node:http";
import { request as httpsRequest } from "node:https";

const blocked = new BlockList();
for (const [address, prefix] of [
  ["0.0.0.0", 8],
  ["10.0.0.0", 8],
  ["100.64.0.0", 10],
  ["127.0.0.0", 8],
  ["169.254.0.0", 16],
  ["172.16.0.0", 12],
  ["192.0.0.0", 24],
  ["192.0.2.0", 24],
  ["192.88.99.0", 24],
  ["192.168.0.0", 16],
  ["198.18.0.0", 15],
  ["198.51.100.0", 24],
  ["203.0.113.0", 24],
  ["224.0.0.0", 3],
] as const)
  blocked.addSubnet(address, prefix, "ipv4");
const globalV6 = new BlockList();
blocked.addAddress("168.63.129.16", "ipv4");
globalV6.addSubnet("2000::", 3, "ipv6");
blocked.addSubnet("2001::", 23, "ipv6");
blocked.addSubnet("2001:db8::", 32, "ipv6");
blocked.addSubnet("2002::", 16, "ipv6");
blocked.addSubnet("3fff::", 20, "ipv6");

export function isPublicAddress(address: string) {
  const family = isIP(address);
  return family === 4
    ? !blocked.check(address, "ipv4")
    : family === 6 && globalV6.check(address, "ipv6") && !blocked.check(address, "ipv6");
}
export function websiteCheckUrl(value: string) {
  const url = new URL(value);
  if (
    !["http:", "https:"].includes(url.protocol) ||
    url.username ||
    url.password ||
    (url.port && url.port !== "80" && url.port !== "443")
  )
    throw new Error("Only public HTTP/HTTPS websites on ports 80 or 443 can be checked.");
  const host = url.hostname.replace(/^\[|\]$/g, "").replace(/\.$/, "");
  if (
    host === "localhost" ||
    host.endsWith(".localhost") ||
    host.endsWith(".local") ||
    (!isIP(host) && !host.includes(".")) ||
    (isIP(host) && !isPublicAddress(host))
  )
    throw new Error("Private, internal and reserved destinations are blocked.");
  return url;
}

type Address = { address: string; family: number };
async function requestWebsite(url: URL, address: Address, method: string, signal: AbortSignal) {
  // Pin validated DNS to the socket; TLS verifies the original hostname.
  return new Promise<{ status: number; location: string | undefined }>((resolve, reject) => {
    const req = (url.protocol === "https:" ? httpsRequest : httpRequest)(
      url,
      {
        method,
        agent: false,
        signal: signal,
        lookup: (_hostname, _options, callback) => callback(null, address.address, address.family),
        family: address.family,
        headers: { "User-Agent": "Webakoof-Portfolio-Availability/1.0", Accept: "text/html" },
        maxHeaderSize: 16384,
      },
      (res) => {
        resolve({ status: res.statusCode || 0, location: res.headers.location });
        res.destroy(); // Never download, scrape or execute client content.
      },
    );
    req.once("error", reject);
    req.end();
  });
}

export async function checkWebsite(
  value: string,
  dependencies = {
    resolve: (host: string) => lookup(host, { all: true, verbatim: true }),
    request: requestWebsite,
  },
) {
  const checkedAt = new Date().toISOString();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);
  let status: number | null = null;
  let redirects = 0;
  try {
    let url = websiteCheckUrl(value);
    let method = "HEAD";
    while (true) {
      const host = url.hostname.replace(/^\[|\]$/g, "");
      const addresses = await Promise.race([
        dependencies.resolve(host),
        new Promise<never>((_, reject) => {
          if (controller.signal.aborted) reject(new Error("Check timed out."));
          else
            controller.signal.addEventListener(
              "abort",
              () => reject(new Error("Check timed out.")),
              { once: true },
            );
        }),
      ]);
      if (!addresses.length || addresses.some((a) => !isPublicAddress(a.address)))
        throw new Error("Private, internal and reserved destinations are blocked.");
      const address = addresses[0]!;
      const response = await dependencies.request(url, address, method, controller.signal);
      status = response.status;
      if ([301, 302, 303, 307, 308].includes(status) && response.location) {
        if (++redirects > 3) throw new Error("Redirect limit exceeded (3).");
        url = websiteCheckUrl(new URL(response.location, url).href);
        continue;
      }
      if (method === "HEAD" && [405, 501].includes(status)) {
        method = "GET";
        continue;
      }
      return {
        checkedAt,
        status,
        redirects,
        result: `HTTP ${status}. ${status >= 200 && status < 300 ? "Website responded successfully." : "Review this response before updating availability."} This check does not verify domain ownership or expiry.`,
      };
    }
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code || "";
    const result = controller.signal.aborted
      ? "Check timed out after 12 seconds."
      : ["ENOTFOUND", "EAI_AGAIN", "ENODATA"].includes(code)
        ? "DNS lookup failed; this does not establish domain expiry."
        : /CERT|SSL|TLS|VERIFY/.test(code)
          ? "TLS/SSL certificate validation failed."
          : code
            ? `Connection failed (${code}).`
            : (error as Error).message;
    return {
      checkedAt,
      status,
      redirects,
      result: status === null ? result : `HTTP ${status}. ${result}`,
    };
  } finally {
    clearTimeout(timer);
  }
}
