import { createFileRoute } from "@tanstack/react-router";
import { robotsResponse } from "@/lib/sitemap.server";
export const Route = createFileRoute("/robots.txt")({
  server: { handlers: { GET: () => robotsResponse() } },
});
