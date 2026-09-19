// ============================================================
// GAS™ MVP — Server-Side Auth Guard
// Use in API routes to enforce authentication & authorization.
// ============================================================

import { getServerSession } from "next-auth"
import { authOptions, isAdmin, isSuperAdmin, hasMinRole } from "@/lib/auth"
import { UnauthorizedError, ForbiddenError } from "@/lib/errors"
import type { UserRole } from "@/types"

/**
 * Get the current session, throwing UnauthorizedError if not authenticated.
 * Use in API route handlers.
 */
export async function requireAuth() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    throw new UnauthorizedError("You must be logged in to access this resource")
  }
  return session
}

/**
 * Require the user to be logged in AND have at least the given role.
 * Role hierarchy: USER < ADMIN < SUPER_ADMIN
 */
export async function requireRole(minRole: UserRole) {
  const session = await requireAuth()
  const userRole = session.user.role as UserRole

  if (!hasMinRole(userRole, minRole)) {
    throw new ForbiddenError("You do not have permission to access this resource")
  }

  return session
}

/**
 * Require the user to be an admin (ADMIN or SUPER_ADMIN).
 */
export async function requireAdmin() {
  const session = await requireAuth()
  if (!isAdmin(session.user.role as UserRole)) {
    throw new ForbiddenError("Admin access required")
  }
  return session
}

/**
 * Require the user to be a super admin.
 */
export async function requireSuperAdmin() {
  const session = await requireAuth()
  if (!isSuperAdmin(session.user.role as UserRole)) {
    throw new ForbiddenError("Super admin access required")
  }
  return session
}

/**
 * Require the user to be the resource owner OR an admin.
 * Use for operations like editing your own profile.
 */
export async function requireSelfOrAdmin(resourceUserId: string) {
  const session = await requireAuth()
  const isSelf = session.user.id === resourceUserId
  if (!isSelf && !isAdmin(session.user.role as UserRole)) {
    throw new ForbiddenError("You can only access your own resources")
  }
  return session
}
