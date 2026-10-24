# Portfolio availability

The existing TanStack Start routes, MySQL CMS, `/uploads/...` storage and PDF generator are retained. Availability is independent of draft/published status. Cards always open `/portfolio/<slug>`. External links appear only when the manual status is Live and automatic monitoring has not confirmed an outage. Unavailable published projects remain indexable and included in catalogues when selected.

## Admin workflow

In **Project Details**, choose Website Availability. Live is the initial legacy default, not evidence of a verified website. The original URL stays in Basic Info. **Check Website Status** checks the current URL without changing availability or saving the form. Review the result, choose the public status and click **Save Project**. Last checked time and result are saved with the project; notes and check metadata are excluded from public content and catalogue responses. The server stamps Website Status Last Updated when availability changes. Changing the URL clears the previous check result.

Overview, challenge, approach, solution, result, features, technology and SEO content remain stored. Optional approach editing is expandable. Earlier requested presentation changes are retained. Optional desktop/mobile screenshots and gallery uploads are under **Media → Optional screenshots and gallery** to keep the editor compact.

## Automatic monitoring

Monitoring is enabled by default for published projects with a website URL and manual status Live. No project needs to be re-saved to opt in. In **Project Details**, the automatic-monitoring checkbox can disable automatic notices for a project. Selecting another manual status overrides automation; automatic recovery never changes an administrator's Domain Expired/Permanently Offline choice.

The persistent Hostinger Node process starts a background worker after its first request. The worker wakes every minute, checks due projects with at most two concurrent requests, and schedules each project's next check at least 15 minutes later. Three consecutive failures suppress the external link and show the existing unavailable notice. Two consecutive successful checks restore the link. A single failure never hides a project link. HTTP 401/403/407/429 and blocked destinations are inconclusive: they reset confirmation counters without changing the last confirmed public state. No result automatically asserts domain expiry.

Check history, counters, next-due time and leases live in a separate `portfolio_website_checks` table. Checks never rewrite `portfolio_projects.content`, original URLs, media, publication flags or timestamps. Database leases prevent overlapping app processes from counting the same observation twice. Results arriving after a URL/status/monitoring-setting change are discarded. Saving those changes resets the old monitoring row. Other admin edits preserve automatic state. Internal pages and PDF catalogues use the same confirmed automatic state; detailed results remain admin-only.

Checks continue while the Node service is running, including between visitor requests. Downtime, suspension or process restarts can delay checks; persisted due times and counters survive restarts. Due checks resume on the next running instance. The worker is deliberately disabled in development and Vercel/serverless mirrors, where an in-process timer cannot guarantee scheduling. `WEBSITE_MONITOR_ENABLED=false` disables the Hostinger worker globally. No external cron provider, new credential or browser-side polling is required for the persistent production host.

## Storage and existing media

Uploads use the existing `media` / `media_blobs` tables and `/uploads/...` route, independently of client hosting. No files are deleted or copied from client websites. New external media URLs are rejected by the project save API; existing media URLs are grandfathered so saving a project never requires deleting existing artwork. Existing external media must be reviewed and replaced with authorized uploaded files manually; the application does not scrape or automatically migrate them. Back up the database including media blobs using the existing operations procedure.

## Migration and deployment

Existing project columns and records are unchanged. Manual fields live in `portfolio_projects.content`; automatic history uses the additive table in `database/migrations/20261024-automatic-website-monitoring.sql`, also included in fresh setup schema. The production worker runs the same idempotent `CREATE TABLE IF NOT EXISTS` before its first cycle; the database user needs CREATE permission for that first run. If provisioning separately, apply only this additive table SQL to the existing database. Never run a seed or import as part of the release.

The older `20261024-portfolio-availability.sql` backfill remains optional and is not needed for automatic monitoring. Initial Live/unknown values are not successful verification. No existing project must be re-saved or overwritten.

Deploy the reviewed code through the project's existing deployment process after approval. Keep the existing CMS/MySQL environment and persistent media database configured; no new credentials are required. The checker needs a Node.js runtime with outbound DNS and HTTP/HTTPS access. Test a known public website from the deployed admin before relying on check results. Subsequent admin status changes save directly to MySQL and are reflected by fresh frontend requests without a code push; refresh an already-open page to load updates.

After a production release, authenticate and read `/api/cms/website-monitoring`. Confirm `enabled` and `started` are true, `lastError` is null, and `lastCycleAt` advances. Add `?project=<id>` to inspect a project's automatic check history. The admin editor shows this same information. Do not expose this endpoint publicly or run fixture tests on production. If CREATE permission is missing, the site keeps serving its original manual/default state, the worker retries and the admin diagnostic displays an error; provision the additive table before calling monitoring active.

## Check safeguards and limits

The admin API requires authentication, same-origin requests and a rate limit. Checks allow HTTP/HTTPS on ports 80/443, validate all resolved IP addresses, pin a validated address to the socket, validate every redirect, cap redirects at three and enforce a 12-second total timeout. Private, loopback, link-local, reserved and IPv4-mapped IPv6 destinations are blocked. TLS certificate verification stays enabled. Responses are not downloaded or rendered; HEAD falls back to GET only for 405/501, and the response stream is closed at headers.

A response or failure cannot prove domain expiry, ownership, content correctness or permanent availability. Parking pages that return HTTP 200 may look available to an HTTP availability probe. Repeated DNS, SSL and connection failures can trigger only the generic temporary-unavailability notice, never Domain Expired or Permanently Offline. Manual checks still do not count toward automatic failure/recovery thresholds. Safeguards follow the [OWASP SSRF prevention guidance](https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html).

## Verification

Run `npm run typecheck`, `npm run build`, and `npx playwright test tests/automatic-website-monitoring.spec.ts tests/website-check.spec.ts tests/portfolio-availability.spec.ts tests/portfolio-catalogue.spec.ts --workers=1`.

The browser flow test requires the existing local `.local/admin-login.json` credentials and a local MySQL-backed dev server. It creates one isolated project, verifies availability changes, private-data exclusion, media, SEO, sitemap and PDF links, then removes that fixture and compares the original records. It refuses to run this fixture against a non-local URL. Security tests mock external responses and cover unsafe destinations, redirects, DNS/TLS failures, HEAD fallback and timeout handling.

Automatic-monitoring tests use the local `.env` database only and simulated external responses. They verify thresholds, next-due gating, overlap leases, stale-form preservation, URL-change races, opt-out, manual overrides, public/PDF behavior and unchanged source content/timestamps. They do not wait 45 minutes or probe real client websites. Set `WEBSITE_MONITOR_ENABLED=false` when smoke-testing a local production build unless real monitoring of that development dataset is intended.
