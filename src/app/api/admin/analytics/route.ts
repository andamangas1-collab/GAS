import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

// GET /api/admin/analytics - Aggregated platform analytics and conversion funnel
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Admin authorization required" }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const timeframe = searchParams.get("timeframe") || "all" // all, 30d, 7d

    let dateFilter: Date | undefined
    const now = new Date()
    if (timeframe === "7d") {
      dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    } else if (timeframe === "30d") {
      dateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    }

    const createdAtFilter = dateFilter ? { gte: dateFilter } : undefined

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
        where: {
          event: "REFERRAL_LINK_CLICKED",
          createdAt: createdAtFilter,
        },
      }),
      prisma.user.count({ where: { createdAt: createdAtFilter } }),
      prisma.order.count({ where: { createdAt: createdAtFilter } }),
      prisma.order.count({ where: { status: "PAID", createdAt: createdAtFilter } }),
      prisma.referral.count({ where: { createdAt: createdAtFilter } }),
      prisma.referral.count({ where: { status: "QUALIFIED", createdAt: createdAtFilter } }),
      prisma.order.aggregate({
        where: { status: { in: ["PAID", "COMPLETED"] }, createdAt: createdAtFilter },
        _sum: { totalAmount: true },
      }),
      prisma.commission.aggregate({
        where: { createdAt: createdAtFilter },
        _sum: { amount: true },
        _count: { id: true },
      }),
      prisma.commission.aggregate({
        where: { status: "PAID", createdAt: createdAtFilter },
        _sum: { amount: true },
        _count: { id: true },
      }),
      prisma.commission.aggregate({
        where: { status: "PENDING", createdAt: createdAtFilter },
        _sum: { amount: true },
        _count: { id: true },
      }),
      prisma.contribution.count({ where: { createdAt: createdAtFilter } }),
      prisma.contribution.count({ where: { status: "APPROVED", createdAt: createdAtFilter } }),
      prisma.recognitionPoint.aggregate({
        where: { createdAt: createdAtFilter },
        _sum: { points: true },
      }),
      prisma.contribution.groupBy({
        by: ["category"],
        _count: { id: true },
        where: { createdAt: createdAtFilter },
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

    // Funnel rates calculation
    const clickToRegRate = totalClicks > 0 ? ((totalUsers / totalClicks) * 100).toFixed(1) : "0.0"
    const regToOrderRate = totalUsers > 0 ? ((paidOrdersCount / totalUsers) * 100).toFixed(1) : "0.0"
    const orderToQualifyRate = totalOrders > 0 ? ((qualifiedReferrals / totalOrders) * 100).toFixed(1) : "0.0"
    const overallFunnelRate = totalClicks > 0 ? ((qualifiedReferrals / totalClicks) * 100).toFixed(2) : "0.00"

    return NextResponse.json({
      success: true,
      timeframe,
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
      recentActivity,
    })
  } catch (error) {
    console.error("[API_ADMIN_ANALYTICS_GET_ERROR]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
