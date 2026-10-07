import { createFileRoute } from "@tanstack/react-router";
import { ServicesPage } from "@/components/services/services-page";
import { seo } from "@/lib/seo";
export const Route = createFileRoute("/services/")({
  head: () =>
    seo(
      "Website & Digital Services",
      "Explore website development, e-commerce, custom applications, SEO, website redesign and maintenance with Webakoof.",
      "/services",
    ),
  component: ServicesPage,
});
