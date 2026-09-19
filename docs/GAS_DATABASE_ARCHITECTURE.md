# GAS™ MVP — Database Architecture
**Version:** 1.0.0 | **Date:** 2026-09-07 | **Database:** MariaDB 10.4 (Prisma ORM)

---

## 1. Database: gas_mvp

Engine: MariaDB 10.4 via XAMPP  
ORM: Prisma 5.x  
Charset: utf8mb4  
Collation: utf8mb4_unicode_ci

---

## 2. Entity Relationship Overview

```
users ──────────── profiles (1:1)
users ──────────── referrals (1:many — as referrer)
users ──────────── referrals (1:many — as referred)
users ──────────── orders (1:many)
users ──────────── commissions (1:many)
users ──────────── contributions (1:many)
users ──────────── recognition_points (1:many)
users ──────────── user_badges (1:many)
users ──────────── notifications (1:many)
users ──────────── activity_logs (1:many)

products ───────── orders (via order_items)
products ───────── commission_rules (1:many)

orders ─────────── order_items (1:many)
orders ─────────── payments (1:1)
orders ─────────── referrals (1:many)
orders ─────────── commissions (1:many)

campaigns ──────── products (many:many via campaign_products)
campaigns ──────── commission_rules (1:many)

badges ─────────── user_badges (1:many)
```

---

## 3. Table Definitions (Prisma Schema)

### 3.1 users
```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  password      String                          // bcrypt hash
  role          UserRole  @default(USER)
  status        UserStatus @default(ACTIVE)
  referralCode  String    @unique               // e.g. GAS-A1B2C3
  referredBy    String?                         // referralCode of referrer
  emailVerified Boolean   @default(false)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  profile             Profile?
  ordersPlaced        Order[]        @relation("OrderUser")
  referralsMade       Referral[]     @relation("ReferrerUser")
  referralsReceived   Referral[]     @relation("ReferredUser")
  commissions         Commission[]
  contributions       Contribution[]
  recognitionPoints   RecognitionPoint[]
  userBadges          UserBadge[]
  notifications       Notification[]
  activityLogs        ActivityLog[]
}

enum UserRole   { USER ADMIN }
enum UserStatus { ACTIVE SUSPENDED FLAGGED }
```

### 3.2 profiles
```prisma
model Profile {
  id          String   @id @default(cuid())
  userId      String   @unique
  firstName   String
  lastName    String
  mobile      String?  @unique
  bio         String?
  city        String?
  state       String?
  isComplete  Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

### 3.3 products
```prisma
model Product {
  id              String        @id @default(cuid())
  name            String
  slug            String        @unique
  description     String        @db.Text
  category        String
  price           Decimal       @db.Decimal(10,2)
  imageUrl        String?
  status          ProductStatus @default(DRAFT)
  startDate       DateTime?
  endDate         DateTime?
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  commissionRules CommissionRule[]
  orderItems      OrderItem[]
  campaignLinks   CampaignProduct[]
}

enum ProductStatus { DRAFT ACTIVE INACTIVE EXPIRED }
```

### 3.4 orders
```prisma
model Order {
  id          String      @id @default(cuid())
  userId      String
  totalAmount Decimal     @db.Decimal(10,2)
  status      OrderStatus @default(PENDING)
  notes       String?
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt

  user        User        @relation("OrderUser", fields: [userId], references: [id])
  items       OrderItem[]
  payment     Payment?
  referrals   Referral[]
  commissions Commission[]
}

enum OrderStatus { PENDING CONFIRMED PROCESSING COMPLETED CANCELLED REFUNDED }
```

### 3.5 order_items
```prisma
model OrderItem {
  id        String  @id @default(cuid())
  orderId   String
  productId String
  quantity  Int     @default(1)
  price     Decimal @db.Decimal(10,2)

  order   Order   @relation(fields: [orderId], references: [id])
  product Product @relation(fields: [productId], references: [id])
}
```

### 3.6 payments
```prisma
model Payment {
  id                String        @id @default(cuid())
  orderId           String        @unique
  razorpayOrderId   String        @unique
  razorpayPaymentId String?       @unique
  razorpaySignature String?
  amount            Decimal       @db.Decimal(10,2)
  currency          String        @default("INR")
  status            PaymentStatus @default(CREATED)
  method            String?       // card, upi, netbanking, etc.
  failureReason     String?
  paidAt            DateTime?
  createdAt         DateTime      @default(now())
  updatedAt         DateTime      @updatedAt

  order Order @relation(fields: [orderId], references: [id])
}

