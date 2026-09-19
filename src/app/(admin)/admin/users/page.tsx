import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import AdminUsersClient from "./AdminUsersClient"

export default async function AdminUsersPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
    redirect("/login?callbackUrl=/admin/users")
  }

  const users = await prisma.user.findMany({
    include: {
      profile: true,
      _count: {
        select: {
          referralsMade: true,
          ordersPlaced: true,
          commissions: true,
          contributions: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  return <AdminUsersClient initialUsers={users} />
}