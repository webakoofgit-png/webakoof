import { loadPublicContent } from "./cms/public.server";
import { services } from "@/data/services";
import { absoluteUrl, siteOrigin } from "./seo";

export async function sitemapResponse() {
  const content = await loadPublicContent();
  const paths = [
    "/",
    "/about",
    "/services",
    "/portfolio",
    "/blog",
    "/contact",
    "/privacy-policy",
    "/terms-and-conditions",
    ...services.map((service) => `/services/${service.slug}`),
    ...content.projects.map((project) => `/portfolio/${encodeURIComponent(project.slug)}`),
    ...content.articles.map((article) => `/blog/${encodeURIComponent(article.slug)}`),
  ];
  const escapeXml = (value: string) =>
    value
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&apos;");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[...new Set(paths)].map((path) => `  <url><loc>${escapeXml(absoluteUrl(path))}</loc></url>`).join("\n")}\n</urlset>`;
  return new Response(xml, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
}
export function robotsResponse() {
  return new Response(
    `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/\n\nSitemap: ${siteOrigin}/sitemap.xml\n`,
    { headers: { "Content-Type": "text/plain; charset=utf-8" } },
  );
}
