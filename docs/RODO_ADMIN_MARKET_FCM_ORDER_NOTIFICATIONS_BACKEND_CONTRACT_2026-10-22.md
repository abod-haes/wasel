# RODO — Admin & Market order push notifications (backend handoff)

Date: 2026-10-22
Repositories: `abod-haes/wasel` dashboard; **backend requires a separate implementation**.

## Implemented in Dashboard

- Firebase web project: `wasel-prod` from owner-provided **public web configuration**.
- `public/firebase-messaging-sw.js`: FCM background notifications, safe same-origin order links.
- `src/features/push/browser-push.ts`: lazy Firebase JS SDK, web push permission on explicit button click, FCM token registration through a configured authenticated endpoint.
- `src/features/push/push-notifications-bridge.tsx`: listens to foreground notifications only for authenticated `Admin`, `SuperAdmin`, `Market` users, invalidates cached orders, shows toast.
- `NotificationsButton`: dedicated incoming-order inbox for admin and shops. **No fake unread count**. It is intentionally separate from the Admin-only `/notifications` page for sending broadcast/personalized messages.
- Incoming notification opens `/orders?search={orderId}`; the orders API must re-check permissions, so a notification NEVER grants access to another shop's order.
- Logout starts token revocation and clears local inbox when identity changes. Local inbox is not a durable substitute for server notification history.

## Two deployment settings still needed

1. **Firebase Web Push public VAPID key**, from Firebase Console -> Project settings -> Cloud Messaging -> Web Push certificates -> Generate key pair. Set in Vercel/deployment: `VITE_FIREBASE_VAPID_KEY=<PUBLIC_KEY>`. Do **not** copy web `apiKey` into this value.
2. **Authenticated backend registration API** (NOT present/verified in the current API contract). Implement endpoints and configure their paths in Vercel after deployment:

```dotenv
VITE_FCM_DEVICE_REGISTER_PATH=/api/Notifications/devices
VITE_FCM_DEVICE_UNREGISTER_PATH=/api/Notifications/devices
```

The example paths above are **a proposed contract, not claimed existing**. The dashboard intentionally does not send tokens until a path is explicitly configured.

### Proposed backend endpoint contract

```http
POST /api/Notifications/devices
Authorization: Bearer <JWT>
Content-Type: application/json

{
  "token": "<FCM_WEB_REGISTRATION_TOKEN>",
  "provider": "FCM",
  "platform": "Web"
}
```

```http
DELETE /api/Notifications/devices
Authorization: Bearer <JWT>
Content-Type: application/json

{ "token": "<FCM_WEB_REGISTRATION_TOKEN>" }
```

- Bind the FCM token to the **authenticated user ID from the JWT**, not a client-supplied `userId` or `role`.
- Upsert by token, moving ownership when a token is registered from a different authenticated session; retain `lastSeenAt` / `lastRegisteredAt` timestamp, optional browser/device details, and `isActive`.
- DELETE may remove only tokens belonging to the JWT user. Revoke subscriptions on logout/password revoke; expire stale and invalid tokens on FCM send errors.
- Ensure FCM Admin SDK/HTTP v1 server credentials are stored server-side only. **Never** ship them as `VITE_*`, in service workers, or in Git.
- On server authorization, `Market` must not be allowed to read/administer other markets' push recipients or orders.
- The browser will not subscribe if VAPID key or backend registration route is missing; the bell displays the missing dependency explicitly.

## Event routing and lifecycle

Backend must send **per-user FCM** messages when authoritative domain events happen, not when dashboard pages happen to be open.

| Domain event | Target users | FCM data.type | Expected action |
|---|---|---|---|
| New order confirmed / assigned to one or more shops | Each assigned `marketUserId` + authorized admins | `market_order_assigned` | Display "طلب جديد" to each assigned shop, order page refresh |
| Admin receives new order | Authorized Admin/SuperAdmin accounts | `order_created` | Notify admin/order board |
| Shop indicates products ready | Admin and delivery workflow recipients for that order | `market_order_ready` | Show "تم تجهيز الطلب" and update order status |
| Cancellation or reassignment | Only affected market/admin recipients | `order_status_changed` | Refresh scoped orders |

