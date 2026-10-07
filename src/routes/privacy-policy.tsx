import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/shared/legal-page";
import { seo } from "@/lib/seo";
export const Route = createFileRoute("/privacy-policy")({
  head: () =>
    seo(
      "Privacy Policy",
      "Information about Webakoof project enquiries, website services and privacy. Draft pending business approval.",
      "/privacy-policy",
    ),
  component: () => <LegalPage type="privacy" />,
});
