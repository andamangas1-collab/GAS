# GAS™ MVP — Database Schema & Architecture Specification
**Version:** 1.0.0 | **Date:** 2026-09-07 | **Status:** APPROVED & VALIDATED IN ENGINE

---

## 1. Executive Summary & Design Principles

The GAS™ (Grand Affiliate System) MVP database schema is engineered on **MariaDB 10.4** (MySQL compatible) using **Prisma ORM**. It establishes a normalized, scalable, and audit-ready data model covering the complete **V2V™ (Value-to-Value) Engine** lifecycle without hardcoding business rules into relational structures.

### Key Architectural Tenets:
1. **Evolutionary Business Logic:** Commission calculation, validation windows, tier requirements, and recognition actions are configurable via database rows (`commission_rules`, `point_rules`, `recognition_levels`) rather than static schema constraints or application constants.
2. **Strict Referential Integrity:** Foreign keys with explicit cascade/restrict rules protect financial ledgers (`orders`, `payments`, `commissions`, `referrals`).
3. **No Redundant / Denormalized State:** Single source of truth for balances and qualifications.
4. **Auditability & Observability:** Administrative mutations generate immutable records in `audit_logs`, while client/telemetry interactions log to `activity_logs`.
5. **Security & RBAC:** Role levels (`USER`, `ADMIN`, `SUPER_ADMIN`) and lifecycle statuses (`ACTIVE`, `PENDING`, `SUSPENDED`, `BLOCKED`) enforced on the principal identity.

---

## 2. Core Entities & Lifecycle Statuses

### 2.1 Complete Status State Machines

| Entity | Status Enum | Allowed Values |
|---|---|---|
| **User** | `UserStatus` | `ACTIVE`, `PENDING`, `SUSPENDED`, `BLOCKED` |
| **Order** | `OrderStatus` | `PENDING`, `PAID`, `CANCELLED`, `REFUNDED`, `COMPLETED` |
| **Referral** | `ReferralStatus` | `CLICKED`, `REGISTERED`, `PURCHASED`, `QUALIFIED`, `REJECTED` |
| **Commission** | `CommissionStatus` | `PENDING`, `APPROVED`, `REJECTED`, `CANCELLED`, `PAID` |
| **Contribution** | `ContributionStatus` | `SUBMITTED`, `UNDER_REVIEW`, `APPROVED`, `REJECTED` |
| **Payment** | `PaymentStatus` | `CREATED`, `PENDING`, `CAPTURED`, `FAILED`, `REFUNDED` |
| **Product** | `ProductStatus` | `DRAFT`, `ACTIVE`, `INACTIVE`, `EXPIRED` |
| **Offer** | `OfferStatus` | `DRAFT`, `ACTIVE`, `INACTIVE`, `EXPIRED` |

---

## 3. Entity Definitions & Relationships

### 1. Users (`users`)
- **Primary Key:** `id` (String, cuid)
- **Attributes:** `email` (unique), `password` (bcrypt), `role` (`UserRole`), `status` (`UserStatus`), `referral_code` (unique), `referred_by` (optional), `email_verified`, `created_at`, `updated_at`.
- **Indexes:** `referral_code`, `referred_by`, `status`, `role`, `created_at`.
- **Relationships:**
  - 1:1 with `profiles`
  - 1:N with `orders` (as purchaser)
  - 1:N with `referrals` (as referrer)
  - 1:N with `referrals` (as referred user)
  - 1:N with `commissions`
  - 1:N with `contributions`
  - 1:N with `recognition_points`
  - 1:N with `user_badges`
  - 1:N with `notifications`
  - 1:N with `audit_logs`

### 2. Profiles (`profiles`)
- **Primary Key:** `id` (cuid)
- **Foreign Key:** `user_id` (User.id, 1:1, onDelete: Cascade)
- **Attributes:** `first_name`, `last_name`, `mobile` (unique nullable), `bio`, `city`, `state`, `is_complete`, timestamps.
- **Indexes:** `user_id`, `mobile`.

### 3. Products (`products`)
- **Primary Key:** `id` (cuid)
- **Attributes:** `name`, `slug` (unique), `description`, `category`, `price` (Decimal 10,2), `image_url`, `status` (`ProductStatus`), `start_date`, `end_date`, timestamps.
- **Indexes:** `slug`, `status`, `category`, `created_at`.
- **Relationships:**
  - 1:N with `order_items`
  - 1:N with `commission_rules`
  - M:N with `campaigns` via `campaign_products`
  - M:N with `offers` via `offer_products`

### 4. Offers (`offers`)
- **Primary Key:** `id` (cuid)
- **Attributes:** `title`, `slug` (unique), `description`, `banner_url`, `discount_type` (`PERCENTAGE`/`FIXED`), `discount_value` (Decimal 10,2), `status` (`OfferStatus`), `start_date`, `end_date`, `terms_conditions`, timestamps.
- **Indexes:** `slug`, `status`, `(start_date, end_date)`.
- **Relationships:** M:N with `products` via `offer_products`.

### 5. Orders (`orders`)
- **Primary Key:** `id` (cuid)
- **Foreign Key:** `user_id` (User.id)
- **Attributes:** `total_amount` (Decimal 10,2), `status` (`OrderStatus`), `notes`, timestamps.
- **Indexes:** `user_id`, `status`, `created_at`.
- **Relationships:**
  - 1:N with `order_items`
  - 1:1 with `payments`
  - 1:N with `referrals`
  - 1:N with `commissions`

### 6. Order Items (`order_items`)
- **Primary Key:** `id` (cuid)
- **Foreign Keys:** `order_id` (Order.id, onDelete: Cascade), `product_id` (Product.id)
- **Attributes:** `quantity` (Int), `price` (Decimal 10,2).
- **Indexes:** `order_id`, `product_id`.

