import { createFileRoute, notFound, redirect } from "@tanstack/react-router";
import { BlogDetailPage } from "@/components/blog/blog-page";
import { getPublicContent } from "@/lib/cms/public";
import { seo, absoluteUrl } from "@/lib/seo";
export const Route = createFileRoute("/blog/$slug")({
  loader: async ({ params }) => {
    const { articles } = await getPublicContent();
    const article = articles.find((a) => a.slug === params.slug);
    if (!article) {
      const { getBlogRedirect } = await import("@/lib/cms/blog-redirect");
      const target = await getBlogRedirect({ data: params.slug });
      if (target) throw redirect({ to: "/blog/$slug", params: { slug: target }, statusCode: 301 });
      throw notFound();
    }
    return article;
  },
  head: ({ loaderData: a }) =>
    a
      ? seo(
          a.metaTitle || a.title,
          a.metaDescription || a.excerpt,
          `/blog/${a.slug}`,
          {
            "@type": "BlogPosting",
            headline: a.title,
            keywords: [a.focusKeyword, a.secondaryKeywords].filter(Boolean).join(", "),
            ...(a.publishedAt ? { datePublished: a.publishedAt } : {}),
            ...(a.updatedAt ? { dateModified: a.updatedAt } : {}),
            image: absoluteUrl(a.ogImage || a.image || "/social-card.png"),
            author: { "@type": "Organization", name: "Webakoof Editorial" },
            publisher: { "@type": "Organization", name: "Webakoof" },
            mainEntityOfPage: absoluteUrl(`/blog/${a.slug}`),
          },
          a.ogImage || a.image,
        )
      : {},
  component: Page,
});
function Page() {
  return <BlogDetailPage article={Route.useLoaderData()} />;
}