enum PaymentStatus { CREATED PENDING CAPTURED FAILED REFUNDED }
```

### 3.7 referrals
```prisma
model Referral {
  id              String          @id @default(cuid())
  referrerId      String                              // User who referred
  referredId      String                              // User who was referred
  orderId         String?                             // Qualifying order
  clickedAt       DateTime?
  registeredAt    DateTime?
  purchasedAt     DateTime?
  status          ReferralStatus  @default(REGISTERED)
  qualifiedAt     DateTime?
  isSelfReferral  Boolean         @default(false)
  isFlagged       Boolean         @default(false)
  flagReason      String?
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt

  referrer    User   @relation("ReferrerUser", fields: [referrerId], references: [id])
  referred    User   @relation("ReferredUser", fields: [referredId], references: [id])
  order       Order? @relation(fields: [orderId], references: [id])
  commissions Commission[]
}

enum ReferralStatus { REGISTERED PURCHASED QUALIFIED REJECTED FLAGGED }
```

### 3.8 commission_rules
```prisma
model CommissionRule {
  id              String          @id @default(cuid())
  name            String
  productId       String?                              // null = applies to all
  campaignId      String?
  type            CommissionType  @default(PERCENTAGE)
  value           Decimal         @db.Decimal(10,4)   // % or fixed INR
  minOrderAmount  Decimal?        @db.Decimal(10,2)
  validationDays  Int             @default(30)         // days before PENDING→APPROVED
  isActive        Boolean         @default(true)
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt

  product  Product?   @relation(fields: [productId], references: [id])
  campaign Campaign?  @relation(fields: [campaignId], references: [id])
}

enum CommissionType { PERCENTAGE FIXED }
```

### 3.9 commissions
```prisma
model Commission {
  id            String           @id @default(cuid())
  userId        String
  referralId    String
  orderId       String
  amount        Decimal          @db.Decimal(10,2)
  status        CommissionStatus @default(PENDING)
  approvedAt    DateTime?
  paidAt        DateTime?
  rejectedAt    DateTime?
  rejectReason  String?
  adminNote     String?
  createdAt     DateTime         @default(now())
  updatedAt     DateTime         @updatedAt

  user     User     @relation(fields: [userId], references: [id])
  referral Referral @relation(fields: [referralId], references: [id])
  order    Order    @relation(fields: [orderId], references: [id])
}

enum CommissionStatus { PENDING APPROVED REJECTED CANCELLED PAID }
```

### 3.10 contributions (V2V™)
```prisma
model Contribution {
  id          String              @id @default(cuid())
  userId      String
  title       String
  description String              @db.Text
  category    ContributionCategory
  status      ContributionStatus  @default(SUBMITTED)
  adminNote   String?
  pointsAwarded Int?
  reviewedAt  DateTime?
  reviewedBy  String?             // Admin user id
  createdAt   DateTime            @default(now())
  updatedAt   DateTime            @updatedAt

  user User @relation(fields: [userId], references: [id])
}

enum ContributionCategory { IDEA FEEDBACK PRODUCT_IMPROVEMENT EDUCATIONAL_CONTENT COMMUNITY RESOURCE }
enum ContributionStatus   { SUBMITTED UNDER_REVIEW APPROVED REJECTED }
```

### 3.11 recognition_points
```prisma
model RecognitionPoint {
  id          String          @id @default(cuid())
  userId      String
  points      Int
  action      RecognitionAction
  referenceId String?         // orderId, contributionId, etc.
  note        String?
  createdAt   DateTime        @default(now())

  user User @relation(fields: [userId], references: [id])
}

