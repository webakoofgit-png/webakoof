# Blog management and initial production import

The blog changes require the explicit production schema and content imports below. A GitHub push deploys application code only; it does not import these articles into Hostinger MySQL. The last observed production `/blog` returned HTTP 200; that verifies the existing deployment, not the new ten-post dataset.

## What changed

- `content/blog/`: ten original English Markdown articles and `manifest.json`, containing their editorial dates, categories, excerpts, keywords, images and metadata. The importer validates 480–550 words, 150–160 description characters, 30–45 excerpt words and local image availability.
- `scripts/import-blogs.ts`: explicit validation, SQL export and parameterised MySQL import. It inserts only missing slugs and never updates existing seed posts.
- `database/blog-upgrade.sql`: repeatable schema upgrade. Adds `blog_posts.published_at`, `blog_redirects`, `blog_demo_backup`, `blog_seed_history` and `media_blobs`. Existing `blog_posts`, `blog_categories` and `media` conventions remain in use.
- `src/lib/cms/`: published-only MySQL reads, actual publication/modification timestamps, calculated reading time, validation, authenticated mutations, slug redirects and transactional media uploads.
- Blog route/components: preserve the page design and breadcrumb, remove the separately requested featured section, display complete sanitised HTML, and publish truthful `BlogPosting` metadata.
- Admin editor/list: editorial date labels, secondary keywords and inline image alt text. Existing search, category/status filters, add/edit, rich text, draft previews, category management and delete confirmation remain available.
- `src/server.ts`: dynamic HTML uses `Cache-Control: no-store`. Admin edits are read from MySQL on the next page load; no Git push is required for content edits.
- `scripts/cms-setup.ts`: general bootstrap no longer reintroduces retired demo blog posts. The ten-post import is a separate explicit step, never part of `npm run build`.
- `public/blog-images/` and `IMAGE-CREDITS.md`: copies and attribution of existing licensed illustrative stock assets. These are not client result photographs.
- `tests/blog-management.spec.ts`: public and protected admin integration checks, local-only fixture mutations and seed preservation. Existing CMS regression coverage remains in place.

## Prepare files locally

Run from the project directory:

```sh
node --env-file=.env --import tsx scripts/import-blogs.ts --export
```

This does not connect to MySQL or change any records. It generates:

1. `.local/hostinger/blog-schema-upgrade.sql`: schema only; safe to apply before the code changes.
2. `.local/hostinger/blog-upgrade-import.sql`: schema plus content and demo archival; safe to re-run. No credentials or administrator password hashes are included.

To apply to an explicitly configured development database:

```sh
node --env-file=.env --import tsx scripts/import-blogs.ts --apply
```

The SQL export targets the database selected in phpMyAdmin; it does not issue `CREATE DATABASE`, `USE`, `DROP` or `TRUNCATE`. The content changes run in a transaction. MySQL DDL is committed separately. If an import reports an error, inspect it and re-run the corrected import; do not reset the database.

## Safe Hostinger rollout

1. Back up the production database using phpMyAdmin Export. Keep it private. Also retain any old filesystem uploads if they exist.
2. Select the existing production Webakoof database in phpMyAdmin. Import **`blog-schema-upgrade.sql` first**. This leaves the current blog content unchanged and gives the new code its required columns/tables.
3. Deploy the reviewed code through a normal commit/push to `main`; do not force-push or rewrite Lovable-connected history. If Hostinger automatic deployment is enabled, confirm its deployed commit. Otherwise deploy that commit through hPanel. If code was pushed before the schema import, apply the schema promptly before verifying the new application.
4. Keep Nitro, Node 22, root `./`, build `npm run build`, output `.output`, entry `server/index.mjs`. No automatic seed command belongs in the deployment build.
5. After the new code is deployed, import **`blog-upgrade-import.sql`** into the same database. The new articles receive real `created_at` and `published_at` times at import. Their supplied dates are editorial display dates, not backdated publication claims.
6. Open `https://webakoof.com/blog` and refresh. Check ten cards, newest first, and the four requested categories. Open each article, check images, mobile layout, title/description/canonical/OG tags and `BlogPosting` timestamps.
7. Check `/sitemap.xml`: the ten published slugs should appear. The three retired demo routes should return a 301 to related new articles. Resubmit the sitemap in Search Console if appropriate.
8. Sign in at `/admin/login`, open `/admin/blogs`, make a small intentional edit and save. Refresh its public page. Verify it stays after an app restart/redeploy. Check runtime logs for MySQL errors.

