import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { RecognitionService } from "@/lib/services/recognition.service"
import DashboardClient, { DashboardData } from "./DashboardClient"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/login?callbackUrl=/dashboard")
  }

  const userId = session.user.id

  // 1. Fetch User and Profile
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { profile: true },
  })

  if (!user) {
    redirect("/login")
  }

  // 2. Fetch Recognition Summary (Points ledger, level, badges)
  const recognitionSummary = await RecognitionService.getUserRecognitionSummary(userId)

  // 3. Fetch Referrals Data (Private to authenticated user)
  const [totalReferrals, successfulReferrals, recentReferralsRaw, clickLogsCount] = await Promise.all([
    prisma.referral.count({ where: { referrerId: userId } }),
    prisma.referral.count({ where: { referrerId: userId, status: "QUALIFIED" } }),
    prisma.referral.findMany({
      where: { referrerId: userId },
      include: {
        referred: {
          select: { email: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.activityLog.count({
      where: {
        userId,
        event: "REFERRAL_LINK_CLICKED",
      },
    }),
  ])

  const conversionRate = totalReferrals > 0 ? Math.round((successfulReferrals / totalReferrals) * 100) : 0
  const recentReferrals = recentReferralsRaw.map((r) => {
    // Mask referred user email for privacy (e.g. j***@example.com)
    const emailParts = r.referred.email.split("@")
    const maskedEmail = emailParts[0].length > 2
      ? `${emailParts[0].slice(0, 2)}***@${emailParts[1]}`
      : `u***@${emailParts[1] || "gas.local"}`
    return {
      id: r.id,
      status: r.status,
      registeredAt: r.registeredAt,
      qualifiedAt: r.qualifiedAt,
      referredUserEmail: maskedEmail,
    }
  })

  // 4. Fetch Commissions & Financial Metrics (Strictly private to authenticated user)
  const commissions = await prisma.commission.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  })

  const eligibleTotal = commissions
    .filter((c) => c.status === "APPROVED" || c.status === "PAID")
    .reduce((sum, c) => sum + Number(c.amount), 0)

  const pendingTotal = commissions
    .filter((c) => c.status === "PENDING")
    .reduce((sum, c) => sum + Number(c.amount), 0)

  const paidTotal = commissions
    .filter((c) => c.status === "PAID")
    .reduce((sum, c) => sum + Number(c.amount), 0)

  const recentCommissions = commissions.slice(0, 5).map((c) => ({
    id: c.id,
    amount: Number(c.amount),
    status: c.status,
    createdAt: c.createdAt,
  }))

  // 5. Fetch V2V Contributions
  const [totalContributions, approvedContributions, pendingContributions, recentContributionsRaw] =
    await Promise.all([
      prisma.contribution.count({ where: { userId } }),
      prisma.contribution.count({ where: { userId, status: "APPROVED" } }),
      prisma.contribution.count({
        where: {
          userId,
          status: { in: ["SUBMITTED", "UNDER_REVIEW"] },
        },
      }),
      prisma.contribution.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ])

  const approvalRate = totalContributions > 0 ? Math.round((approvedContributions / totalContributions) * 100) : 0
  const recentContributions = recentContributionsRaw.map((c) => ({
    id: c.id,
    title: c.title,
    category: c.category,
    status: c.status,
    pointsAwarded: c.pointsAwarded,
    adminNote: c.adminNote,
    createdAt: c.createdAt,
  }))

  // 6. Fetch Learning Completion Status
  const learningLedger = await prisma.recognitionPoint.findFirst({
    where: {
      userId,
      action: "LEARNING_COMPLETE",
    },
  })

  // 7. Fetch Live Active Catalog Offers
  const activeProducts = await prisma.product.findMany({
    where: { status: "ACTIVE" },
    include: {
      commissionRules: {
        where: { isActive: true },
        take: 1,
      },
    },
    take: 4,
  })

  const offers = activeProducts.map((p) => {
    const rule = p.commissionRules[0]
    let commissionText = "10% Commission"
    if (rule) {
      commissionText = rule.type === "PERCENTAGE" ? `${rule.value}% Commission` : `₹${rule.value} Fixed`
    }
    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: Number(p.price),
      category: p.category,
      commissionText,
    }
  })

  // 8. Fetch Private Activity Telemetry
  const activityLogs = await prisma.activityLog.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 15,
  })

  const activity = activityLogs.map((a) => ({
    id: a.id,
    event: a.event,
    entityType: a.entityType,
    metadata: a.metadata,
    createdAt: a.createdAt,
  }))

  // 9. Compose Dashboard Data Payload
  const dashboardData: DashboardData = {
    user: {
      id: user.id,
      email: user.email,
      referralCode: user.referralCode,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt,
      profile: user.profile
        ? {
            firstName: user.profile.firstName,
            lastName: user.profile.lastName,
            mobile: user.profile.mobile,
            city: user.profile.city,
            state: user.profile.state,
            isComplete: user.profile.isComplete,
          }
        : null,
    },
    recognition: {
      totalPoints: recognitionSummary.totalPoints,
      currentLevel: recognitionSummary.currentLevel,
      nextLevel: recognitionSummary.nextLevel,
      progressPercentage: recognitionSummary.progressPercentage,
      badges: recognitionSummary.badges,
    },
    referrals: {
      totalCount: totalReferrals,
      successfulCount: successfulReferrals,
      conversionRate,
      clickCount: clickLogsCount,
      recent: recentReferrals,
    },
    earnings: {
      eligibleTotal,
      pendingTotal,
      paidTotal,
      commissionsCount: commissions.length,
      recent: recentCommissions,
    },
    contributions: {
      totalCount: totalContributions,
      approvedCount: approvedContributions,
      pendingCount: pendingContributions,
      approvalRate,
      recent: recentContributions,
    },
    learning: {
      isCompleted: !!learningLedger,
      completedAt: learningLedger ? learningLedger.createdAt : null,
    },
    offers,
    activity,
  }

  return <DashboardClient data={dashboardData} />
}