import { createFileRoute } from "@tanstack/react-router";
export const Route = createFileRoute("/uploads/$")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const path = params._splat || "";
        if (!/^(homepage|portfolio|blog|settings)\/[a-f0-9-]+\.(jpg|png|webp)$/.test(path))
          return new Response("Not found", { status: 404 });
        const { readFile } = await import("node:fs/promises");
        const { resolve } = await import("node:path");
        try {
          const bytes = await readFile(resolve(process.env["UPLOAD_DIR"] || "uploads", path));
          return new Response(bytes, {
            headers: {
              "Content-Type": path.endsWith(".jpg")
                ? "image/jpeg"
                : path.endsWith(".png")
                  ? "image/png"
                  : "image/webp",
              "X-Content-Type-Options": "nosniff",
              "Cache-Control": "public, max-age=31536000, immutable",
            },
          });
        } catch {
          return new Response("Not found", { status: 404 });
        }
      },
    },
  },
});
