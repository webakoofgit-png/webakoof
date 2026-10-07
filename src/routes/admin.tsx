import { createFileRoute, redirect } from "@tanstack/react-router";
import { AdminLayout } from "@/components/admin/layout";
import { getAdminSession } from "@/lib/cms/auth";
export const Route = createFileRoute("/admin")({
  beforeLoad: async ({ location }) => {
    if (location.pathname !== "/admin/login" && !(await getAdminSession()))
      throw redirect({ to: "/admin/login" });
  },
  head: () => ({
    meta: [{ title: "WEBakoof Admin" }, { name: "robots", content: "noindex, nofollow" }],
  }),
  component: AdminLayout,
});
