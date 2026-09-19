// ============================================================
// GAS™ MVP — Global TypeScript Types
// ============================================================

// ---- Roles & Status ----------------------------------------
export type UserRole = "USER" | "ADMIN" | "SUPER_ADMIN"
export type UserStatus = "ACTIVE" | "PENDING" | "SUSPENDED" | "BLOCKED"
export type ProductStatus = "DRAFT" | "ACTIVE" | "INACTIVE" | "EXPIRED"
export type OfferStatus = "DRAFT" | "ACTIVE" | "INACTIVE" | "EXPIRED"
export type OrderStatus = "PENDING" | "PAID" | "CANCELLED" | "REFUNDED" | "COMPLETED"
export type PaymentStatus = "CREATED" | "PENDING" | "CAPTURED" | "FAILED" | "REFUNDED"
export type ReferralStatus = "CLICKED" | "REGISTERED" | "PURCHASED" | "QUALIFIED" | "REJECTED"
export type CommissionType = "PERCENTAGE" | "FIXED"
export type CommissionStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED" | "PAID"
export type ContributionCategory = "IDEA" | "FEEDBACK" | "PRODUCT_IMPROVEMENT" | "EDUCATIONAL_CONTENT" | "COMMUNITY" | "RESOURCE"
export type ContributionStatus = "SUBMITTED" | "UNDER_REVIEW" | "APPROVED" | "REJECTED"
export type RecognitionAction = "REGISTRATION" | "PROFILE_COMPLETE" | "PURCHASE" | "REFERRAL_SUCCESSFUL" | "CONTRIBUTION_APPROVED" | "IDEA_APPROVED" | "COMMUNITY_PARTICIPATION" | "LEARNING_COMPLETE"
export type NotificationType = "REGISTRATION" | "REFERRAL_REGISTERED" | "REFERRAL_QUALIFIED" | "COMMISSION_PENDING" | "COMMISSION_APPROVED" | "COMMISSION_PAID" | "CONTRIBUTION_APPROVED" | "CONTRIBUTION_REJECTED" | "POINTS_AWARDED" | "BADGE_EARNED" | "ORDER_CONFIRMED" | "SYSTEM"

// ---- API Response Shapes -----------------------------------
export interface ApiSuccess<T = unknown> {
  data: T
  meta?: ApiMeta
}

export interface ApiError {
  error: string
  code?: string
  details?: Record<string, string[]>
}

export interface ApiMeta {
  page?: number
  limit?: number
  total?: number
  totalPages?: number
}

export type ApiResponse<T = unknown> = ApiSuccess<T> | ApiError

// ---- Auth Types --------------------------------------------
export interface SessionUser {
  id: string
  email: string
  name?: string | null
  role: UserRole
}

// ---- User Types --------------------------------------------
export interface UserSummary {
  id: string
  email: string
  role: UserRole
  status: UserStatus
  referralCode: string
  createdAt: Date
  profile?: ProfileSummary | null
}

export interface ProfileSummary {
  firstName: string
  lastName: string
  mobile?: string | null
  isComplete: boolean
}

// ---- Product Types -----------------------------------------
export interface ProductSummary {
  id: string
  name: string
  slug: string
  category: string
  price: number
  imageUrl?: string | null
  status: ProductStatus
}

// ---- Pagination Types --------------------------------------
export interface PaginationParams {
  page?: number
  limit?: number
  search?: string
}

export interface PaginatedResult<T> {
  items: T[]
  meta: ApiMeta
}

// ---- Recognition Types ------------------------------------
export interface RecognitionSummary {
  totalPoints: number
  level: RecognitionLevel | null
  nextLevel: RecognitionLevel | null
  badges: BadgeSummary[]
}

export interface RecognitionLevel {
  name: string
  minPoints: number
  maxPoints?: number | null
  badgeIcon?: string | null
  description?: string | null
}

export interface BadgeSummary {
  id: string
  name: string
  iconUrl?: string | null
  earnedAt: Date
}

// ---- Dashboard Types ---------------------------------------
export interface AdminStats {
  totalUsers: number
  totalOrders: number
  totalRevenue: number
  totalReferrals: number
  successfulReferrals: number
  pendingCommissions: number
  approvedCommissions: number
  totalContributions: number
}

export interface UserDashboard {
  totalOrders: number
  totalEarnings: number
  pendingCommissions: number
  totalReferrals: number
  qualifiedReferrals: number
  totalPoints: number
  currentLevel?: string
}
