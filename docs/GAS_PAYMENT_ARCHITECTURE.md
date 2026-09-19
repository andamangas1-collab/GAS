# GAS™ MVP — Order & Payment Architecture Specification
**Version:** 1.0.0 | **Date:** 2026-09-08 | **Status:** IMPLEMENTED & VERIFIED

---

## 1. System Overview & Core Product Flow

The GAS™ Order & Payment subsystem is engineered with an uncompromised zero-trust security architecture:

```
USER
 ↓
CHECKOUT INITIATION (/checkout?productId=...)
 ↓
SERVER-SIDE TOTAL CALCULATION (/api/orders)
   • Fetch product price strictly from DB
   • Deduplicate duplicate requests
   • Generate Gateway Order (Razorpay)
   • Atomic Order + OrderItem + Payment creation (status: PENDING, CREATED)
 ↓
PAYMENT PROCESSING & GATEWAY HANDSHAKE
 ↓
CRYPTOGRAPHIC SERVER-SIDE VERIFICATION (/api/payments/verify)
   • HMAC-SHA256 signature check
   • Order marked PAID, Payment CAPTURED
 ↓
REFERRAL QUALIFICATION TRIGGER
   • Lookup referred user in referrals table
   • Validate: Not self-referral, Referrer != Buyer
   • Transition Referral: REGISTERED -> QUALIFIED
 ↓
DYNAMIC COMMISSION CALCULATION
   • Read active CommissionRule for purchased item
   • Support PERCENTAGE (%) or FIXED (₹) amounts
   • Create Commission record (status: PENDING - validation window active)
 ↓
RECOGNITION POINTS & AUDIT LOGGING
   • +10 Points awarded to Buyer for purchase
   • +20 Points awarded to Referrer for successful qualification
   • Write immutable entry to audit_logs
```

---

## 2. Non-Negotiable Security Principles

1. **Client Price & Commission Immunity:**
   - The frontend never submits a `totalAmount`, `price`, or `commissionValue`. The backend queries the database using `productId` and computes amounts strictly server-side.
2. **No Premature Commission Payout:**
   - Initiating checkout does **NOT** qualify a referral or generate payable commission.
   - Commission records are created only upon cryptographic signature verification and remain in `PENDING` status for the mandatory validation window.
3. **Idempotency & Duplicate Order Prevention:**
   - Rapid multiple clicks within a 10-minute window reuse existing pending orders rather than flooding the ledger.
4. **Cryptographic Verification:**
   - Every transaction requires valid HMAC-SHA256 signatures matching Razorpay secrets.

---

## 3. Database Entities & Lifecycle States

| Entity | Primary States | Key Relations |
|---|---|---|
| **`orders`** | `PENDING`, `PAID`, `CANCELLED`, `REFUNDED`, `COMPLETED` | `userId`, `items` (OrderItems), `payment` (Payment) |
| **`order_items`** | Quantitative snapshot | `orderId`, `productId`, `price`, `quantity` |
| **`payments`** | `CREATED`, `PENDING`, `CAPTURED`, `FAILED`, `REFUNDED` | `orderId`, `razorpayOrderId`, `razorpayPaymentId`, `signature` |
| **`referrals`** | `REGISTERED` -> `QUALIFIED` | `referrerId`, `referredId`, `orderId` |
| **`commissions`**| `PENDING`, `APPROVED`, `REJECTED`, `CANCELLED`, `PAID` | `userId`, `referralId`, `orderId`, `amount` |
| **`audit_logs`** | Immutable history | `action: PAYMENT_CAPTURED`, `resource: orders` |

---

## 4. End-to-End Verification Proof

All execution links verified via `test_order_payment_flow.js`:
- ✅ Valid order creation with server-side price lookup.
- ✅ Rejection of tampering with price.
- ✅ Rejection of invalid/unauthorized cryptographic signatures.
- ✅ Referral transition to `QUALIFIED`.
- ✅ Dynamic commission calculation based on active `CommissionRule`.
- ✅ Awarding of buyer purchase points (+10) and referrer points (+20).