import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/shared/legal-page";
import { seo } from "@/lib/seo";
export const Route = createFileRoute("/terms-and-conditions")({
  head: () =>
    seo(
      "Terms & Conditions",
      "Website information, project scope and terms for Webakoof. Draft pending business approval.",
      "/terms-and-conditions",
    ),
  component: () => <LegalPage type="terms" />,
});
