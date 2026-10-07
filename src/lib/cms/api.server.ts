import { randomBytes, randomUUID } from "node:crypto";
import { mkdir, writeFile, unlink } from "node:fs/promises";
import { resolve } from "node:path";
import { cleanArticle } from "./rich-text.server";
import { z } from "zod";
import { database, rows, json } from "./db.server";
import {
  HttpError,
  currentAdmin,
  requireAdmin,
  sameOrigin,
  rateLimit,
  hashPassword,
  verifyPassword,
  digest,
  cookieToken,
  sessionCookie,
} from "./security.server";
import {
  projectSchema,
  blogSchema,
  categorySchema,
  sectionSchema,
  sectionNames,
  settingsSchema,
} from "./schema";

const tables = {
  portfolio: "portfolio_projects",
  blogs: "blog_posts",
  "portfolio-categories": "portfolio_categories",
  "blog-categories": "blog_categories",
} as const;
const reply = (data: unknown, status = 200, headers: Record<string, string> = {}) =>
  Response.json(data, { status, headers: { "Cache-Control": "no-store", ...headers } });
export async function api(request: Request) {
  try {
    const path = new URL(request.url).pathname.replace(/^\/api\/cms\/?/, "").split("/");
    const kind = path[0] || "";
    const id = path[1];
    if (request.method !== "GET") sameOrigin(request);
    if (kind === "session" && request.method === "GET")
      return reply({ admin: await currentAdmin(request) });
    if (kind === "login" && request.method === "POST") {
      const data = z
        .object({
          email: z.string().email().max(254),
          password: z.string().min(1).max(200),
          remember: z.boolean(),
        })
        .parse(await body(request));
      await rateLimit("login:" + data.email.toLowerCase(), 8, 900);
      await rateLimit("login:global", 100, 900);
      const admin = (
        await rows<{ id: number; password_hash: string }>(
          "SELECT id,password_hash FROM admins WHERE email=?",
          [data.email.toLowerCase()],
        )
      )[0];
      const valid = await verifyPassword(
        data.password,
        admin?.password_hash || "00000000000000000000000000000000:" + "00".repeat(64),
      );
      if (!admin || !valid) throw new HttpError(401, "Email or password is incorrect.");
      const token = randomBytes(32).toString("hex");
      const age = data.remember ? 2592000 : 28800;
      await database().execute("DELETE FROM admin_sessions WHERE expires_at<UTC_TIMESTAMP()");
      await database().execute(
        "INSERT INTO admin_sessions(token_hash,admin_id,expires_at) VALUES (?,?,DATE_ADD(UTC_TIMESTAMP(),INTERVAL ? SECOND))",
        [digest(token), admin.id, age],
      );
      return reply({ ok: true }, 200, {
        "Set-Cookie": sessionCookie(token, data.remember ? age : undefined),
      });
    }
    const admin = await requireAdmin(request);
    if (kind === "logout" && request.method === "POST") {
      await database().execute("DELETE FROM admin_sessions WHERE token_hash=?", [
        digest(cookieToken(request)),
      ]);
      return reply({ ok: true }, 200, { "Set-Cookie": sessionCookie("", 0) });
    }
    if (kind === "profile") {
      if (request.method === "GET") return reply(admin);
      const data = z
        .object({
          name: z.string().trim().min(1).max(100),
          email: z.string().email().max(254),
          currentPassword: z.string().min(1).max(200),
          password: z
            .string()
            .max(200)
            .refine((v) => !v || v.length >= 12, "Use at least 12 characters."),
        })
        .parse(await body(request));
      await rateLimit("profile:" + admin.id, 8, 900);
      const record = (
        await rows<{ password_hash: string }>("SELECT password_hash FROM admins WHERE id=?", [
          admin.id,
        ])
      )[0]!;
      if (!(await verifyPassword(data.currentPassword, record.password_hash)))
        throw new HttpError(400, "Current password is incorrect.");
      await database().execute("UPDATE admins SET name=?,email=?,password_hash=? WHERE id=?", [
        data.name,
        data.email.toLowerCase(),
        data.password ? await hashPassword(data.password) : record.password_hash,
        admin.id,
      ]);
      if (data.password)
        await database().execute("DELETE FROM admin_sessions WHERE admin_id=?", [admin.id]);
      return reply({ ok: true, signInAgain: !!data.password });
    }
    if (kind === "dashboard" && request.method === "GET") {
      const counts = await rows(
        'SELECT (SELECT COUNT(*) FROM portfolio_projects) projects,(SELECT COUNT(*) FROM portfolio_categories) categories,(SELECT COUNT(*) FROM blog_posts) blogs,(SELECT COUNT(*) FROM contact_enquiries WHERE status="new") enquiries',
      );
      return reply({
        counts: counts[0],
        projects: await rows(
          "SELECT p.id,p.name,p.status,p.created_at,c.name category FROM portfolio_projects p JOIN portfolio_categories c ON c.id=p.category_id ORDER BY p.created_at DESC LIMIT 5",
        ),
        blogs: await rows(
          "SELECT p.id,p.title,p.status,p.created_at,c.name category FROM blog_posts p JOIN blog_categories c ON c.id=p.category_id ORDER BY p.created_at DESC LIMIT 5",
        ),
        enquiries: await rows(
          "SELECT id,name,service,status,created_at FROM contact_enquiries ORDER BY created_at DESC LIMIT 5",
        ),
      });
    }
    if (kind === "homepage") {
      if (request.method === "GET")
        return reply(await rows("SELECT slug,content FROM homepage_sections"));
      if (!id || !sectionNames[id]) throw new HttpError(400, "Unknown homepage section.");
      const content = sectionSchema.parse(await body(request));
      await database().execute(
        "INSERT INTO homepage_sections(slug,content) VALUES (?,?) ON DUPLICATE KEY UPDATE content=VALUES(content)",
        [id, JSON.stringify(content)],
      );
      return reply({ ok: true });
    }
    if (kind === "settings") {
      if (request.method === "GET")
        return reply(
          json(
            (await rows("SELECT content FROM website_settings WHERE id=1"))[0]?.["content"] || "{}",
          ),
        );
      const content = settingsSchema.parse(await body(request));
      await database().execute(
        "INSERT INTO website_settings(id,content) VALUES (1,?) ON DUPLICATE KEY UPDATE content=VALUES(content)",
        [JSON.stringify(content)],
      );
      return reply({ ok: true });
    }
    if (kind === "upload" && request.method === "POST") return await upload(request);
    if (kind === "enquiries") {
      if (request.method === "GET")
        return reply(await rows("SELECT * FROM contact_enquiries ORDER BY created_at DESC"));
      const data = z
        .object({ status: z.enum(["new", "contacted", "closed"]) })
        .parse(await body(request));
      await database().execute("UPDATE contact_enquiries SET status=? WHERE id=?", [
        data.status,
        validId(id),
      ]);
      return reply({ ok: true });
    }
    if (!Object.hasOwn(tables, kind)) throw new HttpError(404, "Not found.");
    const table = tables[kind as keyof typeof tables];
    const category = kind.endsWith("categories");
    if (request.method === "GET") {
      const result = await rows(
        `SELECT * FROM ${table}${id ? " WHERE id=?" : " ORDER BY created_at DESC"}`,
        id ? [validId(id)] : [],
      );
      return reply(
        result.map((r) => ({
          ...json<object>(r["content"] || "{}"),
          ...r,
          ...(kind === "portfolio" ? { featured: !!r["featured"] } : {}),
          content: undefined,
        })),
      );
    }
    if (request.method === "DELETE") {
      await database().execute(`DELETE FROM ${table} WHERE id=?`, [validId(id)]);
      return reply({ ok: true });
    }
    if (!["POST", "PUT"].includes(request.method)) throw new HttpError(405, "Method not allowed.");
    const input = await body(request);
    if (category) {
      const d = categorySchema.parse(input);
      await database().execute(
        id
          ? `UPDATE ${table} SET name=?,slug=?,description=?,status=? WHERE id=?`
          : `INSERT INTO ${table}(name,slug,description,status) VALUES (?,?,?,?)`,
        [d.name, d.slug, d.description, d.status, ...(id ? [validId(id)] : [])],
      );
    } else {
      const d = kind === "portfolio" ? projectSchema.parse(input) : blogSchema.parse(input);
      if ("html" in d) Object.assign(d, cleanArticle(d.html));
      const connection = await database().getConnection();
      try {
        await connection.beginTransaction();
        const columns =
          "category_id,slug,status," +
          (kind === "portfolio" ? "name,featured" : "title,publish_date") +
          ",content";
        const values = [
          d.category_id,
          d.slug,
          d.status,
          "name" in d ? d.name : d.title,
          "featured" in d ? d.featured : d.date,
          JSON.stringify(d),
        ];
        const [result] = await connection.execute(
          id
            ? `UPDATE ${table} SET ${columns
                .split(",")
                .map((c) => c + "=?")
                .join(",")} WHERE id=?`
            : `INSERT INTO ${table}(${columns}) VALUES (?,?,?,?,?,?)`,
          [...values, ...(id ? [validId(id)] : [])],
        );
        const recordId = id ? validId(id) : (result as { insertId: number }).insertId;
        if ("gallery" in d) {
          await connection.execute("DELETE FROM portfolio_project_images WHERE project_id=?", [
            recordId,
          ]);
          for (const [index, image] of d.gallery.entries())
            await connection.execute(
              "INSERT INTO portfolio_project_images(project_id,url,alt_text,sort_order) VALUES (?,?,?,?)",
              [recordId, image.url, image.alt, index],
            );
        }
        await connection.commit();
      } catch (e) {
        await connection.rollback();
        throw e;
      } finally {
        connection.release();
      }
    }
    return reply({ ok: true });
  } catch (error) {
    if (error instanceof z.ZodError)
      return reply(
        { error: error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ") },
        400,
      );
    if (error instanceof HttpError) return reply({ error: error.message }, error.status);
    const code = (error as { code?: string }).code;
    if (code === "ER_DUP_ENTRY")
      return reply({ error: "This slug or email is already in use." }, 409);
    if (code === "ER_ROW_IS_REFERENCED_2")
      return reply({ error: "Move the items in this category before deleting it." }, 409);
    if (code === "ER_NO_REFERENCED_ROW_2")
      return reply({ error: "Choose an existing category." }, 400);
    console.error("CMS request failed:", (error as Error).message);
    return reply(
      { error: "CMS is unavailable. Check the MySQL setup and server configuration." },
      503,
    );
  }
}
function validId(id: string | undefined) {
  return z.coerce.number().int().positive().parse(id);
}
async function body(request: Request) {
  const reader = request.body?.getReader();
  if (!reader) throw new HttpError(400, "JSON body required.");
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const part = await reader.read();
    if (part.done) break;
    size += part.value.length;
    if (size > 300000) {
      await reader.cancel();
      throw new HttpError(413, "This content is too large.");
    }
    chunks.push(part.value);
  }
  const value = Buffer.concat(chunks).toString("utf8");
  try {
    return JSON.parse(value);
  } catch {
    throw new HttpError(400, "Invalid JSON.");
  }
}
async function upload(request: Request) {
  const max = 5 * 1024 * 1024;
  if (Number(request.headers.get("content-length") || 0) > max + 20000)
    throw new HttpError(413, "Maximum image size is 5 MB.");
  const reader = request.body?.getReader();
  if (!reader) throw new HttpError(400, "Choose an image.");
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const part = await reader.read();
    if (part.done) break;
    size += part.value.length;
    if (size > max + 20000) {
      await reader.cancel();
      throw new HttpError(413, "Maximum image size is 5 MB.");
    }
    chunks.push(part.value);
  }
  const form = await new Request(request.url, {
    method: "POST",
    headers: request.headers,
    body: Buffer.concat(chunks),
  }).formData();
  const file = form.get("file");
  const folder = z.enum(["homepage", "portfolio", "blog", "settings"]).parse(form.get("folder"));
  if (!(file instanceof File) || !file.size || file.size > max)
    throw new HttpError(400, "Choose an image up to 5 MB.");
  const bytes = Buffer.from(await file.arrayBuffer());
  const extension = bytes.subarray(0, 3).equals(Buffer.from([255, 216, 255]))
    ? "jpg"
    : bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
      ? "png"
      : bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP"
        ? "webp"
        : null;
  if (!extension || !/\.(jpe?g|png|webp)$/i.test(file.name))
    throw new HttpError(400, "Only JPG, PNG and WebP images are supported.");
  const filename = randomUUID() + "." + extension;
  const directory = resolve(process.env["UPLOAD_DIR"] || "uploads", folder);
  const path = resolve(directory, filename);
  const url = `/uploads/${folder}/${filename}`;
  await mkdir(directory, { recursive: true });
  await writeFile(path, bytes, { flag: "wx" });
  try {
    await database().execute(
      "INSERT INTO media(filename,path,url,alt_text,mime_type,size) VALUES (?,?,?,?,?,?)",
      [
        filename,
        `${folder}/${filename}`,
        url,
        String(form.get("alt") || "").slice(0, 255),
        "image/" + (extension === "jpg" ? "jpeg" : extension),
        bytes.length,
      ],
    );
  } catch (e) {
    await unlink(path);
    throw e;
  }
  return reply({ url });
}
