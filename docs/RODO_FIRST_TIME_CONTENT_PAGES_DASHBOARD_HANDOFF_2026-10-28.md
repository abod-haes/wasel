# RODO / WASEL — First-time Content Pages setup (dashboard + mobile)

Based on the 2026-10-28 verified frontend/backend API contract.

## Backend (already implemented)

- Authenticated Admin / SuperAdmin: `GET /api/content-pages` returns the configured pages array (possibly `[]`).
- Authenticated Admin / SuperAdmin: `PUT /api/content-pages/{privacy|help|support}`, JSON `{"html":"<p>Approved text...</p>"}`, creates/updates and immediately publishes. Use returned, sanitized HTML.
- Public anonymous: `GET /api/content-pages/{slug}` returns JSON `{slug,html,updatedAt}` or `404 {"message":"Content page not found."}` while unconfigured.
- Optional DELETE not implemented in the dashboard to prevent accidental loss; there is no POST or separate publish endpoint.

## Operator steps

1. Sign in to **RODO Dashboard** as Admin / SuperAdmin.
2. Open **Settings → Content Pages** (`/settings/content-pages`).
3. Confirm three fixed rows: **Privacy**, **Help**, **Support**. On a fresh backend they are all **Not configured**.
4. Obtain official approved HTML for each page from the business/legal owner. There is **no automatic placeholder policy**.
5. Paste into the HTML textarea. Preview safely, then **Save**. Successful PUT updates the editor with the server's sanitized response. Repeat per slug.
6. Verify anonymous public GET for each slug returns HTTP 200. If a slug still returns 404, it is not configured.
7. Open the RODO mobile app's Profile → Privacy / Help / Support. The mobile client uses GET only, never admin JWT, and shows a friendly unavailable state until configured.
8. Verify Arabic formatting, safe HTTPS links, 401/403 admin authorization, 400 input validation, and that failed saves retain the draft.

## Deployment considerations

- Deploy dashboard changes before asking an administrator to configure pages.
- Do not consider the first-time setup complete until approved content is saved to production for all three slugs.
- The RODO marketing/store policy pages generated as static HTML in `scripts/generate-store-pages.mjs` remain a **separate crawlable-store document**. They are intentionally not overwritten during first-time CMS setup. The business must ensure their live content and public URLs are consistent with the approved policy before Play/App Store submission.
- The deployed backend must be compatible with the provided contract and operator's Admin JWT. This frontend PR does not create production records.
