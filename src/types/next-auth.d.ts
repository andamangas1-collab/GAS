import type { UserRole } from "@/types"
import type { DefaultSession } from "next-auth"
import type { JWT } from "next-auth/jwt"

// Augment the NextAuth session and JWT types to include our custom fields
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: UserRole
    } & DefaultSession["user"]
  }

  interface User {
    id: string
    role: UserRole
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: UserRole
  }
}
