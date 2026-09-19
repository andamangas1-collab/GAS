# GAS™ MVP — API Architecture
**Version:** 1.0.0 | **Date:** 2026-09-07 | **Protocol:** REST over HTTPS

---

## 1. API Design Principles

- All endpoints: `/api/v1/...`
- JSON request/response bodies
- Authentication: NextAuth.js JWT session (HTTP-only cookie)
- Authorization: Server-side role check on every protected route
- Validation: Zod schemas on all inputs
- Error format: `{ error: string, details?: object }`
- Success format: `{ data: object|array, meta?: object }`

---

## 2. Authentication Routes (`/api/auth`)

Handled by **NextAuth.js** internally.

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /api/auth/register | Register new user | Public |
| POST | /api/auth/[...nextauth] | Login / logout (NextAuth) | Public |
| POST | /api/auth/forgot-password | Send reset email | Public |
| POST | /api/auth/reset-password | Reset with token | Public |
| GET  | /api/auth/session | Get current session | Public |
| GET  | /api/auth/verify-email | Verify email token | Public |

---

## 3. User Routes (`/api/users`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET    | /api/users/me | Get current user + profile | User |
| PUT    | /api/users/me | Update profile | User |
| GET    | /api/users/me/dashboard | Dashboard summary | User |
| GET    | /api/users/me/activity | Activity timeline | User |
| GET    | /api/users | List all users (paginated) | Admin |
| GET    | /api/users/:id | Get user details | Admin |
| PUT    | /api/users/:id/status | Change user status | Admin |
| GET    | /api/users/:id/history | Full user history | Admin |

---

## 4. Product Routes (`/api/products`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET    | /api/products | List active products | Public |
| GET    | /api/products/:id | Get product detail | Public |
| POST   | /api/products | Create product | Admin |
| PUT    | /api/products/:id | Update product | Admin |
| DELETE | /api/products/:id | Delete / deactivate | Admin |

---

## 5. Offer / Campaign Routes (`/api/offers`, `/api/campaigns`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET    | /api/offers | List active offers/campaigns | Public |
| GET    | /api/offers/:id | Get offer detail | Public |
| POST   | /api/campaigns | Create campaign | Admin |
| PUT    | /api/campaigns/:id | Update campaign | Admin |
| POST   | /api/campaigns/:id/products | Add product to campaign | Admin |

---

## 6. Order Routes (`/api/orders`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST   | /api/orders | Create order (initiates payment) | User |
| GET    | /api/orders | User's order list | User |
| GET    | /api/orders/:id | Order detail | User |
| GET    | /api/orders (admin) | All orders (paginated) | Admin |
| PUT    | /api/orders/:id/status | Update order status | Admin |

---

## 7. Payment Routes (`/api/payments`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST   | /api/payments/create-order | Create Razorpay order | User |
| POST   | /api/payments/verify | Verify payment signature | User |
| POST   | /api/payments/webhook | Razorpay webhook (server-side) | Razorpay HMAC |
| GET    | /api/payments/:orderId | Payment status | User |

### Payment Flow:
```
User → POST /api/payments/create-order
     → Razorpay checkout (client-side)
     → POST /api/payments/verify (client sends signature)
     → Server verifies HMAC signature
     → Order status CONFIRMED
     → Referral qualification triggered
     → Commission calculation triggered
     → Notification sent

(Parallel) Razorpay → POST /api/payments/webhook
     → Server verifies webhook signature
     → Same flow as above (idempotent)
```

---

## 8. Referral Routes (`/api/referrals`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET    | /api/referrals/me | My referral code + link | User |
| GET    | /api/referrals/me/stats | My referral statistics | User |
| GET    | /api/referrals/me/list | My referred users list | User |
| POST   | /api/referrals/track | Track referral click (cookie) | Public |
| GET    | /api/referrals | All referrals (paginated) | Admin |
| GET    | /api/referrals/:id | Referral detail | Admin |
| PUT    | /api/referrals/:id/status | Manual status override | Admin |

