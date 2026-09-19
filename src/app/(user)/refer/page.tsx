import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import ReferralCenterClient from "./ReferralCenterClient"

export default async function ReferPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    redirect("/login?callbackUrl=/refer")
  }

  const [user, totalClicks] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        referralsMade: {
          include: {
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
              },
            },
            commissions: {
              select: {
                amount: true,
                status: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    }),
    prisma.activityLog.count({
      where: {
        userId: session.user.id,
        event: "REFERRAL_LINK_CLICKED",
      },
    }),
  ])

  if (!user) redirect("/login")

  return (
    <ReferralCenterClient
      referralCode={user.referralCode}
      totalClicks={totalClicks}
      referrals={user.referralsMade as any}
    />
  )
}