### 7. Payments (`payments`)
- **Primary Key:** `id` (cuid)
- **Foreign Key:** `order_id` (Order.id, unique, onDelete: Cascade)
- **Attributes:** `razorpay_order_id` (unique), `razorpay_payment_id` (unique nullable), `razorpay_signature`, `amount` (Decimal 10,2), `currency` ("INR"), `status` (`PaymentStatus`), `method`, `failure_reason`, `paid_at`, timestamps.
- **Indexes:** `order_id`, `status`, `razorpay_order_id`, `paid_at`.

### 8. Referrals (`referrals`)
- **Primary Key:** `id` (cuid)
- **Foreign Keys:** `referrer_id` (User.id), `referred_id` (User.id), `order_id` (Order.id nullable)
- **Attributes:** `status` (`ReferralStatus`), `clicked_at`, `registered_at`, `purchased_at`, `qualified_at`, `is_self_referral`, `is_flagged`, `flag_reason`, timestamps.
- **Indexes:** `referrer_id`, `referred_id`, `order_id`, `status`, `created_at`.

### 9. Commission Rules (`commission_rules`)
- **Primary Key:** `id` (cuid)
- **Foreign Keys:** `product_id` (Product.id nullable), `campaign_id` (Campaign.id nullable)
- **Attributes:** `name`, `type` (`PERCENTAGE`/`FIXED`), `value` (Decimal 10,4), `min_order_amount` (Decimal nullable), `validation_days` (Int default 30), `is_active` (Boolean), timestamps.
- **Indexes:** `product_id`, `campaign_id`, `is_active`.

### 10. Commissions (`commissions`)
- **Primary Key:** `id` (cuid)
- **Foreign Keys:** `user_id` (User.id), `referral_id` (Referral.id), `order_id` (Order.id)
- **Attributes:** `amount` (Decimal 10,2), `status` (`CommissionStatus`), `approved_at`, `paid_at`, `rejected_at`, `reject_reason`, `admin_note`, timestamps.
- **Indexes:** `user_id`, `referral_id`, `order_id`, `status`, `created_at`.

### 11. Contributions (`contributions` — V2V™ Engine)
- **Primary Key:** `id` (cuid)
- **Foreign Key:** `user_id` (User.id)
- **Attributes:** `title`, `description`, `category` (`ContributionCategory`), `status` (`ContributionStatus`), `admin_note`, `points_awarded`, `reviewed_at`, `reviewed_by`, timestamps.
- **Indexes:** `user_id`, `status`, `category`, `created_at`.

### 12. Recognition Points (`recognition_points`)
- **Primary Key:** `id` (cuid)
- **Foreign Key:** `user_id` (User.id)
- **Attributes:** `points` (Int), `action` (`RecognitionAction`), `reference_id`, `note`, `created_at`.
- **Indexes:** `user_id`, `action`, `created_at`.

### 13. Badges (`badges`) & User Badges (`user_badges`)
- `badges`: `id`, `name` (unique), `description`, `icon_url`, `condition`, `created_at`.
- `user_badges`: `id`, `user_id`, `badge_id`, `earned_at`. Unique composite `(user_id, badge_id)`.

### 14. Notifications (`notifications`)
- **Primary Key:** `id` (cuid)
- **Foreign Key:** `user_id` (User.id, onDelete: Cascade)
- **Attributes:** `type` (`NotificationType`), `title`, `message`, `is_read`, `data` (JSON metadata), `created_at`.
- **Indexes:** `user_id`, `is_read`, `created_at`.

### 15. Campaigns (`campaigns`)
- **Primary Key:** `id` (cuid)
- **Attributes:** `name`, `description`, `start_date`, `end_date`, `is_active`, timestamps.
- **Indexes:** `is_active`, `(start_date, end_date)`.
- **Relationships:** M:N with `products` via `campaign_products`.

### 16. Activity Logs (`activity_logs`)
- Telemetry/analytics store for client & server events (`event`, `entity_type`, `entity_id`, `metadata`, `ip_address`, `user_agent`, `created_at`).

### 17. Audit Logs (`audit_logs`)
- Immutable ledger for administrative actions and state modifications (`action`, `resource`, `resource_id`, `old_values`, `new_values`, `ip_address`, `user_agent`, `created_at`).

---

## 4. Referential Integrity & Deletion Rules

| Parent | Child | Foreign Key OnDelete Action |
|---|---|---|
| `users` | `profiles` | `CASCADE` |
| `users` | `orders` | `RESTRICT` (default) |
| `users` | `referrals` | `RESTRICT` |
| `users` | `commissions` | `RESTRICT` |
| `users` | `user_badges` | `CASCADE` |
| `users` | `notifications` | `CASCADE` |
| `users` | `audit_logs` | `SET NULL` |
| `orders` | `order_items` | `CASCADE` |
| `orders` | `payments` | `CASCADE` |
| `products` | `order_items` | `RESTRICT` |
| `offers` | `offer_products` | `CASCADE` |
| `campaigns` | `campaign_products` | `CASCADE` |

---

## 5. Migration & Verification Results

- Migration command: `npx prisma db push`
- Database target: `MariaDB 10.4.32` at `localhost:3307` (`gas_mvp`)
- Total physical tables created: **23**
- Seed execution: `npm run db:seed` (seeded Super Admin, 8 Point Rules, 5 Recognition Levels, 6 Badges, Global Commission Rule)
- Direct integration test script: Executed 10 sequential cross-table transaction operations with 100% pass rate.