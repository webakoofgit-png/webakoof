const origin = (import.meta.env["VITE_SITE_URL"] || "https://webakoof.com").replace(/\/$/, "");
export const absoluteUrl = (path: string) => new URL(path, origin).href;
export const siteOrigin = origin;
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
      { name: "robots", content: "index, follow, max-image-preview:large" },
      { property: "og:title", content: `${title} | Webakoof` },
      { property: "og:description", content: description },
      { property: "og:url", content: absoluteUrl(path) },
      { property: "og:site_name", content: "Webakoof" },
      { property: "og:locale", content: "en_IN" },
      { property: "og:image", content: absoluteUrl(ogImage || "/social-card.png") },
      { property: "og:image:secure_url", content: absoluteUrl(ogImage || "/social-card.png") },
      ...(!ogImage
        ? [
            { property: "og:image:type", content: "image/png" },
            { property: "og:image:width", content: "1200" },
            { property: "og:image:height", content: "630" },
          ]
        : []),
      { property: "og:image:alt", content: "Webakoof — websites, technology and digital growth" },
      { property: "og:type", content: path.startsWith("/blog/") ? "article" : "website" },
      { name: "twitter:title", content: `${title} | Webakoof` },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:url", content: absoluteUrl(path) },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: absoluteUrl(ogImage || "/social-card.png") },
      { name: "twitter:image:alt", content: "Webakoof — websites, technology and digital growth" },
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
              logo: absoluteUrl("/webakoof-logo.png"),
              parentOrganization: { "@type": "Organization", name: "Praavi Consultants" },
            },
            {
              "@type": "WebSite",
              "@id": `${origin}/#website`,
              name: "Webakoof",
              url: origin,
            },
            {
              "@type": "WebPage",
              url: absoluteUrl(path),
              name: title,
              description,
              inLanguage: "en",
              isPartOf: { "@id": `${origin}/#website` },
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
