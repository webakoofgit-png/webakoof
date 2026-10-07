import { readFile, mkdir, copyFile } from "node:fs/promises";
import { resolve, basename } from "node:path";
import ts from "typescript";
import { database, rows } from "../src/lib/cms/db.server";
import { hashPassword } from "../src/lib/cms/security.server";
import { homepageDefaults, settingsDefaults } from "../src/lib/cms/defaults";
import { projectSchema, blogSchema, sectionSchema } from "../src/lib/cms/schema";
import { services } from "../src/data/services";
import { reasons, process as steps, technologies } from "../src/components/home/content";
import sanitize from "sanitize-html";
const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
async function legacy(file: string, exportName: string) {
  let source = await readFile(file, "utf8");
  for (const match of source.matchAll(/import (\w+) from "@\/assets\/([^"]+)";/g)) {
    await copyFile(resolve("src/assets", match[2]!), resolve("public/cms-seed", match[2]!));
    source = source.replace(match[0], `const ${match[1]} = '/cms-seed/${match[2]}';`);
  }
  const compiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  return (await import("data:text/javascript;base64," + Buffer.from(compiled).toString("base64")))[
    exportName
  ];
}
try {
  const schema = await readFile("database/schema.sql", "utf8");
  for (const statement of schema.split(";").filter((s) => s.trim()))
    await database().query(statement);
  if (process.argv.includes("--admin")) {
    const email = process.env["ADMIN_EMAIL"];
    const password = process.env["ADMIN_PASSWORD"];
    if (!email || !password || password.length < 12)
      throw new Error(
        "Set ADMIN_EMAIL and ADMIN_PASSWORD (12+ characters) in your local environment.",
      );
    await database().execute("INSERT INTO admins(name,email,password_hash) VALUES (?,?,?)", [
      process.env["ADMIN_NAME"] || "Administrator",
      email.toLowerCase(),
      await hashPassword(password),
    ]);
    console.log("Administrator created. Remove ADMIN_PASSWORD from your environment.");
  }
  if (process.argv.includes("--seed")) {
    await mkdir("public/cms-seed", { recursive: true });
    await copyFile("src/assets/hero-real-workspace.jpg", "public/cms-seed/hero-real-workspace.jpg");
    const projects = await legacy("src/data/projects.ts", "projects");
    const articles = await legacy("src/data/blog.ts", "articles");
    for (const [kind, records] of [
      ["portfolio", projects],
      ["blog", articles],
    ] as const) {
      for (const record of records) {
        const category = kind === "portfolio" ? record.industry : record.category;
        await database().execute(
          `INSERT IGNORE INTO ${kind}_categories(name,slug,description) VALUES (?,?,'')`,
          [category, slug(category)],
        );
        const categoryId = (
          await rows<{ id: number }>(`SELECT id FROM ${kind}_categories WHERE slug=?`, [
            slug(category),
          ])
        )[0]!.id;
        if (kind === "portfolio") {
          const data = projectSchema.parse({
            ...record,
            isConcept: record.isConcept !== false,
            category_id: categoryId,
            status: "published",
            featured: ["skincity-india", "rockals"].includes(record.slug),
          });
          await database().execute(
            'INSERT IGNORE INTO portfolio_projects(category_id,name,slug,status,featured,content) VALUES (?,?,?,"published",?,?)',
            [categoryId, data.name, data.slug, data.featured, JSON.stringify(data)],
          );
        } else {
          const escape = (s: string) =>
            s.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
          const html = record.sections
            .map(
              (s: { title: string; paragraphs: string[] }) =>
                `<h2>${escape(s.title)}</h2>${s.paragraphs.map((p) => `<p>${escape(p)}</p>`).join("")}`,
            )
            .join("");
          const data = blogSchema.parse({
            ...record,
            category_id: categoryId,
            status: "published",
            html: sanitize(html),
          });
          await database().execute(
            'INSERT IGNORE INTO blog_posts(category_id,title,slug,status,publish_date,content) VALUES (?,?,?,"published",?,?)',
            [categoryId, data.title, data.slug, data.date, JSON.stringify(data)],
          );
        }
      }
    }
    homepageDefaults["services"]!.items = services.map(
      (s) =>
        sectionSchema.parse({
          items: [
            {
              number: s.number,
              title: s.title,
              description: s.description,
              url: "/services/" + s.slug,
              icon: s.icon.displayName || "Globe2",
            },
          ],
        }).items[0]!,
    );
    homepageDefaults["why"]!.items = reasons.map(
      ([title, description, icon]) =>
        sectionSchema.parse({ items: [{ title, description, icon: icon.displayName || "Target" }] })
          .items[0]!,
    );
    homepageDefaults["process"]!.items = steps.map(
      ([number, title, description]) =>
        sectionSchema.parse({ items: [{ number, title, description }] }).items[0]!,
    );
    homepageDefaults["technology"]!.items = technologies.map(
      (t) => sectionSchema.parse({ items: [{ title: t.name, url: t.icon }] }).items[0]!,
    );
    for (const [key, value] of Object.entries(homepageDefaults))
      await database().execute("INSERT IGNORE INTO homepage_sections(slug,content) VALUES (?,?)", [
        key,
        JSON.stringify(value),
      ]);
    await database().execute("INSERT IGNORE INTO website_settings(id,content) VALUES (1,?)", [
      JSON.stringify(settingsDefaults),
    ]);
    for (const [table, records] of [
      ["portfolio_projects", projects],
      ["blog_posts", articles],
    ] as const)
      for (const record of records) {
        if (!(await rows(`SELECT id FROM ${table} WHERE slug=?`, [record.slug])).length)
          throw new Error("Migration verification failed: " + record.slug);
      }
    console.log(
      `Verified ${projects.length} projects and ${articles.length} blogs. Seed is idempotent and does not overwrite CMS edits.`,
    );
  }
  console.log("MySQL schema ready.");
} catch (error) {
  console.error((error as Error).message);
  process.exitCode = 1;
} finally {
  await database().end();
}
