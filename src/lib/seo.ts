const origin = (
  import.meta.env["VITE_SITE_URL"] || "https://webakoof-growth-hub.lovable.app"
).replace(/\/$/, "");
export const absoluteUrl = (path: string) => new URL(path, origin).href;
export function seo(
  title: string,
  description: string,
  path: string,
  schema?: Record<string, unknown> | Record<string, unknown>[],
  ogImage?: string,
) {
  return {
    meta: [
      { title: `${title} | Webakoof` },
      { name: "description", content: description },
      { property: "og:title", content: `${title} | Webakoof` },
      { property: "og:description", content: description },
      { property: "og:url", content: absoluteUrl(path) },
      { property: "og:image", content: absoluteUrl(ogImage || "/social-card.png") },
      { property: "og:image:alt", content: "Webakoof — websites, technology and digital growth" },
      { property: "og:type", content: path.startsWith("/blog/") ? "article" : "website" },
      { name: "twitter:title", content: `${title} | Webakoof` },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: absoluteUrl(ogImage || "/social-card.png") },
    ],
    links: [{ rel: "canonical", href: absoluteUrl(path) }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Organization",
              name: "Webakoof",
              url: origin,
              parentOrganization: { "@type": "Organization", name: "Praavi Consultants" },
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Home", item: origin },
                ...(path === "/"
                  ? []
                  : [{ "@type": "ListItem", position: 2, name: title, item: absoluteUrl(path) }]),
              ],
            },
            ...(schema ? (Array.isArray(schema) ? schema : [schema]) : []),
          ],
        }).replace(/</g, "\\u003c"),
      },
    ],
  };
}
