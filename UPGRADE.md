# Webakoof multipage upgrade

## Run locally

Use Node.js 22.12+ and npm. Install with `npm ci`, then run `npm run dev` (the existing Lovable configuration uses port 8080). `npm run build` produces the SSR-capable Cloudflare/Nitro output used by this project. `npm run preview` previews that build.

This remains the existing React 19 / TanStack Start / Tailwind 4 project. No framework or routing replacement was introduced. Keep the server runtime when deploying: publishing only an arbitrary static directory will not serve server functions or inner routes correctly.

## Routes and content

- `/`, `/about`, `/services`, `/portfolio`, `/blog`, `/contact`
- Six service details under `/services/:slug`
- Three existing design concept case studies under `/portfolio/:slug`
- Three original editorial articles under `/blog/:slug`
- `/privacy-policy`, `/terms-and-conditions`
- Unknown routes and unknown slugs return the shared 404 view and HTTP 404.

TanStack generates `src/routeTree.gen.ts` from `src/routes/`; do not edit that generated file. Header/footer live in the root layout. The router retains native scroll restoration and browser history. Primary navigation uses route links; only article/legal tables of contents and the accessibility skip link use page anchors.

Shared data lives in `src/data/`. Page-specific compositions live under `src/components/`. Existing service/process/technology content is retained in `src/components/home/content.ts`. Existing UI primitives and error-reporting infrastructure remain available.

## Enquiry delivery

Copy `.env.example` to `.env` locally or set the corresponding environment variables in the deployment runtime:

- `VITE_SITE_URL`: verified public origin, used at build time for canonical and social metadata. The default is the existing Lovable app URL from README.
- `ENQUIRY_WEBHOOK_URL`: server-only HTTPS endpoint that accepts enquiry JSON. Return a 2xx response only when the enquiry has been accepted.
- `ENQUIRY_WEBHOOK_TOKEN`: optional server-only bearer credential.

The server validates fields, rejects the hidden spam field, enforces consent, and forwards to the configured endpoint with a 12-second timeout. Existing TanStack CSRF middleware remains active. No enquiry is stored in browser storage or logged by this implementation. Configure provider-side retention and abuse/rate controls for the destination as part of deployment.

Without a configured destination, the form explicitly says the brief was not sent and offers a local text download. Failed delivery retains entries for retry. Success is shown only after the destination accepts the request. Do not put credentials in any `VITE_` variable.

## Content required before public launch

The source project contains **no verified phone, email, WhatsApp recipient, street address, social accounts, client testimonials, or measured project outcomes**. These have not been invented. The contact page identifies unavailable details; the former recipient-less WhatsApp link and invented example metrics were removed.

Aurora Botanics, Vertex Health and Northstar Estates remain visibly labelled **design concepts**, consistent with the source project. Their technology direction and intended benefits are not presented as verified implementation or results. Replace the data with approved client work when available.

Legal pages have a complete reading layout and editable draft sections, but need business review, confirmed providers/retention/contact information and an effective date before being treated as final policies. Blog content is newly authored and ready for editorial review.

## Verification

- `npm run typecheck`
- `npm run lint` (the pre-existing UI library has Fast Refresh export warnings)
- `npm run build`
- Start the local server, then `npm test` using installed Google Chrome. Set `QA_BASE_URL` to check another local preview.

The browser suite checks all 20 published URLs at 320, 375, 390, 430, 768, 1024 and 1440 pixels: response status, one H1, global layout, unique titles, descriptions, canonical URLs, image files, visible-content bounds, and runtime errors. It also covers navigation, reload, history, scroll-to-top, mobile drawer, service FAQ, filters, 404s and form validation/failure/download. Delivery tests use a mock transport, so no enquiry is sent to an external service.

Local screenshots and traces are written to ignored `qa-artifacts/`. No site has been deployed or git history changed by this upgrade.

### Production preview compatibility

The preview command uses scripts/preview.mjs to serve .output/public and the generated Nitro worker. This avoids the upstream Vite preview assumption that the server entry is dist/server/server.js. The local adapter is for verification only; the Cloudflare deployment output is unchanged.
