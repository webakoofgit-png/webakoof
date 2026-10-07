# WEBakoof CMS

The existing TanStack Start application now includes a MySQL-backed admin at `/admin/login`. Public pages retain their existing layouts. No Supabase or Firebase is used.

## Local installation in this workspace

- Website: http://127.0.0.1:8080
- Admin: http://127.0.0.1:8080/admin/login
- Login credentials: `.local/admin-login.txt` (ignored by Git).
- MySQL Community 8.4.11: `.local/mysql/mysql-8.4.11-winx64`, listening only on `127.0.0.1:3307`.
- Database: `webakoof`. Application credentials and session secret are in `.env`; the isolated database root password is in `.local/mysql/root-password.txt`.
- Uploads: `uploads/`. Keep this directory and the database when restarting.

Change the generated admin password in **Admin Profile** after signing in. `.local/admin-login.txt` records only the initial password.

Start the website and local database together (also after restarting your PC):

```sh
npm run dev -- --host 127.0.0.1
```

The dev command starts the existing portable MySQL installation when the configured server is `127.0.0.1:3307`, then checks the database connection before starting Vite. It preserves all existing data. MySQL startup logs are in `.local/mysql/dev.log`; the database stays running when Vite stops. Other database hosts must already be running.

For manual troubleshooting, start the local database in PowerShell:

```powershell
& '.local/mysql/mysql-8.4.11-winx64/bin/mysqld.exe' --no-defaults --basedir="$PWD/.local/mysql/mysql-8.4.11-winx64" --datadir="$PWD/.local/mysql/data" --port=3307 --bind-address=127.0.0.1 --mysqlx=0 --console
```

Use the exact configured origin (`127.0.0.1`, not `localhost`) for admin writes. `APP_ORIGIN` enforces same-origin requests.

## Set up another MySQL server

