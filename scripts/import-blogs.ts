import { mkdir, readFile, writeFile } from "node:fs/promises";
import mysql from "mysql2/promise";
import ts from "typescript";
import sanitize from "sanitize-html";
import { blogSchema } from "../src/lib/cms/schema";
import { cleanArticle } from "../src/lib/cms/rich-text.server";

type Entry = {
  slug: string;
  date: string;
  category: string;
  metaDescription: string;
  excerpt: string;
  focusKeyword: string;
  secondaryKeywords: string;
  image: string;
  imageAlt: string;
};
type Statement = { sql: string; values: (string | number)[] };
const statements: Statement[] = [];
const add = (sql: string, values: (string | number)[] = []) => statements.push({ sql, values });
const escape = (s: string) =>
  s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
const inline = (s: string) =>
  escape(s).replace(/\[([^\]]+)\]\((\/[a-z0-9/-]+)\)/g, '<a href="$2">$1</a>');
const entries: Entry[] = JSON.parse(await readFile("content/blog/manifest.json", "utf8"));
if (entries.length !== 10 || new Set(entries.map((r) => r.slug)).size !== 10)
  throw new Error("Expected 10 unique articles");
const summary = [];
for (const entry of entries) {
  const markdown = await readFile(`content/blog/${entry.slug}.md`, "utf8");
  const [heading, ...blocks] = markdown.trim().split(/\r?\n\s*\r?\n/);
  const title = heading!.replace(/^# /, "");
  const html = blocks
    .map((block) => {
      if (block.startsWith("### ")) return `<h3>${inline(block.slice(4))}</h3>`;
      if (block.startsWith("## ")) return `<h2>${inline(block.slice(3))}</h2>`;
      return `<p>${inline(block.replace(/\r?\n/g, " "))}</p>`;
    })
    .join("");
  // Add spaces at block boundaries before counting; stripped HTML otherwise joins words.
  const wordCount = sanitize(html.replace(/<\/(p|h2|h3)>/g, "</$1> "), {
    allowedTags: [],
    allowedAttributes: {},
  })
    .trim()
    .split(/\s+/).length;
  if (wordCount < 480 || wordCount > 550)
    throw new Error(`${entry.slug}: ${wordCount} words, expected 480-550`);
  if (entry.metaDescription.length < 150 || entry.metaDescription.length > 160)
    throw new Error(`${entry.slug}: invalid meta description length`);
  const excerptWords = entry.excerpt.split(/\s+/).length;
  if (excerptWords < 30 || excerptWords > 45)
    throw new Error(`${entry.slug}: invalid excerpt length`);
  await readFile("public" + entry.image);
  const content = blogSchema.parse({
    ...entry,
    title,
    metaTitle: title,
    category_id: 1,
    status: "published",
    html,
    readTime: `${Math.ceil(wordCount / 200)} min read`,
    ...cleanArticle(html),
  });
  const categorySlug = entry.category
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-$/, "");
  add("INSERT IGNORE INTO blog_categories(name,slug,description) VALUES (?,?,'')", [
    entry.category,
    categorySlug,
  ]);
  // INSERT IGNORE keeps every existing slug, including admin-edited seed articles, untouched.
  add(
    `INSERT IGNORE INTO blog_posts(category_id,title,slug,status,publish_date,content,published_at)
    SELECT id,?,?,'published',?,JSON_SET(?,'$.category_id',id),UTC_TIMESTAMP() FROM blog_categories WHERE slug=?
    AND NOT EXISTS (SELECT 1 FROM blog_seed_history WHERE slug=?)`,
    [title, entry.slug, entry.date, JSON.stringify(content), categorySlug, entry.slug],
  );
  add("INSERT IGNORE INTO blog_seed_history(slug) SELECT slug FROM blog_posts WHERE slug=?", [
    entry.slug,
  ]);
  summary.push({
    slug: entry.slug,
    words: wordCount,
    readTime: content.readTime,
    metaLength: entry.metaDescription.length,
  });
}

