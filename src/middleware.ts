// ============================================================
// GAS™ MVP — Next.js Middleware
// Protects routes based on authentication and role.
// ============================================================

import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import type { JWT } from "next-auth/jwt"

// Routes that require authentication
const USER_ROUTES = [
  "/dashboard",
  "/checkout",
  "/refer",
  "/contribute",
  "/recognition",
]

// Routes that require admin access (ADMIN or SUPER_ADMIN)
const ADMIN_ROUTES = ["/admin"]

// API routes that require authentication
const AUTH_API_ROUTES = [
  "/api/users/me",
  "/api/orders",
  "/api/referrals",
  "/api/commissions",
  "/api/contributions",
  "/api/recognition/me",
  "/api/notifications",
  "/api/analytics/event",
]

// API routes that require admin access
const ADMIN_API_ROUTES = [
  "/api/admin",
  "/api/users",
  "/api/commissions/rules",
  "/api/recognition/levels",
  "/api/recognition/rules",
  "/api/analytics/dashboard",
]


export default withAuth(
  function middleware(req: NextRequest & { nextauth: { token: JWT | null } }) {
    const { pathname } = req.nextUrl
    const token = req.nextauth?.token

    // Admin route protection
    if (ADMIN_ROUTES.some((route) => pathname.startsWith(route))) {
      if (!token) {
        return NextResponse.redirect(new URL(`/login?callbackUrl=${encodeURIComponent(pathname)}`, req.url))
      }
      const role = token.role as string
      if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
        return NextResponse.redirect(new URL("/dashboard?error=access_denied", req.url))
      }
    }

    // Admin API protection
    if (ADMIN_API_ROUTES.some((route) => pathname.startsWith(route))) {
      if (!token) {
        return NextResponse.json({ error: "Authentication required", code: "UNAUTHORIZED" }, { status: 401 })
      }
      const role = token.role as string
      if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
        return NextResponse.json({ error: "Admin access required", code: "FORBIDDEN" }, { status: 403 })
      }
    }

    return NextResponse.next()
  },
  {
    pages: {
      signIn: "/login",
    },
    callbacks: {
      authorized({ req, token }) {
        const { pathname } = req.nextUrl

        // Public routes — always allow
        if (
          pathname === "/" ||
          pathname.startsWith("/login") ||
          pathname.startsWith("/register") ||
          pathname.startsWith("/forgot-password") ||
          pathname.startsWith("/reset-password") ||
          pathname.startsWith("/r/") ||         // Referral tracking
          pathname.startsWith("/api/auth") ||
          pathname.startsWith("/api/health") ||
          pathname.startsWith("/api/products") ||
          pathname.startsWith("/offers") ||
          pathname.startsWith("/learn") ||
          pathname.startsWith("/api/referrals/track") ||
          pathname.startsWith("/_next") ||
          pathname.startsWith("/favicon")
        ) {
          return true
        }


        // Protected routes — require login
        if (
          USER_ROUTES.some((route) => pathname.startsWith(route)) ||
          AUTH_API_ROUTES.some((route) => pathname.startsWith(route)) ||
          ADMIN_ROUTES.some((route) => pathname.startsWith(route)) ||
          ADMIN_API_ROUTES.some((route) => pathname.startsWith(route))
        ) {
          return !!token
        }

        // Default: allow
        return true
      },
    },
  }
)

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public folder files
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
}
