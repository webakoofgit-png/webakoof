import { createFileRoute } from "@tanstack/react-router";
import { api } from "@/lib/cms/api.server";
export const Route = createFileRoute("/api/cms/$")({
  server: {
    handlers: {
      GET: ({ request }) => api(request),
      POST: ({ request }) => api(request),
      PUT: ({ request }) => api(request),
      DELETE: ({ request }) => api(request),
    },
  },
});
