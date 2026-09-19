# GAS™ MVP — Implementation Plan
**Version:** 1.0.0 | **Date:** 2026-09-07 | **Total Budget:** ₹1,40,000

---

## Phase Overview

```
Phase 0: Setup & Scaffold          (1-2 days)     ₹0 (infra only)
Phase 1: Auth + Profile            (3-5 days)     ₹12,000
Phase 2: Products / Offers         (3-4 days)     ₹15,000
Phase 3: Orders + Payments         (4-5 days)     ₹15,000
Phase 4: Referral Engine           (5-7 days)     ₹20,000
Phase 5: Commission Engine         (3-4 days)     ₹12,000
Phase 6: V2V Contribution          (3-4 days)     ₹12,000
Phase 7: Recognition Engine        (2-3 days)     ₹7,000
Phase 8: Admin Dashboard           (4-5 days)     ₹15,000
Phase 9: Notifications + Analytics (2-3 days)     ₹5,000
Phase 10: UI/UX Polish             (3-4 days)     ₹15,000
Phase 11: Testing + Deployment     (3-4 days)     ₹12,000
──────────────────────────────────────────────────────────
TOTAL                              ~36-50 days    ₹1,40,000
```

---

## Phase 0: Setup & Scaffold
**Duration:** 1-2 days | **Budget:** Pre-development

### Tasks:
1. Start MariaDB service in XAMPP
2. Create database: `gas_mvp`
3. Create database user with limited privileges
4. Fix `openssle` typo in XAMPP php.ini
5. Scaffold Next.js 14 project:
   ```bash
   npx create-next-app@latest . --typescript --tailwind --app --src-dir --import-alias "@/*"
   ```
6. Install core dependencies:
   ```bash
   npm install prisma @prisma/client next-auth@beta zod razorpay nodemailer
   npm install -D @types/nodemailer @types/bcryptjs bcryptjs
   npm install zustand @tanstack/react-query
   ```
7. Install shadcn/ui:
   ```bash
   npx shadcn@latest init
   ```
8. Initialize Prisma with MariaDB:
   ```bash
   npx prisma init --datasource-provider mysql
   ```
9. Create `.env.local` from `.env.example`
10. Write initial Prisma schema (all models)
11. Run first migration:
    ```bash
    npx prisma migrate dev --name init
    ```
12. Seed admin user and default data:
    ```bash
    npx prisma db seed
    ```
13. Set up `src/lib/prisma.ts` singleton
14. Configure `next.config.js` with security headers
15. Set up `src/middleware.ts` for route protection

### Deliverables:
- Running Next.js dev server on localhost:3000
- Connected MariaDB with all tables migrated
- shadcn/ui components available
- Route protection working

---

## Phase 1: Authentication + Profile
**Duration:** 3-5 days | **Budget:** ₹12,000

### Files to Create:
```
src/app/(auth)/register/page.tsx
src/app/(auth)/register/actions.ts
src/app/(auth)/login/page.tsx
src/app/(auth)/forgot-password/page.tsx
src/app/(auth)/reset-password/page.tsx
src/app/api/auth/[...nextauth]/route.ts
src/app/api/auth/register/route.ts
src/app/api/auth/forgot-password/route.ts
src/app/api/auth/reset-password/route.ts
src/app/api/users/me/route.ts
src/lib/auth.ts
src/lib/email.ts
src/components/auth/RegisterForm.tsx
src/components/auth/LoginForm.tsx
src/components/auth/ForgotPasswordForm.tsx
prisma/seed.ts
```

### Key Tasks:
1. Configure NextAuth.js (Credentials provider, JWT, MariaDB adapter)
2. Registration: email uniqueness, password hashing (bcrypt), referral code generation
3. Profile model: auto-create on registration
4. Login with credential validation
5. Forgot password: token email via Nodemailer
6. Session middleware: protect user and admin routes
7. Profile edit API
8. Referral code format: `GAS-XXXXXX` (6 alphanumeric chars, unique)

### Referral Code Generation:
```typescript
// lib/referral.ts
export function generateReferralCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = 'GAS-'
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code // e.g. GAS-A1B2C3
}
```

### Deliverables:
- User can register, log in, log out
- Password reset flow works via email
- Profile created on registration
- Sessions work (HTTP-only cookies)
- Protected routes redirect to login

---

## Phase 2: Products / Offers Module
**Duration:** 3-4 days | **Budget:** ₹15,000

