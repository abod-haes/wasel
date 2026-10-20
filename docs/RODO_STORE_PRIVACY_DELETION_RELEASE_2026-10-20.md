# RODO — public privacy, support and account deletion release

2026-10-20

## Implementation

The dashboard hosts three **public, no-login, crawlable** pages via Vercel rewrites:

- `/privacy` → HTML privacy policy; now describes courier `Available` background location and after-pickup tracking separately.
- `/account-deletion` → HTML explanation plus a prominent link to `/account-deletion/submit`, a public React form for **one-time authenticated account deletion**.
- `/support` → HTML public support contact and deletion links.

The web form sends `POST /api/Auth/login` and then `DELETE /api/Users/me` over HTTPS. It does **not** store credentials/tokens in localStorage or cookies. The confirmation is displayed only when the server reports a successful deletion. The server may still need additional data-erasure implementation; receiving HTTP success is not evidence of purging every backend copy.

### Hosting prerequisites

1. Set `VITE_SUPPORT_EMAIL` to a **real monitored mailbox** on the dashboard Vercel production deployment. No fabricated support address is supplied. The generated public pages mark contact unconfigured when the variable is missing.
2. Deploy the latest dashboard main branch. `npm run build` now creates `dist/privacy.html`, `dist/account-deletion.html`, `dist/support.html`. Vercel's specific rewrites must precede the SPA fallback.
3. Open `https://<dashboard-domain>/privacy`, `/account-deletion`, `/account-deletion/submit`, and `/support` **from a logged-out browser**. Check the raw HTML response, not only a rendered client-side React screen. Inspect for the correct support email.
4. The backend must allow the production public web origin in CORS for `POST /api/Auth/login` and `DELETE /api/Users/me`. Do **not** use wildcard CORS with credentials. This form uses bearer auth without browser cookies.
5. Set the mobile **EAS production** `EXPO_PUBLIC_PRIVACY_POLICY_URL`, `EXPO_PUBLIC_ACCOUNT_DELETION_URL`, `EXPO_PUBLIC_SUPPORT_URL` to **verified live HTTPS URLs** on the chosen host and create a new production binary. Set the same links in Google Play Console and App Store Connect.
6. If using `rodo.sy` rather than the dashboard's Vercel domain, configure DNS/custom domain and verify HTTPS and routes before putting them in production environment variables.
7. Verify the operating legal entity / privacy controller, real support channel, actual financial retention periods and recipients (Google Maps, push infrastructure, couriers, merchants). These are operator/legal facts and were **not** invented in the policy.
8. An SPA shell or a link that loads but does not let users reach deletion is insufficient. Run the mobile repo `npm run store:links:check` with the actual production URLs once the public deployment is accessible.

### Must-test backend account erasure (not verified by frontend code)

Use a **disposable test account**, not a real customer:

- Create the account, addresses/favourites/device push token and a test order.
- Delete from the app and from the new web form in separate tests.
- Confirm deletion response has HTTP success and no `success:false`.
- Try `GET /api/Auth/me` with the former token and new login with the former credentials. Both must no longer grant access to the deleted account.
- Check backend database **without exposing personal customer data**: auth credentials/sessions, FCM/APNs device tokens, saved addresses, location history, photos and nonessential profile data are deleted or anonymized as specified; legally retained financial/order records are minimized and retained only for required periods.
- Reject/delete requests without valid authentication; handle active delivery, unsettled cash and pending order states explicitly. Repeating `DELETE` must not corrupt financial records. Log auditable results without recording plaintext credentials.
- Verify deletion works from the public domain (CORS/preflight), including mobile browsers. If the server merely soft-deactivates a user while preserving unnecessary personal data, this is still **not store compliant**.

## Restrictions

The RODO backend source and Vercel/Expo project controls were not present in the connected repositories. The dashboard `wasel` repo and mobile `wasel-mobile` repo are available, but backend erasure semantics and production DNS/variables require verified operator action. Do not submit to stores until these steps pass.
