# Four portfolio projects

The manifest in `content/portfolio/new-projects.json` defines Impact Infra India,
Reasonable Tools & Hardware Store, RMK Enterprises and Rushivan Agro. The importer
uses the existing authenticated admin API for categories, image uploads and project
creation. It preserves matching slugs, rejects possible name/website duplicates and
checks that all pre-existing projects remain unchanged.

## Categories and compatibility

The existing `portfolio_projects.category_id` remains the primary category.
Additional category IDs are stored in the existing `content` JSON's `category_ids`
array. No schema migration or existing-record backfill is required. The API validates
all IDs, prevents deletion of referenced secondary categories and saves categories
with the project transaction. Public filters and catalogues support both primary
and additional categories. Existing projects without this array continue to use
their primary category. Admin editors expose additional category checkboxes.

Impact Infra India uses Industrial and Construction; Reasonable Tools and RMK use
Industrial; Rushivan uses Agro Tourism.

## Images

All four WebP covers are 1408 × 1008 pixels. Impact Infra India, Reasonable Tools and
Rushivan covers are frames extracted from the owner's existing recordings in
`public/projects`. No standalone images for these four projects were found in the
folder. RMK's recording only showed its enquiry form, so its cover is a capture of
the real RMK website's product grid. Its homepage slideshow was blank during capture.
The existing recordings remain the showcase videos. The admin uploader persists
cover bytes in MySQL `media`/`media_blobs`, so production redeploys preserve them.

## Rollout

1. Verify typecheck, lint, build and the local portfolio/admin tests.
2. Push a normal commit to the existing `main` branch. Keep the current Hostinger
   Node/Nitro configuration, environment and domain unchanged.
3. Confirm the new admin UI exposes **Additional categories** before importing.
4. Run the explicit production import from this workspace:

   ```sh
   node scripts/add-portfolio-projects.mjs --origin=https://webakoof.com
   ```

   The importer uses ignored `.local/admin-login.json` credentials and signs out its
   verification session afterward. It writes a private snapshot of all portfolio
   records/categories under `.local/portfolio-rollout` before any content mutation.
   It is never part of the build or automatic application startup.
5. Verify the four cards, three category filters, images, outbound links and admin
   records on the live site. Production mutation tests must not run there.

The import requires the updated multi-category API. Code deployment alone does not
insert these projects into production MySQL. If Hostinger does not auto-deploy the
connected branch, trigger deployment in hPanel before running the importer.
