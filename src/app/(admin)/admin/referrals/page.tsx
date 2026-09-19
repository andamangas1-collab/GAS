import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import AdminReferralsClient from "./AdminReferralsClient"

export default async function AdminReferralsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
    redirect("/login?callbackUrl=/admin/referrals")
  }

  const referrals = await prisma.referral.findMany({
    include: {
      referrer: {
        select: {
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
      referred: {
        select: {
          email: true,
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
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  return <AdminReferralsClient initialReferrals={referrals as any} />
}