The initial import archives and removes only the three recognised demo posts when their content and timestamps still match the original seed. Admin-edited demos and unrelated production posts are retained. Consequently, production may legitimately have more than ten posts if an editor added or changed content; do not delete those records to force a count. Backups are in `blog_demo_backup`; redirects are in `blog_redirects`. Existing slugs are never overwritten, so review any pre-existing collision in admin.

## Environment variables and permissions

Required names: `CMS_ENABLED`, `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_SSL`, `APP_ORIGIN`, `VITE_SITE_URL`, `SESSION_SECRET`.

Use the existing production MySQL settings. `CMS_ENABLED` must be enabled and the public origin settings must identify the production domain. Do not copy local database credentials into production. Migration access needs CREATE/ALTER/REFERENCES privileges; runtime access needs SELECT/INSERT/UPDATE/DELETE. Keep credentials out of Git and screenshots.

## Persistent images

New admin uploads are validated as JPG/PNG/WebP, limited to 5 MB and stored transactionally in `media` plus `media_blobs` (LONGBLOB). They are served through the existing `/uploads/` route. Redeployment cannot erase the image because the application build directory is not its source of truth. Include these tables in database backups and allow sufficient MySQL packet size for a 5 MB upload.

The route retains a fallback for old filesystem images. If the existing production database already lists filesystem uploads, migrate their bytes into `media_blobs` using a trusted server-side process, or keep their `UPLOAD_DIR` on genuinely persistent storage before redeploying. The inspected local DB had no pre-existing media records. The initial Hostinger SQL import also contained zero media rows. Do not presume the current production database is still empty without checking.

## Admin editing

Use **Blogs → Add Blog**, or search/filter and click Edit. Set the title, unique slug, category, excerpt, featured image/alt text, editorial date, article and SEO fields. The editor supports H2/H3, paragraphs, lists, links and inline images. Choose **Draft** to unpublish, or **Published**, then **Save Blog**. Draft preview requires authentication. Changing a slug creates a redirect from the previous URL. Deleting requires confirmation. Actual publication time is recorded once, and changes update `updated_at`; read time is recalculated from saved content.

Do not use the general website seed as a production reset. The import history prevents re-creating seed articles deleted or renamed by an admin; existing articles are never overwritten. Imports are an explicit initial provisioning operation, not a scheduled sync.

## Checks and limits

Local verification covers the ten records, all routes/categories/images/metadata, sanitisation, protected CRUD, draft preview, publish/unpublish/delete, persistent media bytes and a repeat import retaining an admin edit. Run local integration tests only against the intended development database. Deployment and production data must be verified after the manual schema/import and requested push; a passing local build is not proof the changes are live.

Completed locally on 9 October 2026:

- MySQL: ten articles, three original demo backups, three demo redirects and ten import-history entries; no duplicate posts after repeated imports.
- All ten article routes, four category filters, local images, mobile overflow checks, metadata and sitemap passed.
- Three blog integration tests and four existing CMS regression scenarios passed. One older navigation test was corrected to search for Rockals instead of assuming it was on the first pagination page.
- A saved article and exact uploaded image bytes were verified through the built Node app, then verified again after stopping and restarting it. Temporary QA records were removed; ten articles remain.
- `npm run typecheck` and `npm run build` passed. `npm run lint` finished with zero errors and eleven existing React Fast Refresh warnings. Generated Vercel/Nitro output is excluded from source linting.
- Production database import, deployed commit verification, production admin writes and production restart/redeploy persistence still require the Hostinger rollout above. No Git push or production write was performed for this request.