1. Install Node.js 22.12+ or Node.js 24 and MySQL 8.4 LTS. Create an empty database using `utf8mb4` and a dedicated database user.
2. Run `npm ci` and copy `.env.example` to `.env`.
3. Set `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `APP_ORIGIN`, and a random `SESSION_SECRET` of at least 32 characters. Use `DB_SSL=true` for a remote database with a trusted TLS certificate.
4. Keep `CMS_ENABLED=false` while preparing the database.
5. Run `npm run cms:seed`. This creates the schema, imports and verifies the existing five projects and three blogs, copies bundled images into `public/cms-seed`, and seeds actual homepage sections and settings. Re-running preserves existing CMS edits.
6. Set `ADMIN_NAME`, `ADMIN_EMAIL`, and a unique `ADMIN_PASSWORD` of at least 12 characters locally; run `npm run cms:admin`. Remove `ADMIN_PASSWORD` from the environment afterward.
7. Set `CMS_ENABLED=true`, restart the application, and verify public pages and admin login.

The seed requires CREATE/ALTER/INDEX/REFERENCES privileges. The runtime user needs SELECT/INSERT/UPDATE/DELETE only. The setup command creates tables inside the configured database; it does not provision a hosted database or modify existing accounts.

The legacy TypeScript content files are intentionally retained as migration inputs and an explicit rollback mode. With `CMS_ENABLED=true`, projects, blog posts, categories, homepage sections and settings load from MySQL. An empty CMS stays empty; it does not silently republish static content. CMS failures do not fall back to stale static content.

## Deployment

This CMS uses the **Node server Nitro preset**, MySQL TCP connections and a persistent filesystem for uploaded media. Deploy on a Node host/VPS with a persistent `UPLOAD_DIR`, or adapt the media repository to object storage before deploying to an ephemeral filesystem. A static-only or default Cloudflare/Lovable deployment is not configured to run this MySQL/filesystem backend.

```sh
npm run typecheck
npm run build
npm start
```

Set `PORT` and `HOST` as needed. Use HTTPS in production, set `APP_ORIGIN` and `VITE_SITE_URL` to the public origin, and keep all DB/session secrets server-side. Production session cookies are Secure, HttpOnly, SameSite=Strict. The reverse proxy must forward requests to the Node server without caching admin HTML/API responses. Configure a request-body limit around 6 MB and proxy-level login/form throttling for production traffic.

Build on the target operating system. Back up MySQL, `uploads/`, and the migrated `public/cms-seed/` assets together. Never upload `.env`, `.local`, test traces or generated credentials to a public repository.

## Everyday content editing

- Homepage: select a section in the left panel; edit on the right and save. Only existing homepage sections are included. This homepage has no About, FAQ or Industries section.
- Portfolio: create categories, add/edit projects through Basic Info / Media / Project Details / SEO tabs, and publish. Featured projects appear on the homepage. Gallery order and existing showcase video URLs are supported.
- Blogs: categories, rich text, images, SEO, draft previews and publication dates. Drafts and future-dated posts are excluded from public routes. Dates use UTC.
- Enquiries: contact submissions are saved in MySQL; inspect them in the drawer and mark Contacted or Closed. Webhook delivery remains available only in legacy mode.
- Settings: brand assets, contact and social details, homepage default SEO and favicon. Individual page SEO remains specific to each page.
- Profile: current password is required for profile changes. Changing password invalidates all sessions and requires signing in again.

Forgot-password email delivery is intentionally not configured; the login shows an explanatory message. To recover access, provision a new administrator using `cms:admin` with a different email, or have a database administrator reset the existing password using the same scrypt hashing helper. There is no public registration endpoint.

Uploads accept JPG/PNG/WebP up to 5 MB, validate signatures, use random filenames and store metadata in MySQL. Removing an image from content detaches it; existing media files are retained to avoid breaking references. Video upload/transcoding is outside this image uploader; existing `/projects/*.mp4` URLs remain usable.

## Checks

```sh
npm run typecheck
npm run lint
npx playwright test tests/cms.spec.ts tests/cms-flows.spec.ts tests/enquiry.spec.ts --workers=1
```

CMS integration tests require the local `.local/admin-login.json` credentials (or `CMS_TEST_EMAIL`/`CMS_TEST_PASSWORD` for `cms.spec.ts`). They create temporary content and restore edited settings. Run only against a development database, never production. Browser screenshots and traces are stored in ignored `qa-artifacts/`.

## Portfolio catalogues

Portfolio sector tabs use active MySQL `portfolio_categories` names and slugs. Share a sector with `/portfolio?sector=<category-slug>`.

In **Admin > Portfolio > Add/Edit Project > Basic Info**, set Website URL, switch **Include in Catalogue** ON, and optionally enter Catalogue Order. Only published projects with inclusion ON are downloadable. Ordered projects appear first in ascending order; projects without an order follow newest first. Existing projects default to inclusion OFF until saved with the switch ON.

Catalogue controls are stored in the existing `portfolio_projects.content` JSON alongside the project's other fields; no separate catalogue list or database migration is needed. Public cards, detail pages and PDF generation all use those records.

Configure the logo and actual contact details in **Website Settings**, including the Website URL under Contact. Downloads use saved settings and omit blank contacts. Uploaded project images are recommended; remote images must permit cross-origin access for PDF export. The PDF library and document generation load only after a download click.

## Portfolio recordings

Owner-provided screenshots and MP4 recordings live in `public/projects/`. `scripts/import-portfolio-media.ts` pairs the supplied filenames and creates missing projects as drafts under the inactive **Category Pending** category. It preserves existing projects and only fills missing recording links. Re-run with `node --env-file-if-exists=.env --import tsx scripts/import-portfolio-media.ts`.

Review imported drafts in **Admin > Portfolio**, supply the correct category, live Website URL, service and short description, then publish. The eye icon previews draft case studies, including their video. Recordings are editable under **Media > Showcase Video URL**. Videos appear in the case study preview section with playback controls; portfolio cards retain their screenshot layout.

Rent for Health is the final name of the project previously labelled Sahyadri Surgical. Its screenshot is `Rent For health.png` and its recording is `rent for health.mp4`; both belong to the single `rent-for-health` project.