### Files to Create:
```
src/app/(user)/offers/page.tsx
src/app/(user)/offers/[id]/page.tsx
src/app/(admin)/admin/products/page.tsx
src/app/(admin)/admin/products/new/page.tsx
src/app/(admin)/admin/products/[id]/page.tsx
src/app/api/products/route.ts
src/app/api/products/[id]/route.ts
src/app/api/campaigns/route.ts
src/components/offers/ProductCard.tsx
src/components/offers/ProductDetail.tsx
src/components/admin/ProductForm.tsx
```

### Key Tasks:
1. Product CRUD (admin only)
2. Product listing with category filter
3. Product detail page (SSR for SEO)
4. Product status management (DRAFT/ACTIVE/INACTIVE/EXPIRED)
5. Commission % or fixed amount per product
6. Campaign creation and product-campaign linking
7. Offer page shows active products with referral CTA

### Deliverables:
- Admin can create and manage products
- Users can browse and view offers
- Referral CTA visible on product page

---

## Phase 3: Orders + Payments
**Duration:** 4-5 days | **Budget:** ₹15,000

### Files to Create:
```
src/app/(user)/offers/[id]/checkout/page.tsx
src/app/api/orders/route.ts
src/app/api/orders/[id]/route.ts
src/app/api/payments/create-order/route.ts
src/app/api/payments/verify/route.ts
src/app/api/payments/webhook/route.ts
src/lib/razorpay.ts
src/components/offers/CheckoutButton.tsx
src/components/offers/PaymentModal.tsx
```

### Key Tasks:
1. Razorpay server-side order creation
2. Razorpay client-side checkout integration
3. HMAC-SHA256 signature verification (server-side)
4. Idempotent webhook handler
5. Order status management
6. On confirmed payment:
   - Create/confirm Order record
   - Trigger referral qualification check
   - Trigger commission calculation
   - Send order confirmation email
   - Log analytics event

### Payment Flow:
```
User clicks "Buy Now"
→ POST /api/payments/create-order (server creates Razorpay order)
→ Razorpay checkout popup
→ User pays
→ POST /api/payments/verify (server verifies signature)
→ Order CONFIRMED
→ [Referral + Commission triggered]
→ Confirmation page
```

### Deliverables:
- Working Razorpay payment flow (test mode)
- Server-side payment verification
- Orders recorded in database
- Referral + commission triggered post-payment

---

## Phase 4: Referral Engine
**Duration:** 5-7 days | **Budget:** ₹20,000

### Files to Create:
```
src/app/(user)/refer/page.tsx
src/app/api/referrals/route.ts
src/app/api/referrals/me/route.ts
src/app/api/referrals/track/route.ts
src/app/api/referrals/[id]/route.ts
src/lib/referral.ts
src/components/referral/ReferralDashboard.tsx
src/components/referral/ReferralLink.tsx
src/components/referral/ReferralStats.tsx
```

### Key Tasks:
1. Referral link: `https://domain.com/r/[referralCode]`
2. Route `/r/[code]` → sets cookie `gas_ref=CODE` → redirect to register
3. On registration: read `gas_ref` cookie → create Referral record
4. Self-referral detection:
   ```typescript
   if (referrer.id === newUser.id) flag as SELF_REFERRAL, reject commission
   ```
5. On confirmed order: find referral → mark PURCHASED → check QUALIFIED
6. Qualification = referrer is different person + order completed + not refunded
7. Referral dashboard: list of referred users, status, earnings
8. Admin referral management

### Deliverables:
- Full referral attribution chain works
- Self-referral blocked
- Cookie-based attribution survives across sessions
- Referral dashboard shows accurate data

---

## Phase 5: Commission Engine
**Duration:** 3-4 days | **Budget:** ₹12,000

### Files to Create:
```
src/app/(user)/dashboard/commissions/page.tsx
src/app/(admin)/admin/commissions/page.tsx
src/app/api/commissions/route.ts
src/app/api/commissions/me/route.ts
src/app/api/commissions/[id]/route.ts
src/app/api/commissions/rules/route.ts
src/lib/commission.ts
src/components/commission/CommissionTable.tsx
src/components/admin/CommissionRuleForm.tsx
```

### Key Tasks:
1. Commission calculation engine (reads CommissionRule):
   ```typescript
   // lib/commission.ts
   // Find applicable rule (product-specific or global)
   // Calculate: PERCENTAGE → (order.total * rule.value / 100)
   //            FIXED → rule.value
   // Create Commission record with PENDING status
   ```
2. Admin: approve / reject / mark paid workflow
3. Configurable validation period (default 30 days)
4. Commission reversal when order cancelled/refunded
5. Commission rules CRUD (admin)
6. User commission earnings summary

