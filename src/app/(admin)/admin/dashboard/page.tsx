import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import {
  Users,
  UserCheck,
  ShoppingCart,
  DollarSign,
  Share2,
  CheckCircle2,
  Clock,
  Award,
  Sparkles,
  TrendingUp,
  Package,
  Megaphone,
  BarChart3,
  ShieldCheck,
  ArrowUpRight,
  History
} from "lucide-react"

export const dynamic = "force-dynamic"

export default async function AdminDashboardPage() {
  const [
    totalUsers,
    activeUsers,
    totalOrders,
    salesAgg,
    totalReferrals,
    successfulReferrals,
    pendingCommissions,
    approvedCommissions,
    totalContributions,
    pointsAgg,
    totalProducts,
    totalCampaigns,
    recentAuditLogs,
    recentUsers,
  ] = await Promise.all([
    // 1. Total users
    prisma.user.count(),
    // 2. Active users
    prisma.user.count({ where: { status: "ACTIVE" } }),
    // 3. Total orders
    prisma.order.count(),
    // 4. Total sales
    prisma.order.aggregate({
      where: { status: { in: ["PAID", "COMPLETED"] } },
      _sum: { totalAmount: true },
    }),
    // 5. Total referrals
    prisma.referral.count(),
    // 6. Successful referrals
    prisma.referral.count({ where: { status: "QUALIFIED" } }),
    // 7. Pending commissions
    prisma.commission.aggregate({
      where: { status: "PENDING" },
      _sum: { amount: true },
      _count: { id: true },
    }),
    // 8. Approved commissions
    prisma.commission.aggregate({
      where: { status: "APPROVED" },
      _sum: { amount: true },
      _count: { id: true },
    }),
    // 9. Contributions
    prisma.contribution.count(),
    // 10. Recognition points awarded
    prisma.recognitionPoint.aggregate({
      _sum: { points: true },
    }),
    // Supplementary Module Counts
    prisma.product.count(),
    prisma.campaign.count(),
    // Recent Audit Trail
    prisma.auditLog.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: { email: true, role: true },
        },
      },
    }),
    // Recent Users
    prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { profile: true },
    }),
  ])

  const totalSalesAmount = Number(salesAgg._sum.totalAmount || 0)
  const pendingCommAmount = Number(pendingCommissions._sum.amount || 0)
  const approvedCommAmount = Number(approvedCommissions._sum.amount || 0)
  const totalPointsAwarded = pointsAgg._sum.points || 0

  // 10 Required Metrics Array
  const executiveMetrics = [
    {
      title: "Total Users",
      value: totalUsers.toLocaleString(),
      subtitle: `${activeUsers} active members`,
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50 border-blue-200",
      href: "/admin/users",
    },
    {
      title: "Active Users",
      value: activeUsers.toLocaleString(),
      subtitle: `${totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0}% operational rate`,
      icon: UserCheck,
      color: "text-emerald-600",
      bg: "bg-emerald-50 border-emerald-200",
      href: "/admin/users",
    },
    {
      title: "Total Orders",
      value: totalOrders.toLocaleString(),
      subtitle: "Lifetime purchases logged",
      icon: ShoppingCart,
      color: "text-indigo-600",
      bg: "bg-indigo-50 border-indigo-200",
      href: "/admin/orders",
    },
    {
      title: "Total Sales",
      value: `₹${totalSalesAmount.toLocaleString()}`,
      subtitle: "Gross settled revenue",
      icon: DollarSign,
      color: "text-amber-600",
      bg: "bg-amber-50 border-amber-200",
      href: "/admin/orders",
    },
    {
      title: "Total Referrals",
      value: totalReferrals.toLocaleString(),
      subtitle: "Direct attributions tracked",
      icon: Share2,
      color: "text-purple-600",
      bg: "bg-purple-50 border-purple-200",
      href: "/admin/referrals",
    },
    {
      title: "Successful Referrals",
      value: successfulReferrals.toLocaleString(),
      subtitle: `${totalReferrals > 0 ? Math.round((successfulReferrals / totalReferrals) * 100) : 0}% qualified purchases`,
      icon: CheckCircle2,
      color: "text-emerald-600",
      bg: "bg-emerald-50 border-emerald-200",
      href: "/admin/referrals",
    },
    {
      title: "Pending Commissions",
      value: `₹${pendingCommAmount.toLocaleString()}`,
      subtitle: `${pendingCommissions._count.id} in review queue`,
      icon: Clock,
      color: "text-amber-600",
      bg: "bg-amber-50 border-amber-200",
      href: "/admin/commissions",
    },
    {
      title: "Approved Commissions",
      value: `₹${approvedCommAmount.toLocaleString()}`,
      subtitle: `${approvedCommissions._count.id} ready for payout`,
      icon: TrendingUp,
      color: "text-teal-600",
      bg: "bg-teal-50 border-teal-200",
      href: "/admin/commissions",
    },
    {
      title: "Contributions",
      value: totalContributions.toLocaleString(),
      subtitle: "V2V™ ideas & submissions",
      icon: Sparkles,
      color: "text-rose-600",
      bg: "bg-rose-50 border-rose-200",
      href: "/admin/contributions",
    },
    {
      title: "Recognition Points Awarded",
      value: totalPointsAwarded.toLocaleString(),
      subtitle: "Immutable points ledger sum",
      icon: Award,
      color: "text-gas-600",
      bg: "bg-gas-50 border-gas-200",
      href: "/admin/recognition",
    },
  ]

  // 9 Administrative Modules
  const adminModules = [
    { title: "USERS", count: `${totalUsers} Registered`, desc: "Member accounts, role assignment & security statuses", href: "/admin/users", icon: Users },
    { title: "PRODUCTS", count: `${totalProducts} Offerings`, desc: "Catalog offers, pricing & dynamic commission rules", href: "/admin/products", icon: Package },
    { title: "ORDERS", count: `${totalOrders} Orders`, desc: "Transaction verification, payment statuses & refunds", href: "/admin/orders", icon: ShoppingCart },
    { title: "REFERRALS", count: `${totalReferrals} Attributions`, desc: "Direct single-tier links, anti-fraud flags & qualification", href: "/admin/referrals", icon: Share2 },
    { title: "COMMISSIONS", count: `₹${(pendingCommAmount + approvedCommAmount).toLocaleString()}`, desc: "Approval workflows, rejection reasoning & payout disbursement", href: "/admin/commissions", icon: DollarSign },
    { title: "CONTRIBUTIONS", count: `${totalContributions} Ideas/Items`, desc: "V2V™ community submissions, editorial review & points", href: "/admin/contributions", icon: Sparkles },
    { title: "RECOGNITION", count: `${totalPointsAwarded} Points`, desc: "Configurable point rules, milestone tiers & badges", href: "/admin/recognition", icon: Award },
    { title: "CAMPAIGNS", count: `${totalCampaigns} Campaigns`, desc: "Promotional events, timeframes & product incentives", href: "/admin/campaigns", icon: Megaphone },
    { title: "ANALYTICS", count: "Funnel & Velocity", desc: "Conversion funnel rates, revenue telemetry & reports", href: "/admin/analytics", icon: BarChart3 },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">GAS™ Executive Admin Dashboard</h1>
            <Badge variant="outline" className="text-xs bg-gas-50 text-gas-800 border-gas-200">
              V2V™ Governance
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            Real-time telemetry and enterprise oversight across all 10 core metrics and 9 administrative modules.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs px-2.5 py-1">
            ● Database Connected (MariaDB)
          </Badge>
        </div>
      </div>

      {/* 10 Executive Metrics Grid */}
      <div>
        <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-gas-600" /> 10 Core Executive Metrics
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {executiveMetrics.map((m) => (
            <Card key={m.title} className="shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-1.5 pt-3.5 px-3.5">
                <CardTitle className="text-[11px] font-semibold uppercase text-muted-foreground leading-tight">
                  {m.title}
                </CardTitle>
                <div className={`p-1.5 rounded-md ${m.bg}`}>
                  <m.icon className={`h-3.5 w-3.5 ${m.color}`} />
                </div>
              </CardHeader>
              <CardContent className="px-3.5 pb-3.5 pt-0">
                <div className="text-xl font-extrabold text-foreground tracking-tight">{m.value}</div>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-[10px] text-muted-foreground line-clamp-1">{m.subtitle}</p>
                  <Link href={m.href} className="text-[10px] text-gas-600 font-semibold hover:underline shrink-0">
                    View →
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* 9 Modules Navigation Hub */}
      <div>
        <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Package className="h-4 w-4 text-gas-600" /> Administrative Governance Modules (9)
          </span>
          <span className="text-[11px] font-normal text-muted-foreground">Search • Filter • Detail Dossiers • Approval Workflows</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {adminModules.map((mod) => (
            <Link key={mod.title} href={mod.href} className="group">
              <Card className="h-full border hover:border-gas-300 hover:shadow-md transition-all">
                <CardContent className="p-4 flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-gas-50 rounded-md border border-gas-200 group-hover:bg-gas-600 group-hover:text-white transition-colors">
                        <mod.icon className="h-4 w-4 text-gas-700 group-hover:text-white" />
                      </div>
                      <span className="text-xs font-bold tracking-wider text-foreground group-hover:text-gas-700">
                        {mod.title}
                      </span>
                    </div>
                    <div className="text-sm font-semibold text-gas-900 mt-1">{mod.count}</div>
                    <p className="text-[11px] text-muted-foreground leading-snug">{mod.desc}</p>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-gas-600 shrink-0 mt-1" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Two Column Section: Recent Audit Trail & Recent Users */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Immutable Audit Log Stream */}
        <Card className="shadow-sm">
          <CardHeader className="py-4 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <History className="h-4 w-4 text-amber-600" /> Sensitive Administrative Audit Trail
              </CardTitle>
              <CardDescription className="text-xs">
                Append-only record of authorized mutations across users, commissions, and orders.
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-[10px]">
              Security Guard
            </Badge>
          </CardHeader>
          <CardContent className="p-0">
            {recentAuditLogs.length === 0 ? (
              <div className="text-center py-8 text-xs text-muted-foreground">
                No administrative actions logged yet.
              </div>
            ) : (
              <div className="divide-y text-xs">
                {recentAuditLogs.map((log) => (
                  <div key={log.id} className="p-3 flex items-center justify-between hover:bg-muted/10">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-[10px] font-mono">
                          {log.action}
                        </Badge>
                        <span className="text-muted-foreground text-[11px] font-mono">
                          {log.resource} #{log.resourceId ? log.resourceId.slice(-6) : "N/A"}
                        </span>
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        Actor: <span className="font-semibold text-foreground">{log.user?.email || "System/Admin"}</span>
                      </div>
                    </div>
                    <div className="text-[10px] text-muted-foreground text-right">
                      {new Date(log.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                      <div className="text-[9px]">{new Date(log.createdAt).toLocaleDateString("en-IN", { dateStyle: "short" })}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Registered Affiliates */}
        <Card className="shadow-sm">
          <CardHeader className="py-4 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-600" /> Latest Affiliate Registrations
              </CardTitle>
              <CardDescription className="text-xs">
                Recently created member accounts in MariaDB &apos;gas_mvp&apos; database.
              </CardDescription>
            </div>
            <Button size="sm" variant="ghost" asChild className="text-xs text-gas-600 h-7 px-2">
              <Link href="/admin/users">Manage Users <ArrowUpRight className="ml-1 h-3 w-3" /></Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y text-xs">
              {recentUsers.map((u) => (
                <div key={u.id} className="p-3 flex items-center justify-between hover:bg-muted/10">
                  <div className="space-y-0.5">
                    <div className="font-semibold text-foreground">
                      {u.profile?.firstName ? `${u.profile.firstName} ${u.profile.lastName}` : "Member"}
                    </div>
                    <div className="text-[11px] text-muted-foreground">{u.email}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="text-[10px] bg-gas-50 border border-gas-200 text-gas-800 px-1.5 py-0.5 rounded font-mono font-bold">
                      {u.referralCode}
                    </code>
                    <Badge variant={u.status === "ACTIVE" ? "default" : "outline"} className="text-[10px]">
                      {u.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}