enum RecognitionAction {
  REGISTRATION
  PROFILE_COMPLETE
  PURCHASE
  REFERRAL_SUCCESSFUL
  CONTRIBUTION_APPROVED
  IDEA_APPROVED
  COMMUNITY_PARTICIPATION
  LEARNING_COMPLETE
}
```

### 3.12 recognition_levels (configurable)
```prisma
model RecognitionLevel {
  id          String @id @default(cuid())
  name        String @unique          // Explorer, Contributor, Value Builder, etc.
  minPoints   Int
  maxPoints   Int?
  badge       String?                 // badge icon name or URL
  description String?
  order       Int                     // for sorting
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

### 3.13 point_rules (configurable by admin)
```prisma
model PointRule {
  id      String            @id @default(cuid())
  action  RecognitionAction @unique
  points  Int
  isActive Boolean          @default(true)
  updatedAt DateTime        @updatedAt
}
```

### 3.14 badges
```prisma
model Badge {
  id          String @id @default(cuid())
  name        String @unique
  description String?
  iconUrl     String?
  condition   String? // human-readable trigger description
  createdAt   DateTime @default(now())

  userBadges UserBadge[]
}
```

### 3.15 user_badges
```prisma
model UserBadge {
  id        String   @id @default(cuid())
  userId    String
  badgeId   String
  earnedAt  DateTime @default(now())

  user  User  @relation(fields: [userId], references: [id])
  badge Badge @relation(fields: [badgeId], references: [id])

  @@unique([userId, badgeId])
}
```

### 3.16 notifications
```prisma
model Notification {
  id        String           @id @default(cuid())
  userId    String
  type      NotificationType
  title     String
  message   String
  isRead    Boolean          @default(false)
  data      Json?            // extra context (orderId, badgeId, etc.)
  createdAt DateTime         @default(now())

  user User @relation(fields: [userId], references: [id])
}

enum NotificationType {
  REGISTRATION
  REFERRAL_REGISTERED
  REFERRAL_QUALIFIED
  COMMISSION_PENDING
  COMMISSION_APPROVED
  COMMISSION_PAID
  CONTRIBUTION_APPROVED
  CONTRIBUTION_REJECTED
  POINTS_AWARDED
  BADGE_EARNED
  ORDER_CONFIRMED
  SYSTEM
}
```

### 3.17 campaigns
```prisma
model Campaign {
  id          String         @id @default(cuid())
  name        String
  description String?
  startDate   DateTime
  endDate     DateTime
  isActive    Boolean        @default(true)
  createdAt   DateTime       @default(now())
  updatedAt   DateTime       @updatedAt

  products        CampaignProduct[]
  commissionRules CommissionRule[]
}
```

### 3.18 campaign_products
```prisma
model CampaignProduct {
  campaignId String
  productId  String

  campaign Campaign @relation(fields: [campaignId], references: [id])
  product  Product  @relation(fields: [productId], references: [id])

  @@id([campaignId, productId])
}
```

### 3.19 activity_logs (analytics + audit)
```prisma
model ActivityLog {
  id          String @id @default(cuid())
  userId      String?
  sessionId   String?
  event       String             // PAGE_VIEW, PURCHASE, REFERRAL_CLICK, etc.
  entityType  String?            // "product", "order", etc.
  entityId    String?
  metadata    Json?
  ipAddress   String?
  userAgent   String?
  createdAt   DateTime @default(now())

  user User? @relation(fields: [userId], references: [id])
}
```

### 3.20 admin_users (separate admin table for security)
```prisma
model AdminUser {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String                  // bcrypt hash
  name      String
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

---

## 4. Indexes (Performance)

```sql
-- users
CREATE INDEX idx_users_referral_code ON users(referral_code);
CREATE INDEX idx_users_referred_by ON users(referred_by);
CREATE INDEX idx_users_status ON users(status);

-- referrals
CREATE INDEX idx_referrals_referrer ON referrals(referrer_id);
CREATE INDEX idx_referrals_referred ON referrals(referred_id);
CREATE INDEX idx_referrals_status ON referrals(status);

-- commissions
CREATE INDEX idx_commissions_user ON commissions(user_id);
CREATE INDEX idx_commissions_status ON commissions(status);

-- activity_logs
CREATE INDEX idx_logs_user ON activity_logs(user_id);
CREATE INDEX idx_logs_event ON activity_logs(event);
CREATE INDEX idx_logs_created ON activity_logs(created_at);
```

---

## 5. Seed Data Required

| Table | Seed |
|-------|------|
| admin_users | 1 super admin account |
| point_rules | Default points per action |
| recognition_levels | Explorer, Contributor, Value Builder, Community Builder, GAS Champion |
| badges | Welcome badge, First Purchase, First Referral, V2V Contributor |

---

## 6. Migrations Strategy

- Use `prisma migrate dev` during development
- Use `prisma migrate deploy` in staging/production
- Never edit migration files manually after applying
- Backup MariaDB before each production migration

---

## 7. Backup Policy (MVP)

- Daily mysqldump of `gas_mvp` database
- Store in separate directory or cloud storage
- Retention: 7 days rolling
