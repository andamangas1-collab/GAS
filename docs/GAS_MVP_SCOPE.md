# GAS™ MVP — Scope Document
**Version:** 1.0.0 | **Date:** 2026-09-07 | **Status:** APPROVED FOR IMPLEMENTATION

---

## 1. Scope Classification

| Label | Meaning |
|-------|---------|
| ✅ EXISTING / REUSABLE | Already available in environment — no build needed |
| 🔧 NEEDS MODIFICATION | Exists but requires config or adaptation |
| 🔨 NEEDS CREATION | Must be built from scratch |
| 🚫 FUTURE / OUT OF SCOPE | Explicitly deferred to GAS V2/V3 |

---

## 2. Infrastructure & Environment

| Item | Status |
|------|--------|
| PHP 8.2 runtime | ✅ EXISTING |
| MariaDB 10.4 | 🔧 NEEDS START — create gas_mvp database |
| Apache 2.4 | 🔧 Configure as reverse proxy to Next.js:3000 (optional) |
| Node.js 20 | ✅ EXISTING |
| NPM 11 | ✅ EXISTING |
| Composer | ✅ EXISTING (not needed for Node stack) |
| openssle php.ini fix | 🔧 Remove invalid extension line |
| Next.js project scaffold | 🔨 NEEDS CREATION |
| .env.local | 🔨 NEEDS CREATION |
| Prisma schema | 🔨 NEEDS CREATION |

---

## 3. Authentication & User Management

| Feature | Status | Priority |
|---------|--------|----------|
| User registration (email + password) | 🔨 NEEDS CREATION | P0 |
| Email verification (optional) | 🔨 NEEDS CREATION | P1 |
| User login / logout | 🔨 NEEDS CREATION | P0 |
| Forgot password / reset | 🔨 NEEDS CREATION | P1 |
| JWT session management (NextAuth) | 🔨 NEEDS CREATION | P0 |
| Role-based access (user / admin) | 🔨 NEEDS CREATION | P0 |
| Admin login (separate credential) | 🔨 NEEDS CREATION | P0 |
| Social OAuth (Google/Facebook) | 🚫 FUTURE | — |
| Mobile OTP authentication | 🚫 FUTURE | — |
| Two-factor authentication | 🚫 FUTURE | — |

---

## 4. User Profile

| Feature | Status | Priority |
|---------|--------|----------|
| Profile creation (name, mobile, bio) | 🔨 NEEDS CREATION | P0 |
| Profile edit | 🔨 NEEDS CREATION | P1 |
| Profile completeness tracking | 🔨 NEEDS CREATION | P1 |
| Avatar / photo upload | 🚫 FUTURE | — |
| Social links | 🚫 FUTURE | — |

---

## 5. Product / Offer Module

| Feature | Status | Priority |
|---------|--------|----------|
| Product listing page | 🔨 NEEDS CREATION | P0 |
| Product detail page | 🔨 NEEDS CREATION | P0 |
| Admin: Create/edit/delete product | 🔨 NEEDS CREATION | P0 |
| Product categories | 🔨 NEEDS CREATION | P1 |
| Product image (single) | 🔨 NEEDS CREATION | P1 |
| Campaign-specific offers | 🔨 NEEDS CREATION | P1 |
| Product status (active/inactive/expired) | 🔨 NEEDS CREATION | P0 |
| Commission % or fixed per product | 🔨 NEEDS CREATION | P0 |
| Advanced search/filter | 🚫 FUTURE | — |
| Product reviews & ratings | 🚫 FUTURE | — |
| Product variants (sizes, colors) | 🚫 FUTURE | — |

---

## 6. Order & Payment

