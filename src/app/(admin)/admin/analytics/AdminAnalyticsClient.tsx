"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  BarChart3,
  TrendingUp,
  Users,
  ShoppingCart,
  DollarSign,
  Share2,
  CheckCircle2,
  Sparkles,
  Award,
  ArrowRight,
  Activity,
  Filter,
  Layers,
  ArrowUpRight
} from "lucide-react"

interface AnalyticsData {
  timeframe: string
  funnel: {
    totalClicks: number
    totalUsers: number
    totalOrders: number
    paidOrdersCount: number
    totalReferrals: number
    qualifiedReferrals: number
    rates: {
      clickToRegRate: string
      regToOrderRate: string
      orderToQualifyRate: string
      overallFunnelRate: string
    }
  }
  financials: {
    grossSales: number
    totalCommissions: number
    paidCommissions: number
    pendingCommissions: number
    commissionsCount: number
    avgOrderValue: number
  }
  v2v: {
    totalContributions: number
    approvedContributions: number
    approvalRate: number
    categoryBreakdown: Array<{ category: string; count: number }>
  }
  recognition: {
    totalPoints: number
    levels: Array<{ id: string; name: string; minPoints: number; maxPoints: number | null }>
  }
  recentActivity: Array<{
    id: string
    event: string
    entityType: string | null
    createdAt: string | Date
    user: { email: string; referralCode: string } | null
  }>
}

