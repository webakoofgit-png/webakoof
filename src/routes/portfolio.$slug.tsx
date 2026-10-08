import { createFileRoute, notFound } from "@tanstack/react-router";
import { ProjectDetailPage } from "@/components/portfolio/portfolio-page";
import { getPublicContent } from "@/lib/cms/public";
import { seo } from "@/lib/seo";
export const Route = createFileRoute("/portfolio/$slug")({
  loader: async ({ params }) => {
    const { projects } = await getPublicContent();
    const project = projects.find((p) => p.slug === params.slug);
    if (!project) throw notFound();
    return project;
  },
  head: ({ loaderData: p }) =>
    p
      ? seo(
          p.metaTitle || `${p.name} — Website Design Portfolio`,
          p.metaDescription || p.description,
          `/portfolio/${p.slug}`,
          undefined,
          p.ogImage,
        )
      : {},
  component: Page,
});
function Page() {
  return <ProjectDetailPage project={Route.useLoaderData()} />;
}
