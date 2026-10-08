import { createFileRoute } from "@tanstack/react-router";
import { PortfolioPage } from "@/components/portfolio/portfolio-page";
import { seo } from "@/lib/seo";
export const Route = createFileRoute("/portfolio/")({
  validateSearch: (search: Record<string, unknown>): { sector?: string | undefined } => ({
    sector:
      typeof search["sector"] === "string" && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(search["sector"])
        ? search["sector"]
        : undefined,
  }),
  head: () =>
    seo(
      "Website Development Portfolio & Projects",
      "Explore Webakoof website projects across healthcare, education, jewellery, e-commerce and business services. View designs, demos and project details.",
      "/portfolio",
    ),
  component: PortfolioPage,
});
