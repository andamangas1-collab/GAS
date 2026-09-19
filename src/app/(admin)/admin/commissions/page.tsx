import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import AdminCommissionsClient from "./AdminCommissionsClient"

export default async function AdminCommissionsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
    redirect("/login?callbackUrl=/admin/commissions")
  }

  const commissions = await prisma.commission.findMany({
    include: {
      user: {
        select: {
          id: true,
          email: true,
          referralCode: true,
          profile: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      },
      order: {
        select: {
          id: true,
          totalAmount: true,
          status: true,
          createdAt: true,
          items: {
            include: {
              product: {
                select: { name: true },
              },
            },
          },
        },
      },
      referral: {
        select: {
          id: true,
          status: true,
          referred: {
            select: { email: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  return <AdminCommissionsClient initialCommissions={commissions as any} />
}