# GAS™ MVP — Architecture Document
**Version:** 1.0.0 | **Date:** 2026-09-07 | **Status:** APPROVED FOR IMPLEMENTATION

---

## 1. Executive Summary

GAS™ (Grand Affiliate System) is a lean affiliate commerce platform built around the **V2V™ (Value-to-Value) Engine**.

**Primary Product Loop:**
```
REGISTER → LEARN → VIEW OFFER → PURCHASE → REFER → QUALIFY → EARN → CONTRIBUTE → RECOGNISE → RETURN
```

MVP budget: ₹1.40 lakh. No AI, no blockchain, no microservices, no MLM trees.

---

## 2. Repository State (Inspection Result)

| Item | Finding |
|------|---------|
| Existing application code | ❌ NONE — Greenfield project |
| Existing database | ❌ NONE — MariaDB service not running |
| Existing framework | ❌ NONE — to be scaffolded |
| Existing API | ❌ NONE |
| Existing components | ❌ NONE |
| Existing routing | ❌ NONE |
| Existing auth | ❌ NONE |
| Source documents | ✅ GAS_MVP_Engineering_Blueprint.docx, GAS_MVP_Prompts.docx |

---

## 3. Available Environment (XAMPP)

| Tool | Version | Status |
|------|---------|--------|
| PHP | 8.2.12 | ✅ Available (warnings: openssle typo in php.ini) |
| MariaDB | 10.4.32 | ✅ Installed (⚠️ service stopped — needs start) |
| Apache | 2.4.58 | ✅ Available |
| Composer | 2.8.9 | ✅ Available |
| Node.js | 20.20.2 | ✅ Available |
| NPM | 11.4.1 | ✅ Available |

---

## 4. Chosen Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Frontend** | Next.js 14 (App Router) + TypeScript | SSR for SEO, React ecosystem, Node.js 20 available |
| **Backend** | Next.js API Routes (monorepo) | Avoids separate server cost within MVP budget |
| **Database** | MariaDB 10.4 (XAMPP) | Already installed; MySQL-compatible; Prisma supported |
| **ORM** | Prisma 5.x | Type-safe schema, migrations, MariaDB compatible |
| **Auth** | NextAuth.js v5 (Auth.js) | Credential auth + JWT; production-ready |
| **Styling** | Tailwind CSS 3.x | Utility-first; fast to build |
| **UI Components** | shadcn/ui | Pre-built accessible components on Radix + Tailwind |
| **Email** | Nodemailer (SMTP) | No SaaS lock-in for MVP |
| **Payments** | Razorpay | INR-native, webhook support, server-side verification |
| **Package Manager** | NPM | Node.js 20 / NPM 11 available locally |
| **State** | React Context + Zustand | Lightweight; no Redux overhead |
| **File Storage** | Local disk → Cloudflare R2 (prod) | Free tier R2 |
| **Dev Deployment** | XAMPP localhost:3000 | Existing infrastructure |
| **Prod Deployment** | VPS (Railway/DigitalOcean/Hostinger) | Cost-effective single server |

> **Stack Note:** Blueprint recommends PostgreSQL — we use MariaDB because it is already installed in XAMPP.
> Migration to PostgreSQL post-MVP is a single Prisma schema change.

---

