# Portfolio availability

The existing TanStack Start routes, MySQL CMS, `/uploads/...` storage and PDF generator are retained. Availability is independent of draft/published status. Cards always open `/portfolio/<slug>`. Only Live projects expose external website links in detail pages and PDF catalogues. Unavailable published projects remain indexable and included in catalogues when selected.

## Admin workflow

In **Project Details**, choose Website Availability. Live is the initial legacy default, not evidence of a verified website. The original URL stays in Basic Info. **Check Website Status** checks the current URL without changing availability or saving the form. Review the result, choose the public status and click **Save Project**. Last checked time and result are saved with the project; notes and check metadata are excluded from public content and catalogue responses. The server stamps Website Status Last Updated when availability changes. Changing the URL clears the previous check result.

Overview, challenge, approach, solution, result, features, technology and SEO content remain stored. Optional approach editing is expandable. Earlier requested presentation changes are retained. Optional desktop/mobile screenshots and gallery uploads are under **Media → Optional screenshots and gallery** to keep the editor compact.

## Storage and existing media

Uploads use the existing `media` / `media_blobs` tables and `/uploads/...` route, independently of client hosting. No files are deleted or copied from client websites. New external media URLs are rejected by the project save API; existing media URLs are grandfathered so saving a project never requires deleting existing artwork. Existing external media must be reviewed and replaced with authorized uploaded files manually; the application does not scrape or automatically migrate them. Back up the database including media blobs using the existing operations procedure.

## Migration and deployment

No new columns or schema migration are required: fields live in `portfolio_projects.content`. Existing records work immediately using the Live fallback. The optional, idempotent `database/migrations/20261024-portfolio-availability.sql` only backfills missing availability keys; it creates no successful-check timestamps and preserves other JSON content. **It has not been run.** Review and obtain production approval before running it. No published records need to be re-saved.

Deploy the reviewed code through the project's existing deployment process after approval. Keep the existing CMS/MySQL environment and persistent media database configured; no new credentials are required. The checker needs a Node.js runtime with outbound DNS and HTTP/HTTPS access. Test a known public website from the deployed admin before relying on check results. Subsequent admin status changes save directly to MySQL and are reflected by fresh frontend requests without a code push; refresh an already-open page to load updates.

No deployment, production data modification or scheduled job is performed by this change. Weekly checks are intentionally omitted because no existing background-job configuration was found; checks are manual and admin-only.

## Check safeguards and limits

The admin API requires authentication, same-origin requests and a rate limit. Checks allow HTTP/HTTPS on ports 80/443, validate all resolved IP addresses, pin a validated address to the socket, validate every redirect, cap redirects at three and enforce a 12-second total timeout. Private, loopback, link-local, reserved and IPv4-mapped IPv6 destinations are blocked. TLS certificate verification stays enabled. Responses are not downloaded or rendered; HEAD falls back to GET only for 405/501, and the response stream is closed at headers.

A response or failure cannot prove domain expiry, ownership, content correctness or permanent availability. DNS, SSL and connection failures are admin review results only and never change the public status automatically. Safeguards follow the [OWASP SSRF prevention guidance](https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html).

## Verification

Run `npm run typecheck`, `npm run build`, and `npx playwright test tests/website-check.spec.ts tests/portfolio-availability.spec.ts tests/portfolio-catalogue.spec.ts --workers=1`.

The browser flow test requires the existing local `.local/admin-login.json` credentials and a local MySQL-backed dev server. It creates one isolated project, verifies availability changes, private-data exclusion, media, SEO, sitemap and PDF links, then removes that fixture and compares the original records. It refuses to run this fixture against a non-local URL. Security tests mock external responses and cover unsafe destinations, redirects, DNS/TLS failures, HEAD fallback and timeout handling.
