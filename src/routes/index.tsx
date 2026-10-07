import { createFileRoute } from "@tanstack/react-router";
import { HomePage } from "@/components/home/home-page";
import { seo } from "@/lib/seo";
export const Route = createFileRoute("/")({
  head: ({ match }) =>
    seo(
      match.context.content?.settings.metaTitle || "Websites, Technology & Digital Growth",
      match.context.content?.settings.metaDescription ||
        "Webakoof by Praavi Consultants builds thoughtful websites, e-commerce stores and digital solutions around your business.",
      "/",
      undefined,
      match.context.content?.settings.ogImage,
    ),
  component: HomePage,
});