## 5. System Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                        GAS™ MVP System                           │
│                                                                  │
│  [User Browser]  [Mobile Web]  [Admin Browser]                   │
│        │               │               │                         │
│        └───────────────┼───────────────┘                         │
│                        │  HTTPS                                  │
│               ┌────────▼────────┐                                │
│               │  Next.js 14     │                                │
│               │  (App Router)   │                                │
│               │  ┌───────────┐  │  ← Pages (SSR/SSG)            │
│               │  │ /app/*    │  │                                │
│               │  └───────────┘  │                                │
│               │  ┌───────────┐  │  ← REST API                   │
│               │  │ /api/*    │  │                                │
│               │  └─────┬─────┘  │                                │
│               └────────┼────────┘                                │
│                        │                                         │
│        ┌───────────────┼───────────────┐                         │
│        │               │               │                         │
│  ┌─────▼──────┐  ┌─────▼──────┐  ┌────▼──────────┐             │
│  │ MariaDB 10 │  │  Razorpay  │  │  Nodemailer   │             │
│  │  (Prisma)  │  │  Gateway   │  │  (SMTP Email) │             │
│  └────────────┘  └────────────┘  └───────────────┘             │
└──────────────────────────────────────────────────────────────────┘
```

---

## 6. Application Directory Structure

```
GAS/
├── docs/                           # Architecture & planning
├── prisma/
│   ├── schema.prisma               # DB schema (all models)
│   └── migrations/                 # Prisma auto migrations
├── public/
│   ├── images/
│   └── favicon.ico
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── (user)/
│   │   │   ├── dashboard/
│   │   │   ├── learn/
│   │   │   ├── offers/
│   │   │   │   └── [id]/
│   │   │   ├── refer/
│   │   │   ├── contribute/
│   │   │   └── recognition/
│   │   ├── (admin)/
│   │   │   └── admin/
│   │   │       ├── dashboard/
│   │   │       ├── users/
│   │   │       ├── products/
│   │   │       ├── orders/
│   │   │       ├── referrals/
│   │   │       ├── commissions/
│   │   │       ├── contributions/
│   │   │       ├── recognition/
│   │   │       ├── campaigns/
│   │   │       └── analytics/
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/
│   │   │   ├── users/
│   │   │   ├── products/
│   │   │   ├── offers/
│   │   │   ├── orders/
│   │   │   ├── payments/
│   │   │   │   └── webhook/        # Razorpay webhook
│   │   │   ├── referrals/
│   │   │   ├── commissions/
│   │   │   ├── contributions/
│   │   │   ├── recognition/
│   │   │   ├── notifications/
│   │   │   ├── admin/
│   │   │   └── analytics/
│   │   ├── layout.tsx
│   │   └── page.tsx                # Home / Landing page
│   ├── components/
│   │   ├── ui/                     # shadcn/ui base components
│   │   ├── auth/
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── UserNav.tsx
│   │   │   └── AdminNav.tsx
│   │   ├── offers/
│   │   ├── referral/
│   │   ├── commission/
│   │   ├── contribution/
│   │   ├── recognition/
│   │   ├── admin/
│   │   └── notifications/
│   ├── lib/
│   │   ├── prisma.ts               # Prisma client singleton
│   │   ├── auth.ts                 # NextAuth config
│   │   ├── razorpay.ts             # Payment helper
│   │   ├── email.ts                # Nodemailer helper
│   │   ├── referral.ts             # Referral code logic
│   │   ├── commission.ts           # Commission calculation engine
│   │   ├── recognition.ts          # Points & badge engine
│   │   ├── fraud.ts                # Fraud detection
│   │   ├── analytics.ts            # Event tracking
│   │   └── utils.ts                # Shared utilities
│   ├── hooks/
│   ├── types/
│   │   └── index.ts
│   └── middleware.ts               # Route protection (NextAuth)
├── .env.local                      # Environment variables (gitignored)
├── .env.example                    # Environment template
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

---

## 7. Navigation Map

**User Navigation:**
```
HOME → LEARN → OFFERS → REFER → CREATE VALUE → RECOGNITION → PROFILE
```

**Admin Navigation:**
```
DASHBOARD → USERS → PRODUCTS → ORDERS → REFERRALS → COMMISSIONS → CONTRIBUTIONS → RECOGNITION → CAMPAIGNS → ANALYTICS
```

---

## 8. MVP Architectural Constraints

1. **Single server** — No load balancer, no Redis, no queue workers
2. **No real-time** — No WebSockets; polling or page refresh acceptable
3. **No file uploads (V1)** — Contribution attachments deferred to V2
4. **No wallet** — Commission tracking only; payouts are manual/admin-initiated
5. **No mobile app** — Responsive web only
6. **Single currency** — INR only via Razorpay
7. **Two roles only** — USER and ADMIN (no granular RBAC for MVP)

---

## 9. Technical Debt Identified

| Debt | Severity | Resolution |
|------|----------|-----------|
| `openssle` typo in XAMPP php.ini | Low | Fix before PHP usage (non-blocking for Next.js) |
| MariaDB vs PostgreSQL | Low | Prisma abstraction; migrate via schema change in V2 |
| Single server deployment | Medium | Acceptable for MVP; scale in V2 |
| No CI/CD pipeline | Low | Manual deploy for MVP; add GitHub Actions in V2 |
| Local file storage | Low | Move to Cloudflare R2 before production launch |
