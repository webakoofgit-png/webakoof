import { createFileRoute, notFound } from "@tanstack/react-router";
import { BlogDetailPage } from "@/components/blog/blog-page";
import { getPublicContent } from "@/lib/cms/public";
import { seo, absoluteUrl } from "@/lib/seo";
export const Route = createFileRoute("/blog/$slug")({
  loader: async ({ params }) => {
    const { articles } = await getPublicContent();
    const article = articles.find((a) => a.slug === params.slug);
    if (!article) throw notFound();
    return article;
  },
  head: ({ loaderData: a }) =>
    a
      ? seo(
          a.metaTitle || a.title,
          a.metaDescription || a.excerpt,
          `/blog/${a.slug}`,
          {
            "@type": "Article",
            headline: a.title,
            datePublished: a.date,
            author: { "@type": "Organization", name: "Webakoof Editorial" },
            publisher: { "@type": "Organization", name: "Webakoof" },
            mainEntityOfPage: absoluteUrl(`/blog/${a.slug}`),
          },
          a.ogImage,
        )
      : {},
  component: Page,
});
function Page() {
  return <BlogDetailPage article={Route.useLoaderData()} />;
}