export default function AdminAnalyticsClient({ initialData }: { initialData: AnalyticsData }) {
  const [data, setData] = useState<AnalyticsData>(initialData)
  const [timeframe, setTimeframe] = useState<string>("all")
  const [loading, setLoading] = useState(false)

  const handleTimeframeChange = async (tf: string) => {
    setTimeframe(tf)
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/analytics?timeframe=${tf}`)
      const json = await res.json()
      if (json.success) {
        setData(json)
      }
    } catch (err) {
      console.error("Failed to load analytics:", err)
    } finally {
      setLoading(false)
    }
  }

  const { funnel, financials, v2v, recognition, recentActivity } = data

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">System Analytics & Conversion Funnel</h1>
          <p className="text-sm text-muted-foreground">
            End-to-end affiliate conversion telemetry, financial performance, and V2V™ community analytics.
          </p>
        </div>

        {/* Timeframe Filter */}
        <div className="flex items-center gap-1.5 bg-muted/40 p-1 rounded-lg border">
          {[
            { label: "All Time", value: "all" },
            { label: "Last 30 Days", value: "30d" },
            { label: "Last 7 Days", value: "7d" },
          ].map((tf) => (
            <Button
              key={tf.value}
              size="sm"
              variant={timeframe === tf.value ? "default" : "ghost"}
              onClick={() => handleTimeframeChange(tf.value)}
              disabled={loading}
              className={`text-xs h-7 px-3 ${timeframe === tf.value ? "bg-gas-600 hover:bg-gas-700" : ""}`}
            >
              {tf.label}
            </Button>
          ))}
        </div>
      </div>

      {/* CONVERSION FUNNEL */}
      <Card className="border-gas-200 shadow-sm">
        <CardHeader className="py-4">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-gas-600" /> Complete Conversion Funnel
          </CardTitle>
          <CardDescription className="text-xs">
            From promotional link click to member registration, order checkout, and affiliate qualification.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {/* Step 1 */}
            <div className="p-4 bg-muted/30 border rounded-xl relative">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Step 1</span>
                <Share2 className="h-4 w-4 text-blue-600" />
              </div>
              <div className="text-2xl font-extrabold text-foreground mt-2">{funnel.totalClicks.toLocaleString()}</div>
              <div className="text-xs font-semibold text-foreground">Link Clicks Recorded</div>
              <p className="text-[11px] text-muted-foreground mt-0.5">Top of funnel telemetry</p>
            </div>

            {/* Step 2 */}
            <div className="p-4 bg-muted/30 border rounded-xl relative">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Step 2</span>
                <Users className="h-4 w-4 text-indigo-600" />
              </div>
              <div className="text-2xl font-extrabold text-foreground mt-2">{funnel.totalUsers.toLocaleString()}</div>
              <div className="text-xs font-semibold text-foreground">Registered Members</div>
              <Badge variant="outline" className="mt-1 text-[10px] bg-indigo-50 text-indigo-700 border-indigo-200">
                {funnel.rates.clickToRegRate}% Click-to-Reg
              </Badge>
            </div>

            {/* Step 3 */}
            <div className="p-4 bg-muted/30 border rounded-xl relative">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Step 3</span>
                <ShoppingCart className="h-4 w-4 text-purple-600" />
              </div>
              <div className="text-2xl font-extrabold text-foreground mt-2">{funnel.paidOrdersCount.toLocaleString()}</div>
              <div className="text-xs font-semibold text-foreground">Paid Purchases</div>
              <Badge variant="outline" className="mt-1 text-[10px] bg-purple-50 text-purple-700 border-purple-200">
                {funnel.rates.regToOrderRate}% Reg-to-Order
              </Badge>
            </div>

            {/* Step 4 */}
            <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-xl relative">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">Step 4 (Goal)</span>
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-extrabold text-emerald-950 mt-2">{funnel.qualifiedReferrals.toLocaleString()}</div>
              <div className="text-xs font-semibold text-emerald-900">Qualified Direct Referrals</div>
              <Badge variant="outline" className="mt-1 text-[10px] bg-emerald-100 text-emerald-800 border-emerald-300">
                {funnel.rates.overallFunnelRate}% Overall Conversion
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* FINANCIAL OVERVIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-sm">
          <CardHeader className="py-4">
            <CardTitle className="text-base flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-amber-600" /> Financial Performance
            </CardTitle>
            <CardDescription className="text-xs">
              Gross sales revenue, affiliate commissions incurred, and payout metrics.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 bg-muted/20 border rounded-lg">
                <div className="text-[10px] uppercase text-muted-foreground font-semibold">Gross Sales Revenue</div>
                <div className="text-xl font-bold text-foreground mt-1">₹{financials.grossSales.toLocaleString()}</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">Average Order: ₹{financials.avgOrderValue}</div>
              </div>

              <div className="p-3.5 bg-muted/20 border rounded-lg">
                <div className="text-[10px] uppercase text-muted-foreground font-semibold">Total Commissions</div>
                <div className="text-xl font-bold text-gas-700 mt-1">₹{financials.totalCommissions.toFixed(2)}</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">{financials.commissionsCount} allocations</div>
              </div>
            </div>

            <div className="p-3.5 border rounded-lg bg-teal-50/40 space-y-2 text-xs">
              <div className="flex items-center justify-between font-semibold">
                <span className="text-teal-900">Disbursed Payouts:</span>
                <span className="text-teal-950 font-bold">₹{financials.paidCommissions.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between font-semibold">
                <span className="text-amber-900">Pending Approval:</span>
                <span className="text-amber-950 font-bold">₹{financials.pendingCommissions.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* V2V & COMMUNITY ENGAGEMENT */}
        <Card className="shadow-sm">
          <CardHeader className="py-4">
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-rose-600" /> V2V™ Value & Recognition
            </CardTitle>
            <CardDescription className="text-xs">
              Community contributions and recognition points ledger velocity.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 bg-rose-50/40 border border-rose-200 rounded-lg">
                <div className="text-[10px] uppercase text-rose-800 font-semibold">V2V™ Approval Rate</div>
                <div className="text-xl font-bold text-rose-950 mt-1">{v2v.approvalRate}%</div>
                <div className="text-[11px] text-rose-700 mt-0.5">{v2v.approvedContributions} of {v2v.totalContributions} approved</div>
              </div>

              <div className="p-3.5 bg-purple-50/40 border border-purple-200 rounded-lg">
                <div className="text-[10px] uppercase text-purple-800 font-semibold">Recognition Points Awarded</div>
                <div className="text-xl font-bold text-purple-950 mt-1">{recognition.totalPoints.toLocaleString()}</div>
                <div className="text-[11px] text-purple-700 mt-0.5">Across {recognition.levels.length} milestone tiers</div>
              </div>
            </div>

            {/* Category Breakdown */}
            <div className="space-y-1.5">
              <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Submissions by Category
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {v2v.categoryBreakdown.map((cat) => (
                  <div key={cat.category} className="p-2 border rounded bg-muted/10 text-center">
                    <div className="font-bold text-foreground">{cat.count}</div>
                    <div className="text-[9px] uppercase text-muted-foreground truncate">{cat.category.replace(/_/g, " ")}</div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* LIVE TELEMETRY ACTIVITY STREAM */}
      <Card className="shadow-sm">
        <CardHeader className="py-4">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Activity className="h-4 w-4 text-gas-600" /> Platform Event Telemetry Stream
          </CardTitle>
          <CardDescription className="text-xs">
            Recent high-volume events logged in MariaDB &apos;activity_logs&apos; table.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y text-xs">
            {recentActivity.map((a) => (
              <div key={a.id} className="p-3 flex items-center justify-between hover:bg-muted/10">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] font-mono">
                      {a.event}
                    </Badge>
                    {a.entityType && (
                      <span className="text-muted-foreground text-[11px]">Entity: {a.entityType}</span>
                    )}
                  </div>
                  {a.user && (
                    <div className="text-[11px] text-muted-foreground">
                      User: <span className="font-medium text-foreground">{a.user.email}</span> ({a.user.referralCode})
                    </div>
                  )}
                </div>
                <div className="text-[10px] text-muted-foreground text-right">
                  {new Date(a.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