### Deliverables:
- Commission auto-calculated on referral qualification
- Admin can approve/reject/pay
- Configurable rules work (% and fixed)
- Reversal on refund works

---

## Phase 6: V2V™ Contribution Engine
**Duration:** 3-4 days | **Budget:** ₹12,000

### Files to Create:
```
src/app/(user)/contribute/page.tsx
src/app/(user)/contribute/new/page.tsx
src/app/(user)/contribute/[id]/page.tsx
src/app/(admin)/admin/contributions/page.tsx
src/app/api/contributions/route.ts
src/app/api/contributions/me/route.ts
src/app/api/contributions/[id]/route.ts
src/app/api/contributions/[id]/approve/route.ts
src/app/api/contributions/[id]/reject/route.ts
src/components/contribution/ContributionForm.tsx
src/components/contribution/ContributionList.tsx
src/components/admin/ContributionReview.tsx
```

### Key Tasks:
1. Contribution submission form (title, description, category)
2. Status workflow: SUBMITTED → UNDER_REVIEW → APPROVED/REJECTED
3. Admin review interface with approve/reject + note
4. On approval: award recognition points (per PointRule config)
5. Notification to user on status change

### Categories (V2V):
- IDEA
- FEEDBACK
- PRODUCT_IMPROVEMENT
- EDUCATIONAL_CONTENT
- COMMUNITY
- RESOURCE

### Deliverables:
- Users can submit contributions
- Admin can review, approve with points, or reject
- Points awarded on approval
- Notifications sent

---

## Phase 7: Recognition Engine
**Duration:** 2-3 days | **Budget:** ₹7,000

### Files to Create:
```
src/app/(user)/recognition/page.tsx
src/app/(admin)/admin/recognition/page.tsx
src/app/api/recognition/me/route.ts
src/app/api/recognition/levels/route.ts
src/app/api/recognition/rules/route.ts
src/lib/recognition.ts
src/components/recognition/PointsSummary.tsx
src/components/recognition/BadgeGrid.tsx
src/components/recognition/LevelProgress.tsx
src/components/recognition/ActivityTimeline.tsx
```

### Key Tasks:
1. Point award engine (called from: registration, purchase, referral, contribution)
2. Level calculation based on total points
3. Badge award on milestones
4. Activity timeline (sorted ActivityLog entries)
5. Admin: configure point rules and levels
6. User recognition page: points, level, badges, timeline

### Default Points:
| Action | Points |
|--------|--------|
| Registration | +5 |
| Profile complete | +10 |
| First purchase | +10 |
| Successful referral | +20 |
| Contribution approved | +25 |
| Idea approved | +50 |
| Learning complete | +10 |

### Default Levels:
| Level | Min Points |
|-------|-----------|
| Explorer | 0 |
| Contributor | 50 |
| Value Builder | 150 |
| Community Builder | 350 |
| GAS Champion | 700 |

### Deliverables:
- Points auto-awarded on qualifying actions
- Levels auto-calculated
- Badges awarded on milestones
- Timeline shows user journey
- Admin can reconfigure point values

---

## Phase 8: Admin Dashboard
**Duration:** 4-5 days | **Budget:** ₹15,000

### Files to Create:
```
src/app/(admin)/admin/dashboard/page.tsx
src/app/(admin)/admin/users/page.tsx
src/app/(admin)/admin/users/[id]/page.tsx
src/app/(admin)/admin/orders/page.tsx
src/app/(admin)/admin/analytics/page.tsx
src/app/(admin)/admin/campaigns/page.tsx
src/app/api/admin/stats/route.ts
src/components/admin/StatsCard.tsx
src/components/admin/DataTable.tsx
src/components/admin/UserDetail.tsx
src/components/layout/AdminNav.tsx
src/components/layout/AdminSidebar.tsx
```

### Key Tasks:
1. Admin layout (sidebar nav, header)
2. Dashboard: total users, orders, sales, referrals, commissions, contributions
3. User management: search, filter, view history, suspend/activate
4. Order management: list, filter by status, detail view
5. Campaign management
6. Analytics overview
7. Audit log view

### Deliverables:
- Admin can see system-wide metrics
- Admin can manage all entities
- Audit logs accessible

---

## Phase 9: Notifications + Analytics
**Duration:** 2-3 days | **Budget:** ₹5,000

### Files to Create:
```
src/app/api/notifications/route.ts
src/app/api/analytics/event/route.ts
src/app/api/analytics/dashboard/route.ts
src/components/notifications/NotificationBell.tsx
src/components/notifications/NotificationList.tsx
src/lib/analytics.ts
src/lib/email.ts (email templates)
```