| Feature | Status | Priority |
|---------|--------|----------|
| Checkout flow | 🔨 NEEDS CREATION | P0 |
| Razorpay integration (client + server) | 🔨 NEEDS CREATION | P0 |
| Server-side payment verification (webhook) | 🔨 NEEDS CREATION | P0 |
| Order creation on payment success | 🔨 NEEDS CREATION | P0 |
| Order status tracking | 🔨 NEEDS CREATION | P0 |
| Order history (user) | 🔨 NEEDS CREATION | P1 |
| Invoice/receipt email | 🔨 NEEDS CREATION | P1 |
| Refund handling (status update) | 🔨 NEEDS CREATION | P1 |
| Multi-item cart | 🚫 FUTURE | — |
| COD / offline payment | 🚫 FUTURE | — |
| Multi-currency | 🚫 FUTURE | — |
| Subscription payments | 🚫 FUTURE | — |

---

## 7. Referral Engine

| Feature | Status | Priority |
|---------|--------|----------|
| Unique referral code per user | 🔨 NEEDS CREATION | P0 |
| Referral link generation | 🔨 NEEDS CREATION | P0 |
| Referral click tracking | 🔨 NEEDS CREATION | P0 |
| Referral registration attribution | 🔨 NEEDS CREATION | P0 |
| Referral purchase qualification | 🔨 NEEDS CREATION | P0 |
| Referral dashboard (user view) | 🔨 NEEDS CREATION | P0 |
| Admin: Referral management | 🔨 NEEDS CREATION | P1 |
| Self-referral detection | 🔨 NEEDS CREATION | P0 |
| Multi-level referral tree | 🚫 FUTURE | — |
| Referral leaderboard | 🚫 FUTURE | — |

---

## 8. Commission Engine

| Feature | Status | Priority |
|---------|--------|----------|
| Commission calculation (% or fixed) | 🔨 NEEDS CREATION | P0 |
| Status workflow (PENDING→APPROVED→PAID) | 🔨 NEEDS CREATION | P0 |
| Configurable commission rules (admin) | 🔨 NEEDS CREATION | P0 |
| Campaign-specific commission | 🔨 NEEDS CREATION | P1 |
| Commission reversal on refund | 🔨 NEEDS CREATION | P1 |
| User commission dashboard | 🔨 NEEDS CREATION | P0 |
| Admin: Commission management | 🔨 NEEDS CREATION | P0 |
| Automated payout processing | 🚫 FUTURE | — |
| Wallet / balance system | 🚫 FUTURE | — |
| Tax deduction (TDS) calculation | 🚫 FUTURE | — |

---

## 9. V2V™ Contribution Engine

| Feature | Status | Priority |
|---------|--------|----------|
| Contribution submission form | 🔨 NEEDS CREATION | P0 |
| Contribution categories | 🔨 NEEDS CREATION | P0 |
| Admin review / approve / reject | 🔨 NEEDS CREATION | P0 |
| Points award on approval | 🔨 NEEDS CREATION | P0 |
| Contribution status tracking | 🔨 NEEDS CREATION | P0 |
| File/attachment upload | 🚫 FUTURE | — |
| Public contribution feed | 🚫 FUTURE | — |
| Community voting/upvotes | 🚫 FUTURE | — |

---

## 10. Recognition Engine

| Feature | Status | Priority |
|---------|--------|----------|
| Points system | 🔨 NEEDS CREATION | P0 |
| Configurable point rules (admin) | 🔨 NEEDS CREATION | P0 |
| Recognition levels (Explorer→GAS Champion) | 🔨 NEEDS CREATION | P0 |
| Badge system | 🔨 NEEDS CREATION | P1 |
| User activity timeline | 🔨 NEEDS CREATION | P1 |
| Recognition page (user) | 🔨 NEEDS CREATION | P0 |
| Admin: Configure levels & points | 🔨 NEEDS CREATION | P0 |
| NFT badges | 🚫 FUTURE | — |
| Public leaderboard | 🚫 FUTURE | — |
| Advanced gamification | 🚫 FUTURE | — |

---

## 11. Admin Dashboard