### Referral Attribution Flow:
```
User clicks https://gas.domain/r/ABC123
→ GET /api/referrals/track?code=ABC123
→ Cookie set: gas_ref=ABC123 (30-day expiry)
→ User registers
→ Cookie read → referredBy = ABC123
→ Referral record created (REGISTERED)
→ User purchases
→ Referral → PURCHASED → QUALIFIED
→ Commission created (PENDING)
```

---

## 9. Commission Routes (`/api/commissions`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET    | /api/commissions/me | My commissions | User |
| GET    | /api/commissions/me/summary | Earnings summary | User |
| GET    | /api/commissions | All commissions | Admin |
| GET    | /api/commissions/:id | Commission detail | Admin |
| PUT    | /api/commissions/:id/approve | Approve commission | Admin |
| PUT    | /api/commissions/:id/reject | Reject commission | Admin |
| POST   | /api/commissions/rules | Create commission rule | Admin |
| GET    | /api/commissions/rules | List commission rules | Admin |
| PUT    | /api/commissions/rules/:id | Update rule | Admin |

---

## 10. Contribution Routes (`/api/contributions`) — V2V™

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST   | /api/contributions | Submit contribution | User |
| GET    | /api/contributions/me | My contributions | User |
| GET    | /api/contributions | All contributions | Admin |
| GET    | /api/contributions/:id | Contribution detail | Admin/User |
| PUT    | /api/contributions/:id/approve | Approve + award points | Admin |
| PUT    | /api/contributions/:id/reject | Reject | Admin |

---

## 11. Recognition Routes (`/api/recognition`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET    | /api/recognition/me | My points, level, badges | User |
| GET    | /api/recognition/levels | All levels config | Public |
| GET    | /api/recognition/badges | All badges | Public |
| POST   | /api/recognition/levels | Create level | Admin |
| PUT    | /api/recognition/levels/:id | Update level | Admin |
| POST   | /api/recognition/rules | Set point rules | Admin |
| GET    | /api/recognition/rules | Get point rules | Admin |

---

## 12. Notification Routes (`/api/notifications`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET    | /api/notifications | My notifications | User |
| PUT    | /api/notifications/:id/read | Mark as read | User |
| PUT    | /api/notifications/read-all | Mark all as read | User |
| DELETE | /api/notifications/:id | Delete notification | User |

---

## 13. Analytics Routes (`/api/analytics`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST   | /api/analytics/event | Log event (client-side) | User/Public |
| GET    | /api/analytics/dashboard | Dashboard metrics | Admin |
| GET    | /api/analytics/funnel | Conversion funnel | Admin |
| GET    | /api/analytics/events | Event log | Admin |

---

## 14. Admin Routes (`/api/admin`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET    | /api/admin/stats | System overview stats | Admin |
| GET    | /api/admin/audit-logs | Audit trail | Admin |
| POST   | /api/admin/seed | Seed initial data | Admin |

---

## 15. Error Codes

| HTTP Code | Meaning |
|-----------|---------|
| 200 | OK |
| 201 | Created |
| 400 | Bad Request / Validation Error |
| 401 | Unauthorized (not logged in) |
| 403 | Forbidden (wrong role) |
| 404 | Not Found |
| 409 | Conflict (duplicate) |
| 422 | Unprocessable Entity |
| 429 | Rate Limited |
| 500 | Internal Server Error |

---

## 16. Rate Limiting (MVP)

| Endpoint | Limit |
|----------|-------|
| /api/auth/register | 5/hour per IP |
| /api/auth (login) | 10/hour per IP |
| /api/auth/forgot-password | 3/hour per IP |
| /api/payments/webhook | Unlimited (Razorpay IPs only) |
| All other user APIs | 100/minute per user |
| Admin APIs | 200/minute per admin |

---

## 17. Response Envelope

```typescript
// Success
{
  data: T,
  meta?: {
    page?: number,
    limit?: number,
    total?: number,
    totalPages?: number
  }
}

// Error
{
  error: string,         // Human-readable message
  code?: string,         // Machine-readable code e.g. "SELF_REFERRAL"
  details?: object       // Zod validation errors, etc.
}
```