### Key Tasks:
1. In-app notification bell (unread count badge)
2. Notification list dropdown
3. Mark read / mark all read
4. Email notifications via Nodemailer (templates for key events)
5. Client-side analytics event logging
6. Server-side event aggregation for admin dashboard

### Email Templates:
- Welcome / Registration
- Order Confirmation
- Commission Pending / Approved
- Contribution Approved / Rejected
- Badge Earned
- Password Reset

### Deliverables:
- In-app notifications working
- Email notifications sent for key events
- Analytics events logged and viewable in admin

---

## Phase 10: UI/UX Polish
**Duration:** 3-4 days | **Budget:** ₹15,000

### Tasks:
1. Responsive layout (mobile-first)
2. Landing/home page (GAS value proposition)
3. Consistent typography, colors, spacing (Tailwind theme)
4. Loading states, skeleton screens
5. Empty states for tables and lists
6. Toast notifications for user actions
7. Form validation UX (inline errors)
8. Navigation polish (user nav + admin nav)
9. Referral sharing UX (copy link, social share buttons)
10. Learn section placeholder (or basic content page)

---

## Phase 11: Testing + Deployment
**Duration:** 3-4 days | **Budget:** ₹12,000

### Tasks:
1. Unit tests for critical logic:
   - Commission calculation
   - Referral qualification
   - Self-referral detection
   - Payment verification
   - Point calculation
2. Integration tests for key API routes
3. End-to-end test: full user loop (register → purchase → refer → commission)
4. Security audit:
   - All admin routes protected
   - Payment verification working
   - No secrets in responses
5. Performance check:
   - Database query optimization
   - Image optimization (Next.js Image)
6. Production deployment:
   - VPS setup (Node.js, MariaDB or managed DB)
   - Environment variables configured
   - HTTPS + domain configured
   - PM2 or similar process manager
7. README.md with setup instructions

---

## File Count Summary

| Category | Approx Files |
|----------|-------------|
| App pages (user) | ~20 |
| App pages (admin) | ~15 |
| API routes | ~35 |
| Components | ~40 |
| Library modules | ~10 |
| Prisma schema + seed | ~2 |
| Config files | ~6 |
| Docs | ~6 |
| **TOTAL** | **~134 files** |

---

## Dependencies (package.json)

```json
{
  "dependencies": {
    "next": "^14.2.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "next-auth": "^5.0.0-beta",
    "@auth/prisma-adapter": "^2.0.0",
    "@prisma/client": "^5.18.0",
    "prisma": "^5.18.0",
    "zod": "^3.23.0",
    "bcryptjs": "^2.4.3",
    "razorpay": "^2.9.0",
    "nodemailer": "^6.9.0",
    "zustand": "^4.5.0",
    "@tanstack/react-query": "^5.0.0",
    "tailwindcss": "^3.4.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.4.0",
    "lucide-react": "^0.400.0",
    "@radix-ui/react-dialog": "^1.1.0",
    "@radix-ui/react-dropdown-menu": "^2.1.0",
    "@radix-ui/react-toast": "^1.2.0",
    "@radix-ui/react-tabs": "^1.1.0"
  },
  "devDependencies": {
    "typescript": "^5.5.0",
    "@types/node": "^20.0.0",
    "@types/react": "^18.3.0",
    "@types/bcryptjs": "^2.4.6",
    "@types/nodemailer": "^6.4.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0"
  }
}
```

---

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| Razorpay integration complexity | Medium | High | Use test mode extensively; follow official docs |
| MariaDB vs Next.js connection handling | Low | Medium | Prisma connection pooling + singleton pattern |
| Budget overrun on referral engine | Medium | High | Scope strictly to single-level; no tree structure |
| XAMPP openssle warning causing issues | Low | Low | Fix php.ini; not needed for Node.js stack |
| Email deliverability | Medium | Medium | Use reputable SMTP (Gmail/SES); test thoroughly |
| MariaDB service reliability | Low | High | Configure auto-start; daily backups |
| Session handling in Next.js App Router | Medium | Medium | Follow NextAuth v5 App Router docs strictly |

---

## Immediate Next Steps (After This Plan)

1. **Start MariaDB** in XAMPP Control Panel
2. **Create database** `gas_mvp` with dedicated user
3. **Run scaffold command:** `npx create-next-app@latest . --typescript --tailwind --app --src-dir`
4. **Install dependencies**
5. **Initialize Prisma** and write schema
6. **Run first migration**
7. **Begin Phase 1: Auth**

> Await next instruction before proceeding.
