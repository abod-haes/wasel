# RODO dashboard – Google Maps for Market accounts (16 October 2026)

Market/supermarket accounts in **Users → Add user / Edit user** store `latitude`, `longitude` and the human-readable `location` through the **existing** Users create/update APIs (no backend migration). Their Google Maps picker supports:
- Open at an existing market's saved point; otherwise show Aleppo as an **unselected** starting view.
- Click the map or drag a marker to select the exact shop/pickup location.
- Search an address via Google Geocoding, or choose the device's current GPS location (browser permission, HTTPS/localhost).
- Automatically populate the location label when reverse geocoding succeeds; allow manual Arabic location details if reverse geocoding is unavailable.
- Require a selected point **and** a descriptive address before confirming, and preserve cancellation without modifying the user form.
- Reopening the editor shows existing coordinates and a draggable marker. Form submission uses existing User APIs for creation/update.

## Required Google Cloud / deployment setup

Google Maps **website key is different** from Google Maps native Android and iOS keys. Create another key in Google Cloud:
1. Enable **Maps JavaScript API** and **Geocoding API** in the **same Google Cloud project with billing enabled**.
2. Under **API restrictions**, allow these two APIs only.
3. Under **Application restrictions**, choose **Websites** and allow the **actual dashboard site origins**, e.g. `https://YOUR-RODO-DASHBOARD-DOMAIN/*`, `https://YOUR-PREVIEW-DOMAIN/*` and `http://localhost:5173/*` for development.
4. Configure `GOOGLE_MAPS_BROWSER_API_KEY` in **Vercel/dashboard deployment environment variables** (or local `.env.local`), then **rebuild/redeploy**. Variables beginning `VITE_` are exposed to all browser visitors: restriction by allowed HTTP referrers and API scopes is mandatory; do not use an unrestricted, Android or iOS key.
5. Set conservative Google Maps quotas/budget alerts. Map loads and geocoding are billed separately. Google Geocoding failures still permit selecting a point and entering the label manually.

## QA / validation

- Add a Market role user: select map point in Aleppo, enter/confirm descriptive address and save, reload and verify backend fields.
- Edit the same Market user: marker must start at saved coordinates, move marker, confirm, save, reload and verify coordinates updated.
- Test current-location denied/granted, empty search, unrecognized place, Google APIs disabled, missing key, dark theme, mobile browser and RTL.
- If maps say `RefererNotAllowedMapError`, correct the website restriction. If `ApiNotActivatedMapError`, enable the corresponding API.

The legacy `VITE_GOOGLE_MAPS_BROWSER_API_KEY` environment variable is also accepted. If both are set, `GOOGLE_MAPS_BROWSER_API_KEY` takes priority. Vite injects only the resolved browser key at build time; changes to Vercel environment variables require a **new deployment**. The Google Maps JavaScript API key is publicly visible to users by design: restrict it in Google Cloud to the dashboard's website origins and required APIs.
