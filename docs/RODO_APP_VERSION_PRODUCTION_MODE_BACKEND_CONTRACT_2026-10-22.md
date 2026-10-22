# RODO — Remote app production flag (2026-10-22)

## Purpose

The dashboard's **App Versions → Production Mode** toggle configures the **installed mobile app version**. It does **not** change the admin dashboard's API host, switch production databases, or convert any stored billing amounts.

- `isProduction: true`: mobile **displays SYP** (`ل.س`).
- `isProduction: false`: mobile **displays USD** (`$`).
- **Missing/nonboolean flag, 404, or version API failure**: mobile falls back to **SYP**, avoiding an incorrect USD display in production.

## Backend required to make the toggle functional

Persist `isProduction: boolean` on each `AppVersion` record, separately from `isVisible`, `needToUpdate`, and `forceUpdate`.

### 1. POST `/api/AppVersions` (Admin-only)

Accept `isProduction` (required boolean for new dashboard requests), plus existing version/update flags and links:

```json
{
  "version": "1.0.0",
  "needToUpdate": false,
  "forceUpdate": false,
  "isVisible": true,
  "isProduction": true,
  "googlePlayLink": "",
  "appStoreLink": "",
  "websiteLink": ""
}
```

### 2. PATCH `/api/AppVersions/{version}` (Admin-only)

Accept and persist `isProduction: boolean` alongside existing fields, without changing the version identifier.

### 3. GET `/api/AppVersions/{version}` (readable by logged-out mobile clients)

Always return the **persisted boolean** field. Example:

```json
{
  "id": "<server-generated-id>",
  "version": "1.0.0",
  "needToUpdate": false,
  "forceUpdate": false,
  "isVisible": true,
  "isProduction": false,
  "googlePlayLink": "",
  "appStoreLink": "",
  "websiteLink": "",
  "createdAt": "2026-10-22T00:00:00Z"
}
```

The existing apps accept `IsProduction` on GET for backward compatibility, but standardize **camelCase `isProduction`**. Do not place it only in POST/PATCH models or omit it from GET.

**Migration**: existing versions should default to `isProduction: true` (SYP) unless explicitly configured otherwise. `false` is an intentional admin choice.

## Dashboard behavior

The editor sends the flag with POST/PATCH, then fetches GET for the *same version* and checks the returned boolean. It **does not claim success** if the backend omitted, ignored, or returned the wrong value. A POST may still have created the version before this warning; edit the resulting version rather than trying to create it again.

## Mobile behavior

The Expo app calls GET for its **installed** version (from `Constants.expoConfig?.version`), uses the version response for product display, and refreshes the version on foreground and at most a 5-minute periodic interval while the app is active.

Product list: use the backend's separate `prices.priceSyp` / `prices.priceUsd`; **do not fabricate USD amounts** from catalog prices.

Cart/order/quote: existing numeric ledger amounts stay in **SYP** for payment. When displaying USD equivalents, convert from the backend's read-only `GET /api/Options/currency` `usdToSypRate` (positive and finite). If the rate is not available to user/courier roles, show that display is unavailable; do not change cash, invoices, fee calculations or payload amounts.

Backend must grant read permission for the currency rate to the mobile roles that need dollar displays, **without granting write/update permission**.

## Verification checklist

- [ ] GET the exact installed version as an anonymous mobile client; verify `isProduction` present as boolean.
- [ ] POST new version with `isProduction=false`, GET it again, verify `false`.
- [ ] PATCH version with `isProduction=true`, GET it again, verify `true`.
- [ ] Ensure `isVisible` and `forceUpdate` do not control this currency flag.
- [ ] Test mobile existing build with version flag true/false and a foreground refresh.
- [ ] Test product USD prices, cart/order USD display and cash SYP settlement.
- [ ] Confirm old records migrated to `true`, and unauthorized users cannot PATCH.

## Deployment

The backend repository and production Swagger were not accessible during this implementation, so these backend changes remain **unverified and must be implemented/deployed on the actual server** if absent. Frontend deployment alone cannot persist a field ignored by the API.
