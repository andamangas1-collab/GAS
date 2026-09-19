import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import AdminAnalyticsClient from "./AdminAnalyticsClient"

export const dynamic = "force-dynamic"

export default async function AdminAnalyticsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
    redirect("/login?callbackUrl=/admin/analytics")
  }

  const [
    totalClicks,
    totalUsers,
    totalOrders,
    paidOrdersCount,
    totalReferrals,
    qualifiedReferrals,
    salesSum,
    commissionSum,
    paidCommissionSum,
    pendingCommissionSum,
    totalContributions,
    approvedContributions,
    pointsSum,
    contributionsByCategory,
    levelsWithCount,
    recentActivity,
  ] = await Promise.all([
    prisma.activityLog.count({
      where: { event: "REFERRAL_LINK_CLICKED" },
    }),
    prisma.user.count(),
    prisma.order.count(),
    prisma.order.count({ where: { status: "PAID" } }),
    prisma.referral.count(),
    prisma.referral.count({ where: { status: "QUALIFIED" } }),
    prisma.order.aggregate({
      where: { status: { in: ["PAID", "COMPLETED"] } },
      _sum: { totalAmount: true },
    }),
    prisma.commission.aggregate({
      _sum: { amount: true },
      _count: { id: true },
    }),
    prisma.commission.aggregate({
      where: { status: "PAID" },
      _sum: { amount: true },
      _count: { id: true },
    }),
    prisma.commission.aggregate({
      where: { status: "PENDING" },
      _sum: { amount: true },
      _count: { id: true },
    }),
    prisma.contribution.count(),
    prisma.contribution.count({ where: { status: "APPROVED" } }),
    prisma.recognitionPoint.aggregate({
      _sum: { points: true },
    }),
    prisma.contribution.groupBy({
      by: ["category"],
      _count: { id: true },
    }),
    prisma.recognitionLevel.findMany({
      orderBy: { minPoints: "asc" },
    }),
    prisma.activityLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        user: {
          select: { email: true, referralCode: true },
        },
      },
    }),
  ])

  const grossSales = Number(salesSum._sum.totalAmount || 0)
  const totalCommissions = Number(commissionSum._sum.amount || 0)
  const paidCommissions = Number(paidCommissionSum._sum.amount || 0)
  const pendingCommissions = Number(pendingCommissionSum._sum.amount || 0)
  const avgOrderValue = paidOrdersCount > 0 ? Math.round(grossSales / paidOrdersCount) : 0
  const totalPoints = pointsSum._sum.points || 0

  const clickToRegRate = totalClicks > 0 ? ((totalUsers / totalClicks) * 100).toFixed(1) : "0.0"
  const regToOrderRate = totalUsers > 0 ? ((paidOrdersCount / totalUsers) * 100).toFixed(1) : "0.0"
  const orderToQualifyRate = totalOrders > 0 ? ((qualifiedReferrals / totalOrders) * 100).toFixed(1) : "0.0"
  const overallFunnelRate = totalClicks > 0 ? ((qualifiedReferrals / totalClicks) * 100).toFixed(2) : "0.00"

  const initialData = {
    timeframe: "all",
    funnel: {
      totalClicks,
      totalUsers,
      totalOrders,
      paidOrdersCount,
      totalReferrals,
      qualifiedReferrals,
      rates: {
        clickToRegRate,
        regToOrderRate,
        orderToQualifyRate,
        overallFunnelRate,
      },
    },
    financials: {
      grossSales,
      totalCommissions,
      paidCommissions,
      pendingCommissions,
      commissionsCount: commissionSum._count.id,
      avgOrderValue,
    },
    v2v: {
      totalContributions,
      approvedContributions,
      approvalRate: totalContributions > 0 ? Math.round((approvedContributions / totalContributions) * 100) : 0,
      categoryBreakdown: contributionsByCategory.map((c) => ({
        category: c.category,
        count: c._count.id,
      })),
    },
    recognition: {
      totalPoints,
      levels: levelsWithCount.map((l) => ({
        id: l.id,
        name: l.name,
        minPoints: l.minPoints,
        maxPoints: l.maxPoints,
      })),
    },
    recentActivity: recentActivity as any,
  }

  return <AdminAnalyticsClient initialData={initialData} />
}