// The original demo source is the comparison baseline, never an arbitrary live DB snapshot.
const source = await readFile("src/data/blog.ts", "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext },
}).outputText;
const { articles: demos } = await import(
  "data:text/javascript;base64," + Buffer.from(compiled).toString("base64")
);
const redirects: Record<string, string> = {
  "plan-a-business-website": "choose-website-development-company-pune",
  "ecommerce-product-page-checklist": "ecommerce-development-small-business-guide",
  "useful-website-measurement": "website-speed-mobile-ux-business-growth",
};
for (const demo of demos) {
  const originalHtml = sanitize(
    demo.sections
      .map(
        (s: { title: string; paragraphs: string[] }) =>
          `<h2>${escape(s.title)}</h2>${s.paragraphs.map((p) => `<p>${escape(p)}</p>`).join("")}`,
      )
      .join(""),
  );
  const baseline = blogSchema.parse({
    ...demo,
    category_id: 1,
    status: "published",
    html: originalHtml,
  });
  const fields = Object.entries(baseline).filter(
    ([key, value]) =>
      key !== "category_id" && typeof value === "string" && key !== "secondaryKeywords",
  );
  const predicate =
    "p.slug=? AND p.status='published' AND p.publish_date=? AND p.updated_at=p.created_at AND " +
    fields
      .map(([key]) => `COALESCE(JSON_UNQUOTE(JSON_EXTRACT(p.content,'$.${key}')),'')=?`)
      .join(" AND ") +
    " AND JSON_LENGTH(p.content)=? AND JSON_CONTAINS(JSON_EXTRACT(p.content,'$.sections'),?) AND JSON_CONTAINS(?,JSON_EXTRACT(p.content,'$.sections'))";
  const values = [
    demo.slug,
    demo.date,
    ...fields.map(([, value]) => String(value)),
    Object.keys(baseline).filter((key) => key !== "secondaryKeywords").length,
    JSON.stringify(baseline.sections),
    JSON.stringify(baseline.sections),
  ];
  // Archive only unchanged demos; every admin-modified record is retained.
  add(
    `INSERT IGNORE INTO blog_demo_backup(source_id,original_record)
    SELECT p.id,JSON_OBJECT('id',p.id,'category_id',p.category_id,'title',p.title,'slug',p.slug,'status',p.status,
      'publish_date',p.publish_date,'content',p.content,'created_at',p.created_at,'updated_at',p.updated_at,'published_at',p.published_at)
    FROM blog_posts p WHERE ${predicate}`,
    values,
  );
  add(
    `INSERT IGNORE INTO blog_redirects(old_slug,new_slug)
    SELECT p.slug,? FROM blog_posts p JOIN blog_demo_backup b ON b.source_id=p.id WHERE ${predicate}`,
    [redirects[demo.slug]!, ...values],
  );
  add(
    `DELETE p FROM blog_posts p JOIN blog_demo_backup b ON b.source_id=p.id WHERE ${predicate}`,
    values,
  );
}

const migration = await readFile("database/blog-upgrade.sql", "utf8");
if (process.argv.includes("--export")) {
  await mkdir(".local/hostinger", { recursive: true });
  const sql =
    migration +
    "\nSTART TRANSACTION;\n" +
    statements.map((s) => mysql.format(s.sql, s.values) + ";").join("\n") +
    "\nCOMMIT;\n";
  await writeFile(".local/hostinger/blog-upgrade-import.sql", sql, "utf8");
  await writeFile(".local/hostinger/blog-schema-upgrade.sql", migration, "utf8");
  console.log(
    "Prepared schema and content SQL files (no credentials). Import blog-schema-upgrade.sql before deploying new code, then blog-upgrade-import.sql after deployment.",
  );
} else if (process.argv.includes("--apply")) {
  if (!process.env["DB_NAME"] || !process.env["DB_USER"])
    throw new Error("Configure DB_* variables first");
  const connection = await mysql.createConnection({
    host: process.env["DB_HOST"],
    port: Number(process.env["DB_PORT"] || 3306),
    user: process.env["DB_USER"],
    password: process.env["DB_PASSWORD"],
    database: process.env["DB_NAME"],
    timezone: "Z",
    ...(process.env["DB_SSL"] === "true" ? { ssl: { rejectUnauthorized: true } } : {}),
  });
  try {
    for (const sql of migration
      .replace(/^--.*$/gm, "")
      .split(";")
      .filter((s) => s.trim()))
      await connection.query(sql);
    await connection.beginTransaction();
    for (const statement of statements) await connection.execute(statement.sql, statement.values);
    await connection.commit();
    const [records] = await connection.query(
      "SELECT slug,status,publish_date,published_at FROM blog_posts ORDER BY publish_date DESC",
    );
    console.log(records);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    await connection.end();
  }
} else {
  console.log(
    "Validation only. Use --export for phpMyAdmin SQL or --apply with the intended DB environment. Nothing changed.",
  );
}
console.table(summary);
