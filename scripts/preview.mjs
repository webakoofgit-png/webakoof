import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { resolve, sep, extname } from "node:path";
import { pathToFileURL } from "node:url";
const root = resolve(".output/public");
const worker = (await import(pathToFileURL(resolve(".output/server/index.mjs")).href)).default;
const args = process.argv.slice(2);
const option = (name, fallback) => {
  const i = args.indexOf(name);
  return i < 0 ? fallback : args[i + 1];
};
const host = option("--host", "127.0.0.1");
const port = Number(option("--port", "4173"));
const mime = {
  ".js": "text/javascript",
  ".css": "text/css",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".ico": "image/x-icon",
  ".txt": "text/plain",
  ".json": "application/json",
  ".woff2": "font/woff2",
};
async function asset(request) {
  const pathname = decodeURIComponent(new URL(request.url).pathname);
  const target = resolve(root, `.${pathname}`);
  if (target !== root && !target.startsWith(root + sep)) return null;
  try {
    if (!(await stat(target)).isFile()) return null;
    return new Response(await readFile(target), {
      headers: { "Content-Type": mime[extname(target)] || "application/octet-stream" },
    });
  } catch {
    return null;
  }
}
createServer(async (req, res) => {
  try {
    const url = `http://${req.headers.host || `${host}:${port}`}${req.url}`;
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const method = req.method || "GET";
    const request = new Request(url, {
      method,
      headers: req.headers,
      ...(method !== "GET" && method !== "HEAD" ? { body: Buffer.concat(chunks) } : {}),
    });
    const response =
      (await asset(request)) ||
      (await worker.fetch(
        request,
        {
          ASSETS: {
            fetch: async (r) => (await asset(r)) || new Response("Not found", { status: 404 }),
          },
        },
        { waitUntil: (promise) => promise.catch(console.error), passThroughOnException() {} },
      ));
    res.writeHead(response.status, Object.fromEntries(response.headers));
    res.end(method === "HEAD" ? undefined : Buffer.from(await response.arrayBuffer()));
  } catch (error) {
    console.error(error);
    res.writeHead(500, { "Content-Type": "text/plain" });
    res.end("Production preview could not serve this request.");
  }
}).listen(port, host, () => console.log(`Production preview: http://${host}:${port}`));
