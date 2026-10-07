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
      "Portfolio & Design Concepts",
      "Explore Webakoof design concepts across e-commerce, healthcare and corporate websites, with a closer look at the thinking behind each experience.",
      "/portfolio",
    ),
  component: PortfolioPage,
});