| Feature | Status | Priority |
|---------|--------|----------|
| Overview stats | 🔨 NEEDS CREATION | P0 |
| User management (search, view, suspend) | 🔨 NEEDS CREATION | P0 |
| Product management | 🔨 NEEDS CREATION | P0 |
| Order management | 🔨 NEEDS CREATION | P0 |
| Referral management | 🔨 NEEDS CREATION | P0 |
| Commission management | 🔨 NEEDS CREATION | P0 |
| Contribution review | 🔨 NEEDS CREATION | P0 |
| Recognition configuration | 🔨 NEEDS CREATION | P0 |
| Campaign management | 🔨 NEEDS CREATION | P1 |
| Analytics dashboard | 🔨 NEEDS CREATION | P1 |
| Audit logs | 🔨 NEEDS CREATION | P1 |
| Multi-admin roles | 🚫 FUTURE | — |

---

## 12. Notifications

| Feature | Status | Priority |
|---------|--------|----------|
| In-app notification bell | 🔨 NEEDS CREATION | P0 |
| Email notifications (transactional) | 🔨 NEEDS CREATION | P0 |
| Notification preferences | 🔨 NEEDS CREATION | P1 |
| WhatsApp notifications | 🚫 FUTURE | — |
| Push notifications | 🚫 FUTURE | — |
| SMS notifications | 🚫 FUTURE | — |

---

## 13. Fraud & Security

| Feature | Status | Priority |
|---------|--------|----------|
| Self-referral detection | 🔨 NEEDS CREATION | P0 |
| Duplicate email/mobile check | 🔨 NEEDS CREATION | P0 |
| Suspicious flag (manual review) | 🔨 NEEDS CREATION | P1 |
| Audit logs | 🔨 NEEDS CREATION | P1 |
| Commission reversal on cancellation | 🔨 NEEDS CREATION | P1 |
| API rate limiting | 🔨 NEEDS CREATION | P0 |
| Automated ML fraud detection | 🚫 FUTURE | — |

---

## 14. Explicitly Out of Scope (MVP)

- Complex AI/ML recommendation engine
- Blockchain / cryptocurrency
- Multi-level MLM tree referrals
- Advanced social networking
- Complex wallet infrastructure
- Advanced live chat
- Large influencer marketplace
- Advanced gamification beyond points/badges
- Multi-country payment system
- 3D interface
- Microservice architecture
- Mobile apps (iOS/Android)
- WhatsApp/SMS notifications
- File attachment uploads
- Subscription/recurring payments
- Real-time WebSocket features

---

## 15. Budget Allocation

| Component | Budget |
|-----------|--------|
| UI/UX + Design | ₹15,000 |
| Auth + Profiles | ₹12,000 |
| Products / Offers | ₹15,000 |
| Orders + Payment | ₹15,000 |
| Referral Engine | ₹20,000 |
| Commission Engine | ₹12,000 |
| V2V Contribution | ₹12,000 |
| Recognition | ₹7,000 |
| Admin Dashboard | ₹15,000 |
| Analytics/Notifications | ₹5,000 |
| Testing + Deployment | ₹12,000 |
| **TOTAL** | **₹1,40,000** |

---

## 16. Definition of Done

- [ ] User can register and log in
- [ ] User receives a unique referral identity (code + link)
- [ ] User can view an offer/product
- [ ] User can complete a purchase (Razorpay)
- [ ] Payment verified server-side (webhook)
- [ ] Order recorded correctly
- [ ] User can share a referral link
- [ ] Referred user can register via link
- [ ] Referred user can purchase
- [ ] Referral qualification recorded
- [ ] Commission calculated per configurable rules
- [ ] User can submit a V2V contribution
- [ ] Admin can review, approve, or reject contributions
- [ ] Recognition points awarded on qualifying actions
- [ ] User can see points, levels, and badges
- [ ] Admin can manage users, orders, referrals, commissions, contributions
- [ ] Basic fraud flags and audit logs work
- [ ] Core analytics events captured
- [ ] Complete business loop tested in staging
