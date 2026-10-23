import { createFileRoute } from "@tanstack/react-router";
export const Route = createFileRoute("/uploads/$")({
  server: {
    handlers: {
      GET: async ({ params, request }) => {
        const path = params._splat || "";
        if (!/^(homepage|portfolio|blog|settings)\/[a-f0-9-]+\.(jpg|png|webp|mp4)$/.test(path))
          return new Response("Not found", { status: 404 });
        const { readFile } = await import("node:fs/promises");
        const { resolve } = await import("node:path");
        try {
          const { rows } = await import("@/lib/cms/db.server");
          const records = await rows<{ bytes: Buffer }>(
            "SELECT f.bytes FROM media_blobs f JOIN media m ON m.id=f.media_id WHERE m.path=?",
            [path],
          );
          const bytes =
            records[0]?.bytes ||
            (await readFile(resolve(process.env["UPLOAD_DIR"] || "uploads", path)));
          const headers = new Headers({
            "Content-Type": path.endsWith(".mp4")
              ? "video/mp4"
              : path.endsWith(".jpg")
                ? "image/jpeg"
                : path.endsWith(".png")
                  ? "image/png"
                  : "image/webp",
            "X-Content-Type-Options": "nosniff",
            "Cache-Control": "public, max-age=31536000, immutable",
          });
          headers.set("Accept-Ranges", "bytes");
          const range = request.headers.get("range");
          if (range) {
            const match = /^bytes=(\d*)-(\d*)$/.exec(range);
            const start = match?.[1]
              ? Number(match[1])
              : Math.max(0, bytes.length - Number(match?.[2] || 0));
            const end =
              match?.[1] && match[2]
                ? Math.min(Number(match[2]), bytes.length - 1)
                : bytes.length - 1;
            if (
              !match ||
              (!match[1] && !match[2]) ||
              !Number.isSafeInteger(start) ||
              !Number.isSafeInteger(end) ||
              start > end ||
              start >= bytes.length
            ) {
              headers.set("Content-Range", `bytes */${bytes.length}`);
              return new Response(null, { status: 416, headers });
            }
            headers.set("Content-Range", `bytes ${start}-${end}/${bytes.length}`);
            headers.set("Content-Length", String(end - start + 1));
            return new Response(new Uint8Array(bytes.subarray(start, end + 1)), {
              status: 206,
              headers,
            });
          }
          headers.set("Content-Length", String(bytes.length));
          return new Response(new Uint8Array(bytes), { headers });
        } catch {
          return new Response("Not found", { status: 404 });
        }
      },
    },
  },
});
