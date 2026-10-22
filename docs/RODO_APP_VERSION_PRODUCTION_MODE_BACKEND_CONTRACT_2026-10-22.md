# RODO — App version update and download contract (revised 2026-10-22)

> **Supersedes the earlier `isProduction` proposal.** Currency is NOT controlled by AppVersions. The dashboard setting **Pricing & Exchange Rates → Product Display Currency** is authoritative.

## 1. Currency — independent of releases

- Admin sets `productDisplayCurrency: 'SYP' | 'USD' | 'TRY'` using `PUT /api/Options/currency`.
- Customer/courier/guest mobile app **reads** `GET /api/Options/currency`.
- Response should contain the selected currency plus `usdToSypRate` and `usdToTryRate`.
- Catalog displays each backend price from `prices.priceSyp`, `prices.priceUsd` or `prices.priceTry`, without making up figures.
- Cart/order monetary totals remain SYP for real checkout and accounting; USD/TRY equivalents are UI-only conversions from the published rates.
- If `GET /api/Options/currency` is inaccessible to anonymous/customer/courier users, the frontend cannot reliably apply the global setting. **Backend must allow read-only access** without opening `PUT` to non-admin roles.
- On API failure or unknown currency, mobile falls back to SYP.

## 2. AppVersions — version-specific update policy

The dashboard **App Versions** form can POST, GET by exact version, and PATCH. It does not fabricate an all-versions list because the current backend contract has no list endpoint.

**GET /api/AppVersions/{installedVersion}** must return, for logged-out and authenticated mobile clients:

```json
{
  "id": "server-id",
  "version": "1.0.0",
  "needToUpdate": true,
  "forceUpdate": false,
  "isVisible": true,
  "googlePlayLink": "",
  "appStoreLink": "",
  "websiteLink": "https://rodo.sy/download/rodo.apk",
  "createdAt": "2026-10-22T00:00:00Z"
}
```

- `isVisible=false`: no update prompt.
- `needToUpdate=false` and `forceUpdate=false`: no prompt.
- `needToUpdate=true`, `forceUpdate=false`: optional, dismissible.
- `forceUpdate=true`: mandatory only when a usable platform download link exists. Protect against misconfigured forced updates that trap users.
- `googlePlayLink`: Play Store link when published.
- `appStoreLink`: App Store link when published.
- `websiteLink`: HTTPS fallback, including prerelease Android APK/approved distribution page. An `.apk` is not installable on iOS; provide an iOS-compatible link when distributing iOS versions.
- Mobile checks the **installed** version, not an imagined newest release. To notify installed version `1.0.0`, configure that record's flags and links.
- Dashboard reads back GET after POST/PATCH and verifies all supported update fields/links to avoid false success.

**No deployment to Play/App Store is required** for prerelease Android tests if the HTTPS `websiteLink` points to a real downloadable signed APK. iOS needs TestFlight or a valid Apple distribution mechanism.

## 3. Scenarios to verify

1. Admin changes global display currency from SYP → USD → TRY; mobile catalog and totals follow on refetch/foreground.
2. Dashboard saves update settings; GET for installed version returns same flags and URLs.
3. Optional update shows a working link and a "Later" action.
4. Forced update with a working platform link blocks ordinary navigation until app is updated.
5. No usable platform link: app must NOT trap users; dashboard should validate the configuration.
6. Before store publication, Android can open a real HTTPS APK via `websiteLink`.
7. iPhone must not be sent an Android APK; use App Store or iOS-compatible website link.
8. GET 404/error: do not invent an update or falsely switch money currency.

**Deployment status**: This file is the frontend/backend API contract. The backend repository/server response could not be verified from the current runtime, so actual read permissions and persisted values require a live API test.
