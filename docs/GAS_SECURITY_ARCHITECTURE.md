# GAS™ MVP — Security Architecture
**Version:** 1.0.0 | **Date:** 2026-09-07

---

## 1. Security Principles

1. **Defense in depth** — multiple layers; no single point of failure
2. **Least privilege** — each component gets only the access it needs
3. **Never trust client** — all critical logic server-side
4. **Secrets never in code** — environment variables only
5. **Payment verification server-side** — never from frontend status alone
6. **Audit everything** — log sensitive actions

---

## 2. Authentication

| Mechanism | Implementation |
|-----------|---------------|
| Password hashing | bcrypt with salt rounds ≥ 12 |
| Session management | NextAuth.js v5 — HTTP-only, Secure, SameSite=Strict cookies |
| JWT secret | Strong random secret in .env (min 32 chars) |
| Admin auth | Separate credential flow; admin flag in database |
| Password reset | One-time token (UUID), 1-hour expiry, single-use |
| Email verification | One-time token, 24-hour expiry |

### NEVER:
- Store plain-text passwords
- Expose session tokens in URLs
- Accept user-claimed roles from frontend

---

## 3. Authorization (RBAC)

| Role | Access Level |
|------|-------------|
| PUBLIC | Home, product listing, referral tracking (cookie) |
| USER | Everything Public + user dashboard, order, referral, contribute, recognition |
| ADMIN | Everything + admin panel, user management, commission approval |

### Implementation:
```typescript
// middleware.ts — Next.js Middleware
// Protects /admin/* and /api/admin/* routes
// Redirects unauthenticated users to /login

// Server-side (every API route):
const session = await getServerSession(authOptions)
if (!session) return 401
if (requiredRole === 'ADMIN' && session.user.role !== 'ADMIN') return 403
```

---

## 4. Input Validation

- All API inputs validated via **Zod** schemas before processing
- Validation errors returned as 400 with field details
- Never pass raw user input to Prisma queries (ORM parameterization)
- Sanitize text fields before storage (strip HTML/scripts)

---

## 5. Payment Security

| Requirement | Implementation |
|-------------|---------------|
| Server-side verification | Razorpay HMAC-SHA256 signature verification |
| Webhook verification | Razorpay webhook secret signature validation |
| No frontend trust | Payment status never determined solely by client |
| Idempotency | Webhook handler is idempotent (duplicate events ignored) |
| Secret storage | Razorpay key/secret in .env only |
| Test vs Live | Separate .env keys for test and production |

```typescript
// Payment verification (server-side only):
const body = razorpayOrderId + "|" + razorpayPaymentId
const expectedSignature = crypto
  .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
  .update(body)
  .digest("hex")
if (expectedSignature !== razorpaySignature) throw new Error("Invalid signature")
```

---

## 6. Referral Fraud Prevention

| Attack | Detection | Action |
|--------|-----------|--------|
| Self-referral | referrerId === referredId check | Flag + reject commission |
| Duplicate accounts | Unique email + mobile constraints | Block registration |
| IP-based farming | Log IP per referral; flag multiple from same IP | Flag for manual review |
| Immediate buy-refer abuse | Configurable validation period before commission approved | Hold in PENDING |
| Commission on cancelled order | Webhook/status watcher | Reverse commission |

---

## 7. Rate Limiting

Implemented via **next-rate-limit** or custom middleware using in-memory store (or Redis in V2):

| Endpoint | Limit | Window |
|----------|-------|--------|
| /api/auth/register | 5 requests | 1 hour / IP |
| /api/auth (login) | 10 requests | 1 hour / IP |
| /api/auth/forgot-password | 3 requests | 1 hour / IP |
| /api/referrals/track | 30 requests | 1 hour / IP |
| General user API | 100 requests | 1 minute / user |
| Admin API | 200 requests | 1 minute / admin |
| Public product API | 60 requests | 1 minute / IP |

---

## 8. Environment Variables

All secrets stored in `.env.local` (gitignored). NEVER commit `.env.local`.

```bash
# .env.example (committed — no secrets)
DATABASE_URL=mysql://user:password@localhost:3306/gas_mvp
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=                    # Generate: openssl rand -base64 32
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
SMTP_FROM=
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_RAZORPAY_KEY_ID=       # Only public key exposed to frontend
```

---

## 9. HTTPS

- **Development:** HTTP on localhost (acceptable)
- **Staging/Production:** HTTPS mandatory
- TLS certificate: Let's Encrypt (free) via Certbot or Cloudflare proxy
- HSTS header enabled in production

---

## 10. HTTP Security Headers

Applied via `next.config.js`:

```javascript
headers: [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Content-Security-Policy', value: "..." },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
]
```

---

## 11. Database Security

| Measure | Detail |
|---------|--------|
| Connection | Prisma connection pooling; credentials in .env |
| Access | DB user has only SELECT/INSERT/UPDATE/DELETE on gas_mvp |
| No root | App never connects as root |
| Parameterized queries | Prisma ORM — no raw SQL unless absolutely necessary |
| Backups | Daily mysqldump; stored securely |
| MariaDB binding | Bind to 127.0.0.1 only (not 0.0.0.0) |

---

## 12. Audit Logging

Audit log captures:
- User registration
- Login attempts (success + failure)
- Profile changes
- Order creation
- Payment events
- Referral events
- Commission status changes
- Contribution submit/approve/reject
- Admin actions (status changes, suspensions, approvals)
- Flagged/suspicious events

```typescript
// ActivityLog model captures:
// userId, event, entityType, entityId, metadata, ipAddress, userAgent, createdAt
```

---

## 13. Credential Exposure Rules

| Item | Rule |
|------|------|
| Passwords | NEVER expose; bcrypt only |
| Razorpay secret | NEVER to frontend; server-side only |
| JWT secret | NEVER to frontend; .env only |
| SMTP password | NEVER to frontend; .env only |
| Database URL | NEVER to frontend; .env only |
| Razorpay KEY_ID | May be exposed (NEXT_PUBLIC_) — it is public by design |

---

## 14. Dependency Security

- Run `npm audit` before each release
- Keep dependencies updated with `npm update`
- Use `npm ci` in CI/CD for reproducible builds
- Pin major versions in package.json

---

## 15. Known Risks (MVP Accepted)

| Risk | Severity | Mitigation |
|------|----------|-----------|
| No Redis rate limiting (in-memory) | Low | Acceptable at MVP scale; upgrade in V2 |
| Single server — no redundancy | Medium | Daily backup; acceptable for MVP |
| MariaDB not PostgreSQL | Low | Prisma abstraction; migrate in V2 |
| No 2FA | Low | Not in MVP scope; add in V2 |
| File uploads deferred | N/A | Reduces attack surface for MVP |
