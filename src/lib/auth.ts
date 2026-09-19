// ============================================================
// GAS™ MVP — NextAuth v4 Configuration
// Strategy: JWT (no database sessions)
// Roles: USER | ADMIN | SUPER_ADMIN
// ============================================================

import type { AuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { compare } from "bcryptjs"
import type { UserRole } from "@/types"

// Lazy import Prisma to avoid edge runtime issues
async function getPrisma() {
  const { prisma } = await import("@/lib/prisma")
  return prisma
}

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required")
        }

        const db = await getPrisma()
        const user = await db.user.findUnique({
          where: { email: credentials.email.toLowerCase().trim() },
          include: { profile: true },
        })

        if (!user) {
          throw new Error("Invalid email or password")
        }

        if (user.status === "BLOCKED") {
          throw new Error("Your account has been blocked. Contact security support.")
        }

        if (user.status === "SUSPENDED") {
          throw new Error("Your account has been suspended. Contact support.")
        }

        if (user.status === "PENDING") {
          throw new Error("Your account is pending activation.")
        }

        const isPasswordValid = await compare(credentials.password, user.password)
        if (!isPasswordValid) {
          throw new Error("Invalid email or password")
        }

        const displayName = user.profile
          ? `${user.profile.firstName} ${user.profile.lastName}`.trim()
          : null

        return {
          id: user.id,
          email: user.email,
          name: displayName,
          role: user.role as UserRole,
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      // On first sign-in, user is available
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id
        session.user.role = token.role
      }
      return session
    },
  },

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60,   // Refresh every 24 hours
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },

  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
}

// ---- Role Authorization Helpers ----------------------------

export type AuthRole = UserRole

/** Returns true if the role has admin-level access */
export function isAdmin(role: UserRole): boolean {
  return role === "ADMIN" || role === "SUPER_ADMIN"
}

/** Returns true if the role is SUPER_ADMIN */
export function isSuperAdmin(role: UserRole): boolean {
  return role === "SUPER_ADMIN"
}

/** Returns true if the role has standard user access (all roles) */
export function isUser(role: UserRole): boolean {
  return role === "USER" || role === "ADMIN" || role === "SUPER_ADMIN"
}

/**
 * Check if the given role is at least the required role level.
 * Hierarchy: USER < ADMIN < SUPER_ADMIN
 */
export function hasMinRole(userRole: UserRole, minRole: UserRole): boolean {
  const hierarchy: Record<UserRole, number> = {
    USER: 0,
    ADMIN: 1,
    SUPER_ADMIN: 2,
  }
  return hierarchy[userRole] >= hierarchy[minRole]
}
