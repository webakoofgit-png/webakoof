import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";
import { startWebsiteMonitor } from "./lib/cms/website-monitor.server";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

const legacyPageRedirects = new Map([
  ["/portfolio.html", "/portfolio"],
  ["/services.html", "/services"],
  ["/contact.html", "/contact"],
  ["/fast-start.html", "/contact"],
  ["/seo-best-practices-for-2025", "/blog/seo-friendly-website-2026"],
  ["/seo-best-practices-for-2025/", "/blog/seo-friendly-website-2026"],
  ["/work", "/portfolio"],
  ["/work/", "/portfolio"],
  ["/category/blog", "/blog"],
  ["/category/blog/", "/blog"],
  ["/author/webakoofbypraavigmail-com", "/blog"],
  ["/author/webakoofbypraavigmail-com/", "/blog"],
  ["/blog/", "/blog"],
  ["/how-to-choose-the-right-domain-name", "/blog/how-to-choose-the-right-domain-name"],
  ["/how-to-choose-the-right-domain-name/", "/blog/how-to-choose-the-right-domain-name"],
]);

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    if (request.method === "GET" || request.method === "HEAD") {
      const url = new URL(request.url);
      const destination = legacyPageRedirects.get(url.pathname);
      if (destination) {
        return new Response(null, {
          status: 301,
          headers: { Location: destination + url.search },
        });
      }
    }

    startWebsiteMonitor();
    try {
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      if (response.headers.get("content-type")?.includes("text/html"))
        response.headers.set("Cache-Control", "no-store");
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};
