import { cmsEnabled, rows, json } from "./db.server";
import type { PublicContent } from "./public";
import { publicProject } from "./availability";
import { loadWebsiteMonitoring, publicMonitorState } from "./website-monitor.server";

export async function loadCatalogue(sector?: string) {
  if (!cmsEnabled()) throw new Error("Catalogue downloads require the MySQL CMS.");
  const categories = sector
    ? await rows<{ id: number; name: string }>(
        'SELECT id,name FROM portfolio_categories WHERE slug=? AND status="active"',
        [sector],
      )
    : [];
  if (sector && !categories.length) throw new Error("This sector is unavailable.");
  const [projects, settings, monitoring] = await Promise.all([
    rows(
      `SELECT p.id,p.content,c.name category FROM portfolio_projects p
      JOIN portfolio_categories c ON c.id=p.category_id
      WHERE p.status='published' AND JSON_EXTRACT(p.content,'$.include_in_catalogue')=true
      ${sector ? "AND (p.category_id=? OR JSON_CONTAINS(p.content,?, '$.category_ids'))" : ""}
      ORDER BY (JSON_EXTRACT(p.content,'$.catalogue_order') IS NULL OR JSON_TYPE(JSON_EXTRACT(p.content,'$.catalogue_order'))='NULL') ASC,
      CAST(NULLIF(JSON_UNQUOTE(JSON_EXTRACT(p.content,'$.catalogue_order')),'null') AS UNSIGNED) ASC,p.created_at DESC,p.id DESC`,
      sector ? [categories[0]!.id, String(categories[0]!.id)] : [],
    ),
    rows("SELECT content FROM website_settings WHERE id=1"),
    loadWebsiteMonitoring(),
  ]);
  if (!projects.length) throw new Error("No projects are included in this catalogue yet.");
  if (!settings[0]) throw new Error("Configure Website Settings before downloading a catalogue.");
  return {
    sector: categories[0]?.name || "Complete WEBakoof",
    projects: projects.map((p) => {
      const project = json<PublicContent["projects"][number]>(p["content"]);
      return {
        ...publicProject(project),
        websiteMonitorState: publicMonitorState(project, monitoring.get(Number(p["id"]))),
        category: String(p["category"]),
      };
    }),
    settings: json<PublicContent["settings"]>(settings[0]["content"]),
  };
}