For multi-market orders, derive recipients from the order's actual `marketUserIds[]` / item ownership; do not send unrelated stores customer information.

Example Firebase HTTP v1 payload (server-side):

```json
{
  "message": {
    "token": "<SERVER_REGISTERED_TOKEN>",
    "notification": {
      "title": "طلب جديد في رودو",
      "body": "وصلك طلب جديد #910. راجع المنتجات وجهّزها."
    },
    "data": {
      "notificationId": "<UNIQUE_EVENT_ID>",
      "type": "market_order_assigned",
      "orderId": "<ACTUAL_ORDER_GUID>"
    },
    "webpush": {
      "fcm_options": {
        "link": "https://<ACTUAL_DASHBOARD_HOST>/orders"
      }
    }
  }
}
```

Use the actual HTTPS dashboard origin as `link`, and let the app generate the `?search=` deep link from `orderId`. Do not invent/store full admin/supplier account identifiers inside public URL query strings.

- FCM notification payload already produces background browser notifications; the service worker manually displays **data-only** messages only. Sending multiple notification messages for one event may result in duplicates; dedupe by event ID.
- Browser push requires HTTPS, browser permission and browser support. On unsupported browsers or denied permission, backend should still preserve important order statuses for retrieval.
- Protect repeated deliveries by a unique notification/event ID and idempotent sending.
- Use backend durable notification history (suggested `GET /api/Notifications/me` + `PATCH /api/Notifications/me/{id}/read`) if you require missed-alert history or unread badges across devices. **Current dashboard inbox only lists foreground events received during the active session**, not a durable server inbox.

## Required shop preparation action (not yet supported/confirmed)

The current dashboard's `Market` role can view scoped orders if backend authorizes them, but order mutation controls are admin-only; there is no verified market-ready API.

Propose:
```http
POST /api/Orders/{orderId}/markets/me/ready
Authorization: Bearer <Market JWT>
```

- Server must check the authenticated `Market` user owns products in this order and that the order is eligible for preparation.
- Record preparation state per `(orderId, marketUserId)` and `preparedAt`, **not only a single order-wide boolean** for multi-market orders.
- Response must include updated state so dashboard can show "جهّزت الطلب", disable repeated submissions and refetch.
- Emit `market_order_ready` to admins and the eligible delivery workflow; when all shops are ready, emit a distinct `order_ready` signal if needed by courier logic.
- Don't treat merely viewing an order as "prepared". Do not expose other stores' line items to one store.
- Finalize exact path/body/response with the backend before wiring the storefront action.

## Verification checklist

1. Generate public VAPID certificate and enable Cloud Messaging / FCM registration API in Firebase project.
2. Deploy proposed authenticated device registration endpoints on backend.
3. Add Vercel public env settings and redeploy dashboard.
4. Login as Admin; enable notifications via bell. Ensure browser grants permission and backend binds FCM token to admin user.
5. Login as Market in separate browser/profile; enable notifications. Verify token binds to market user.
6. Confirm an order assigned to that market; verify exactly that market and admin receive alerts, not unrelated shops.
7. Switch browser to background; test service worker notification and click-to-open.
8. Update market preparation state with agreed API; verify admin receives ready notification.
9. Logout/login with different accounts in same browser; ensure notifications are not delivered to the prior logged-out identity.
10. Verify Chrome desktop/Android and browser limitations (including iOS installed web app support where applicable).
11. Test FCM unavailable, duplicate message IDs, token changes, revoked permission, 401/403 server errors, and backend event retries.

## Operational readiness

**Frontend wiring is implemented**. Live end-to-end order pushes are **not proven** until VAPID, backend token registry, and domain-triggered Firebase sends are deployed/tested.
