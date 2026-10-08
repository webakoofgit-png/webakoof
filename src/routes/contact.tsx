import { createFileRoute } from "@tanstack/react-router";
import { ContactPage } from "@/components/contact/contact-page";
import { seo } from "@/lib/seo";
export const Route = createFileRoute("/contact")({
  head: () =>
    seo(
      "Contact Us for Website Development & SEO",
      "Tell Webakoof about your website, e-commerce or digital growth project. Share your goals and start a conversation.",
      "/contact",
    ),
  component: ContactPage,
});
