import { cmsEnabled, rows, json } from "./db.server";
import { settingsDefaults } from "./defaults";
import type { PublicContent } from "./public";
import { cleanArticle } from "./rich-text.server";
export async function loadPublicContent(): Promise<PublicContent> {
  if (!cmsEnabled()) {
    const [{ projects }, { articles }] = await Promise.all([
      import("@/data/projects"),
      import("@/data/blog"),
    ]);
    return {
      projects,
      articles,
      portfolioCategories: [...new Set(projects.map((p) => p.industry))],
      portfolioSectors: [...new Set(projects.map((p) => p.industry))].map((name) => ({
        name,
        slug: name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, ""),
      })),
      blogCategories: [...new Set(articles.map((a) => a.category))],
      sections: {},
      settings: settingsDefaults,
      enabled: false,
    };
  }
  const [projects, articles, pc, bc, sections, settings] = await Promise.all([
    rows(
      'SELECT p.content,c.name category,c.slug categorySlug FROM portfolio_projects p JOIN portfolio_categories c ON c.id=p.category_id WHERE p.status="published" ORDER BY p.created_at DESC',
    ),
    rows(
      'SELECT p.content,c.name category FROM blog_posts p JOIN blog_categories c ON c.id=p.category_id WHERE p.status="published" AND p.publish_date<=UTC_DATE() ORDER BY p.publish_date DESC,p.id DESC',
    ),
    rows('SELECT name,slug FROM portfolio_categories WHERE status="active" ORDER BY name'),
    rows('SELECT name FROM blog_categories WHERE status="active" ORDER BY name'),
    rows("SELECT slug,content FROM homepage_sections"),
    rows("SELECT content FROM website_settings WHERE id=1"),
  ]);
  return {
    projects: projects.map((p) => ({
      ...json<PublicContent["projects"][number]>(p["content"]),
      category: String(p["category"]),
      categorySlug: String(p["categorySlug"]),
    })),
    articles: articles.map((a) => {
      const article = json<PublicContent["articles"][number]>(a["content"]);
      return {
        ...article,
        ...(article.html ? cleanArticle(article.html) : {}),
        category: String(a["category"]),
      };
    }),
    portfolioCategories: pc.map((c) => String(c["name"])),
    portfolioSectors: pc.map((c) => ({ name: String(c["name"]), slug: String(c["slug"]) })),
    blogCategories: bc.map((c) => String(c["name"])),
    sections: Object.fromEntries(sections.map((s) => [s["slug"], json(s["content"])])),
    settings: { ...settingsDefaults, ...json<object>(settings[0]?.["content"] || "{}") },
    enabled: true,
  };
}
