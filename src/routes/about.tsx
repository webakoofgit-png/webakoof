import { createFileRoute } from "@tanstack/react-router";
import { AboutPage } from "@/components/about/about-page";
import { seo } from "@/lib/seo";
export const Route = createFileRoute("/about")({
  head: () =>
    seo(
      "About Our Website Design & Development Team",
      "Meet Webakoof, the web and digital technology division of Praavi Consultants. Creativity, technology and business thinking together.",
      "/about",
    ),
  component: AboutPage,
});
