import { access } from "node:fs/promises";
import { database, rows, json } from "../src/lib/cms/db.server";
import { projectSchema } from "../src/lib/cms/schema";

// Explicit pairs preserve the filenames supplied by the website owner.
const media = [
  ["skincity-india", "SkinCity India", "Skincityindia.png", "skincity.mp4"],
  ["rockals", "Rockals", "Rockals.png", "rockals.mp4"],
  ["ambika-jewellers", "Ambika Jewellers", "ambika jewellers.png", "abkambika jewellers.mp4"],
  ["dadhichi-solar", "Dadhichi Solar", "Dadhichi Solar power.png", "dadhichi solar.mp4"],
  ["ekvira-export", "Ekvira Export", "ekvira.png", "ekvira export.mp4"],
  ["gurukul-class", "Gurukul Class", "Gurukul.png", "gurukul class.mp4"],
  [
    "jagdamba-poultry-farm",
    "Jagdamba Poultry Farm",
    "jagdamba poltry.png",
    "jagdamba poultry farm.mp4",
  ],
  ["kaypahije", "Kaypahije", "kaypahije.png", "kaypahije.mp4"],
  ["krayons-preschool", "Krayons Preschool", "Krayons preschool.png", "krayons preschool.mp4"],
  ["morya-plus-hospital", "Morya Plus Hospital", "morya plus.png", "morya plus hospital.mp4"],
  ["nivesah-weddings", "Nivesah Weddings", "nivesaaha.png", "nivesah weddings.mp4"],
  ["paranjape-tours", "Paranjape Tours", "Paranjape.png", "paranjpe tours.mp4"],
  ["shivrudra-graphics", "Shivrudra Graphics", "shivrudra graphics.png", "shivrudra graphics.mp4"],
  [
    "skill-spark-consulting",
    "Skill Spark Consulting",
    "skills spark.png",
    "skill spark consulting.mp4",
  ],
  ["suntech-solar", "Suntech Solar", "suntech solar.png", "suntech .mp4"],
  ["ump-consultants", "UMP Consultants", "ump.png", "ump consultants.mp4"],
  ["vet-extrusion", "VET Extrusion", "VET.png", "vet extrusion.mp4"],
  ["rent-for-health", "Rent for Health", "Rent For health.png", "rent for health.mp4"],
] as const;
const assetUrl = (name: string) => (name ? `/projects/${encodeURIComponent(name)}` : "");

try {
  // Validate all source files before changing any records.
  for (const [, , image, video] of media)
    for (const file of [image, video]) if (file) await access(`public/projects/${file}`);
  const connection = await database().getConnection();
  try {
    await connection.beginTransaction();
    await connection.execute(
      "INSERT IGNORE INTO portfolio_categories(name,slug,description,status) VALUES (?,?,?,?)",
      [
        "Category Pending",
        "category-pending",
        "Assign the correct sector before publishing imported portfolio projects.",
        "inactive",
      ],
    );
    const [categoryRows] = await connection.execute(
      "SELECT id FROM portfolio_categories WHERE slug=?",
      ["category-pending"],
    );
    const categoryId = (categoryRows as { id: number }[])[0]!.id;
    let added = 0,
      linked = 0,
      preserved = 0;
    for (const [slug, name, image, video] of media) {
      const [existingRows] = await connection.execute(
        "SELECT id,content FROM portfolio_projects WHERE slug=?",
        [slug],
      );
      const existing = (existingRows as { id: number; content: unknown }[])[0];
      if (existing) {
        const content = json<Record<string, unknown>>(existing.content);
        if (video && !content["showcaseVideo"]) {
          await connection.execute(
            "UPDATE portfolio_projects SET content=JSON_SET(content,'$.showcaseVideo',?) WHERE id=?",
            [assetUrl(video), existing.id],
          );
          linked++;
        } else preserved++;
        continue;
      }
      const content = projectSchema.parse({
        name,
        slug,
        category_id: categoryId,
        status: "draft",
        featured: false,
        image: assetUrl(image),
        showcaseVideo: assetUrl(video),
      });
      await connection.execute(
        "INSERT INTO portfolio_projects(category_id,name,slug,status,featured,content) VALUES (?,?,?,'draft',false,?)",
        [categoryId, name, slug, JSON.stringify(content)],
      );
      added++;
    }
    await connection.commit();
    console.log(
      `Imported ${added} drafts, linked ${linked} recordings, preserved ${preserved} existing projects.`,
    );
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
  const projects = await rows<{ name: string; status: string; video: string }>(
    "SELECT name,status,JSON_UNQUOTE(JSON_EXTRACT(content,'$.showcaseVideo')) video FROM portfolio_projects WHERE JSON_UNQUOTE(JSON_EXTRACT(content,'$.showcaseVideo'))<>'' ORDER BY name",
  );
  console.log(`Verified ${projects.length} portfolio projects with video recordings.`);
} catch (error) {
  console.error((error as Error).message);
  process.exitCode = 1;
} finally {
  await database().end();
}
