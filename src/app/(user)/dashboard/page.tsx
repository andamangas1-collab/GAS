import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { RecognitionService } from "@/lib/services/recognition.service"
import DashboardClient, { DashboardData } from "./DashboardClient"

export const dynamic = "force-dynamic"
export const maxDuration = 30

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/dashboard")
  }

  const userId = session.user.id

  try {
    // 1. Fetch User and Profile
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    })

    if (!user) {
      redirect("/login")
    }

    // 2. Fetch all dashboard data concurrently in a single roundtrip
    const [
      recognitionSummaryResult,
      totalReferrals,
      successfulReferrals,
      recentReferralsRaw,
      clickLogsCount,
      commissions,
      totalContributions,
      approvedContributions,
      pendingContributions,
      recentContributionsRaw,
      learningLedger,
      activeProducts,
      activityLogs,
    ] = await Promise.all([
      RecognitionService.getUserRecognitionSummary(userId).catch(() => ({
        totalPoints: 0,
        currentLevel: {
          name: "Explorer",
          description: "Welcome to your value creation journey.",
          minPoints: 0,
          maxPoints: 49,
          badgeIcon: "Compass",
          order: 1,
        },
        nextLevel: null,
        progressPercentage: 100,
        badges: [],
        pointsHistory: [],
        activityHistory: [],
      })),
      prisma.referral.count({ where: { referrerId: userId } }).catch(() => 0),
      prisma.referral.count({ where: { referrerId: userId, status: "QUALIFIED" } }).catch(() => 0),
      prisma.referral
        .findMany({
          where: { referrerId: userId },
          include: {
            referred: {
              select: { email: true },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 5,
        })
        .catch(() => []),
      prisma.activityLog
        .count({
          where: {
            userId,
            event: "REFERRAL_LINK_CLICKED",
          },
        })
        .catch(() => 0),
      prisma.commission
        .findMany({
          where: { userId },
          orderBy: { createdAt: "desc" },
        })
        .catch(() => []),
      prisma.contribution.count({ where: { userId } }).catch(() => 0),
      prisma.contribution.count({ where: { userId, status: "APPROVED" } }).catch(() => 0),
      prisma.contribution
        .count({
          where: {
            userId,
            status: { in: ["SUBMITTED", "UNDER_REVIEW"] },
          },
        })
        .catch(() => 0),
      prisma.contribution
        .findMany({
          where: { userId },
          orderBy: { createdAt: "desc" },
          take: 5,
        })
        .catch(() => []),
      prisma.recognitionPoint
        .findFirst({
          where: {
            userId,
            action: "LEARNING_COMPLETE",
          },
        })
        .catch(() => null),
      prisma.product
        .findMany({
          where: { status: "ACTIVE" },
          include: {
            commissionRules: {
              where: { isActive: true },
              take: 1,
            },
          },
          take: 4,
        })
        .catch(() => []),
      prisma.activityLog
        .findMany({
          where: { userId },
          orderBy: { createdAt: "desc" },
          take: 15,
        })
        .catch(() => []),
    ])

    // Process Referrals safely
    const conversionRate = totalReferrals > 0 ? Math.round((successfulReferrals / totalReferrals) * 100) : 0
    const recentReferrals = recentReferralsRaw.map((r) => {
      const email = r.referred?.email || "user@gas.local"
      const emailParts = email.split("@")
      const maskedEmail =
        emailParts[0].length > 2
          ? `${emailParts[0].slice(0, 2)}***@${emailParts[1] || "gas.local"}`
          : `u***@${emailParts[1] || "gas.local"}`
      return {
        id: r.id,
        status: r.status,
        registeredAt: r.registeredAt,
        qualifiedAt: r.qualifiedAt,
        referredUserEmail: maskedEmail,
      }
    })

    // Process Commissions safely
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

    // Process Contributions safely
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

    // Process Offers safely
    const offers = activeProducts.map((p) => {
      const rule = p.commissionRules?.[0]
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

    // Process Activity safely
    const activity = activityLogs.map((a) => ({
      id: a.id,
      event: a.event,
      entityType: a.entityType,
      metadata: a.metadata,
      createdAt: a.createdAt,
    }))

    // Compose Dashboard Data Payload
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
        totalPoints: recognitionSummaryResult.totalPoints,
        currentLevel: recognitionSummaryResult.currentLevel,
        nextLevel: recognitionSummaryResult.nextLevel,
        progressPercentage: recognitionSummaryResult.progressPercentage,
        badges: recognitionSummaryResult.badges,
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
  } catch (error) {
    console.error("[DASHBOARD_SERVER_ERROR]", error)
    // Return minimal fallback if critical error
    const fallbackData: DashboardData = {
      user: {
        id: userId,
        email: session.user.email || "user@gas.local",
        referralCode: "GAS-MEMBER",
        role: "USER",
        status: "ACTIVE",
        createdAt: new Date(),
        profile: null,
      },
      recognition: {
        totalPoints: 0,
        currentLevel: {
          name: "Explorer",
          description: "Welcome to your value creation journey.",
          minPoints: 0,
          maxPoints: 49,
          order: 1,
        },
        nextLevel: null,
        progressPercentage: 100,
        badges: [],
      },
      referrals: {
        totalCount: 0,
        successfulCount: 0,
        conversionRate: 0,
        clickCount: 0,
        recent: [],
      },
      earnings: {
        eligibleTotal: 0,
        pendingTotal: 0,
        paidTotal: 0,
        commissionsCount: 0,
        recent: [],
      },
      contributions: {
        totalCount: 0,
        approvedCount: 0,
        pendingCount: 0,
        approvalRate: 0,
        recent: [],
      },
      learning: {
        isCompleted: false,
        completedAt: null,
      },
      offers: [],
      activity: [],
    }
    return <DashboardClient data={fallbackData} />
  }
}