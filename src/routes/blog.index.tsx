import { createFileRoute } from "@tanstack/react-router";
import { BlogPage } from "@/components/blog/blog-page";
import { seo } from "@/lib/seo";
export const Route = createFileRoute("/blog/")({
  head: () =>
    seo(
      "Insights & Ideas",
      "Practical Webakoof articles on planning better websites, e-commerce experiences and useful digital measurement.",
      "/blog",
    ),
  component: BlogPage,
});
