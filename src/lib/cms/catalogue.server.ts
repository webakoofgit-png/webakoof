import { cmsEnabled, rows, json } from "./db.server";
import type { PublicContent } from "./public";

export async function loadCatalogue(sector?: string) {
  if (!cmsEnabled()) throw new Error("Catalogue downloads require the MySQL CMS.");
  const categories = sector
    ? await rows<{ name: string }>(
        'SELECT name FROM portfolio_categories WHERE slug=? AND status="active"',
        [sector],
      )
    : [];
  if (sector && !categories.length) throw new Error("This sector is unavailable.");
  const [projects, settings] = await Promise.all([
    rows(
      `SELECT p.content,c.name category FROM portfolio_projects p
      JOIN portfolio_categories c ON c.id=p.category_id
      WHERE p.status='published' AND JSON_EXTRACT(p.content,'$.include_in_catalogue')=true
      ${sector ? "AND c.slug=? AND c.status='active'" : ""}
      ORDER BY (JSON_EXTRACT(p.content,'$.catalogue_order') IS NULL OR JSON_TYPE(JSON_EXTRACT(p.content,'$.catalogue_order'))='NULL') ASC,
      CAST(NULLIF(JSON_UNQUOTE(JSON_EXTRACT(p.content,'$.catalogue_order')),'null') AS UNSIGNED) ASC,p.created_at DESC,p.id DESC`,
      sector ? [sector] : [],
    ),
    rows("SELECT content FROM website_settings WHERE id=1"),
  ]);
  if (!projects.length) throw new Error("No projects are included in this catalogue yet.");
  if (!settings[0]) throw new Error("Configure Website Settings before downloading a catalogue.");
  return {
    sector: categories[0]?.name || "Complete WEBakoof",
    projects: projects.map((p) => ({
      ...json<PublicContent["projects"][number]>(p["content"]),
      category: String(p["category"]),
    })),
    settings: json<PublicContent["settings"]>(settings[0]["content"]),
  };
}
