# GAS™ MVP — Authentication & User Profile System Documentation
**Version:** 1.0.0 | **Date:** 2026-09-08 | **Security Status:** VERIFIED & AUDITED

---

## 1. Overview & Architecture

The GAS™ Authentication & User System is built on:
- **NextAuth.js v4** utilizing the **JWT session strategy** (HTTP-only, secure, SameSite=Lax cookies).
- **bcryptjs** password hashing (salt rounds: 12) for all credential authentication.
- **Role-Based Access Control (RBAC):** Three distinct roles (`USER`, `ADMIN`, `SUPER_ADMIN`).
- **Account Status Enforcement:** `ACTIVE`, `PENDING`, `SUSPENDED`, `BLOCKED`.
- **Edge Route Middleware (`src/middleware.ts`):** Protecting all user dashboard, user actions, and administrative endpoints.
- **Server-side Auth Guards (`src/lib/auth-guard.ts`):** Ensuring API handlers never trust client-supplied identity or role claims.

---

## 2. Registration Specifications & Business Rules

### 2.1 Required Fields & Validation
| Field | Type | Validation Rules | Destination |
|---|---|---|---|
| **Full Name** | String | Min 3, max 100 chars; parsed into `firstName` and `lastName` | `profiles` table |
| **Mobile Number** | String | 10-digit Indian standard (`^[6-9]\d{9}$`), unique constraint | `profiles` table |
| **Email Address** | String | Valid email format, lowercase, unique constraint | `users` table |
| **Password** | String | Min 8 chars, 1 uppercase, 1 lowercase, 1 digit, bcrypt hashed | `users` table |
| **Confirm Password**| String | Must strictly match password | Server-side validation |
| **Referral Code** | String | Optional. Format: `GAS-[A-Z0-9]{6}`. Must match active user | `referrals` table |
| **Terms Acceptance**| Boolean | Mandatory `true` | Request validation |

### 2.2 Referral Attribution vs Qualification Principle
- Entering a valid referral code associates the new registrant with the referrer in the `referrals` ledger with status `REGISTERED`.
- **CRITICAL ANTI-FRAUD RULE:** Registration alone **DOES NOT** trigger referral qualification or commission generation. Commission eligibility is triggered only upon completed order and payment verification.

---

## 3. Session & Credential Security Matrix

### 3.1 Security Controls
1. **Plaintext Password Prohibition:** Plaintext passwords are never stored in database columns, cached, or logged.
2. **Hash Exposure Prevention:** Database queries in user endpoints (`/api/users/me`) explicitly exclude the `password` column.
3. **Account Status Blocking:**
   - `SUSPENDED` accounts are denied authorization with a support contact message.
   - `BLOCKED` accounts are immediately denied login.
   - `PENDING` accounts are prompted for verification.
4. **Duplicate Safeguards:** Uniqueness constraints on both `email` and `mobile` prevent duplicate identity farming.
5. **No Client Role Trust:** Session roles are read from verified server-side JWT signatures generated exclusively upon database validation.

---

## 4. Endpoints & Route Map

| Method | Path | Access Level | Description |
|---|---|---|---|
| **GET** | `/login` | Public | Sign in form |
| **GET** | `/register` | Public | Registration form (supports `?ref=CODE` query parameter) |
| **POST** | `/api/auth/register` | Public | Validates and creates User + Profile + RefCode + Points |
| **POST** | `/api/auth/[...nextauth]` | Public | NextAuth sign in, session retrieval, and sign out |
| **GET** | `/api/users/me` | Authenticated | Fetches profile, points, level, counts, and badges |
| **PUT** | `/api/users/me` | Authenticated | Updates current user profile details |
| **GET** | `/dashboard` | `USER` / `ADMIN` / `SUPER_ADMIN` | Authenticated User Dashboard |
| **GET** | `/admin/*` | `ADMIN` / `SUPER_ADMIN` | Restricted Admin Control Plane |

---

## 5. Verification & Test Evidence

All authentication flows and security controls were verified through automated testing in `test_auth_suite.js`:
- ✅ Valid registration with Full Name, Mobile, Email, Password, Referral Code & Terms.
- ✅ Bcrypt hash verification (salt rounds 12).
- ✅ Rejection of duplicate emails (HTTP 409 Conflict).
- ✅ Rejection of duplicate mobile numbers (HTTP 409 Conflict).
- ✅ Rejection of unaccepted terms (HTTP 400 Bad Request).
- ✅ Rejection of password mismatch (HTTP 400 Bad Request).
- ✅ NextAuth credential authorization with valid credentials.
- ✅ NextAuth denial on invalid password.
- ✅ Immediate rejection of `BLOCKED` and `SUSPENDED` accounts.
- ✅ Server-side RBAC hierarchy enforcement (`USER` < `ADMIN` < `SUPER_ADMIN`).
- ✅ Zero commissions awarded at registration alone.