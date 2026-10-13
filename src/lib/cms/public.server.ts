import { cmsEnabled, rows, json } from "./db.server";
import { settingsDefaults } from "./defaults";
import type { PublicContent } from "./public";
import { cleanArticle } from "./rich-text.server";
export async function loadPublicContent(): Promise<PublicContent> {
  if (!cmsEnabled()) {
    const { projects } = await import("@/data/projects");
    const articles: PublicContent["articles"] = [];
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
      'SELECT p.content,p.category_id,c.name category,c.slug categorySlug FROM portfolio_projects p JOIN portfolio_categories c ON c.id=p.category_id WHERE p.status="published" AND p.slug<>"aurora-botanics" ORDER BY p.created_at DESC',
    ),
    rows(
      'SELECT p.content,p.published_at,p.updated_at,c.name category FROM blog_posts p JOIN blog_categories c ON c.id=p.category_id WHERE p.status="published" AND p.publish_date<=UTC_DATE() ORDER BY p.publish_date DESC,p.id DESC',
    ),
    rows("SELECT id,name,slug,status FROM portfolio_categories ORDER BY name"),
    rows(
      'SELECT c.name FROM blog_categories c WHERE c.status="active" AND EXISTS (SELECT 1 FROM blog_posts p WHERE p.category_id=c.id AND p.status="published" AND p.publish_date<=UTC_DATE()) ORDER BY c.name',
    ),
    rows("SELECT slug,content FROM homepage_sections"),
    rows("SELECT content FROM website_settings WHERE id=1"),
  ]);
  return {
    projects: projects.map((p) => {
      const project = json<PublicContent["projects"][number]>(p["content"]);
      const ids = new Set([Number(p["category_id"]), ...(project.category_ids || [])]);
      const categories = pc.filter((c) => ids.has(Number(c["id"])));
      return {
        ...project,
        category: String(p["category"]),
        categorySlug: String(p["categorySlug"]),
        categorySlugs: categories.map((c) => String(c["slug"])),
        categoryNames: categories.map((c) => String(c["name"])),
      };
    }),
    articles: articles.map((a) => {
      const article = json<PublicContent["articles"][number]>(a["content"]);
      return {
        ...article,
        ...(article.html ? cleanArticle(article.html) : {}),
        category: String(a["category"]),
        ...(a["published_at"]
          ? { publishedAt: String(a["published_at"]).replace(" ", "T") + "Z" }
          : {}),
        updatedAt: String(a["updated_at"]).replace(" ", "T") + "Z",
      };
    }),
    portfolioCategories: pc.filter((c) => c["status"] === "active").map((c) => String(c["name"])),
    portfolioSectors: pc
      .filter((c) => c["status"] === "active")
      .map((c) => ({ name: String(c["name"]), slug: String(c["slug"]) })),
    blogCategories: bc.map((c) => String(c["name"])),
    sections: Object.fromEntries(sections.map((s) => [s["slug"], json(s["content"])])),
    settings: { ...settingsDefaults, ...json<object>(settings[0]?.["content"] || "{}") },
    enabled: true,
  };
}
