"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Trophy,
  Award,
  Users,
  Gift,
  Sparkles,
  Share2,
  Copy,
  Check,
  ArrowRight,
  BookOpen,
  ShoppingBag,
  ExternalLink,
  Activity,
  CheckCircle2,
  Clock,
  Lock,
  Compass,
  ArrowUpRight,
  ShieldCheck,
  TrendingUp,
} from "lucide-react"

export interface DashboardData {
  user: {
    id: string
    email: string
    referralCode: string
    role: string
    status: string
    createdAt: string | Date
    profile: {
      firstName: string | null
      lastName: string | null
      mobile: string | null
      city: string | null
      state: string | null
      isComplete: boolean
    } | null
  }
  recognition: {
    totalPoints: number
    currentLevel: {
      name: string
      description: string | null
      minPoints: number
      maxPoints: number | null
      order: number
    }
    nextLevel: {
      name: string
      minPoints: number
      pointsNeeded: number
    } | null
    progressPercentage: number
    badges: Array<{
      id: string
      name: string
      description: string | null
      condition: string | null
      isEarned: boolean
      earnedAt: Date | string | null
    }>
  }
  referrals: {
    totalCount: number
    successfulCount: number
    conversionRate: number
    clickCount: number
    recent: Array<{
      id: string
      status: string
      registeredAt: Date | string | null
      qualifiedAt: Date | string | null
      referredUserEmail: string
    }>
  }
  earnings: {
    eligibleTotal: number
    pendingTotal: number
    paidTotal: number
    commissionsCount: number
    recent: Array<{
      id: string
      amount: number
      status: string
      createdAt: Date | string
    }>
  }
  contributions: {
    totalCount: number
    approvedCount: number
    pendingCount: number
    approvalRate: number
    recent: Array<{
      id: string
      title: string
      category: string
      status: string
      pointsAwarded: number | null
      adminNote: string | null
      createdAt: Date | string
    }>
  }
  learning: {
    isCompleted: boolean
    completedAt: Date | string | null
  }
  offers: Array<{
    id: string
    name: string
    slug: string
    price: number
    category: string
    commissionText: string
  }>
  activity: Array<{
    id: string
    event: string
    entityType: string | null
    metadata: any
    createdAt: Date | string
  }>
}

export default function DashboardClient({ data }: { data: DashboardData }) {
  const [activeSection, setActiveSection] = useState<"learn" | "offers" | "refer" | "create_value" | "recognition" | "activity">("refer")
  const [copiedLink, setCopiedLink] = useState(false)
  const [copiedCode, setCopiedCode] = useState(false)

  const { user, recognition, referrals, earnings, contributions, learning, offers, activity } = data
  const displayName = user.profile?.firstName
    ? `${user.profile.firstName} ${user.profile.lastName || ""}`.trim()
    : user.email.split("@")[0]

  const referralUrl = typeof window !== "undefined"
    ? `${window.location.origin}/r/${user.referralCode}`
    : `http://localhost:3000/r/${user.referralCode}`

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralUrl)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }

  const handleCopyCode = () => {
    navigator.clipboard.writeText(user.referralCode)
    setCopiedCode(true)
    setTimeout(() => setCopiedCode(false), 2000)
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl space-y-8">
      {/* 1. WELCOME BANNER */}
      <div className="bg-gradient-to-r from-gas-900 via-gas-800 to-emerald-950 text-white p-6 sm:p-8 rounded-2xl shadow-xl border border-gas-800 relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-xs px-2.5 py-0.5 font-semibold">
                Tier {recognition.currentLevel.order}: {recognition.currentLevel.name}
              </Badge>
              {user.role === "SUPER_ADMIN" && (
                <Badge className="bg-amber-400 text-amber-950 text-xs font-bold">Super Admin</Badge>
              )}
              {user.role === "ADMIN" && (
                <Badge className="bg-blue-400 text-blue-950 text-xs font-bold">Admin</Badge>
              )}
              <Badge variant="outline" className={`text-xs ${user.status === "ACTIVE" ? "border-emerald-400/40 text-emerald-300" : "border-red-400/40 text-red-300"}`}>
                {user.status}
              </Badge>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Welcome back, {displayName}!
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-xl leading-relaxed">
              Grand Affiliate System V2V™ Command Center. Track your earnings, share verified solutions, and earn community recognition.
            </p>
          </div>

          {/* Quick Actions & Referral Link Share */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0 w-full md:w-auto">
            <Button
              onClick={handleCopyLink}
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold gap-1.5 shadow-sm"
            >
              {copiedLink ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copiedLink ? "Link Copied!" : "Copy Referral Link"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              asChild
              className="border-white/20 text-white hover:bg-white/10 text-xs"
            >
              <Link href="/contribute">
                <Sparkles className="h-3.5 w-3.5 mr-1 text-emerald-400" /> Create Value
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* 2. TOP METRICS / KPI GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Recognition Points & Standing */}
        <Card className="shadow-xs border hover:border-gas-300 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Recognition Standing
            </CardTitle>
            <Trophy className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-foreground flex items-baseline gap-2">
              <span>{recognition.totalPoints}</span>
              <span className="text-xs font-normal text-muted-foreground">pts</span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-muted-foreground mt-1.5 pt-1.5 border-t">
              <span>Level: <strong className="text-foreground">{recognition.currentLevel.name}</strong></span>
              {recognition.nextLevel ? (
                <span className="text-emerald-700 font-medium">+{recognition.nextLevel.pointsNeeded} to next</span>
              ) : (
                <span className="text-amber-600 font-semibold">Max Tier 🏆</span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* KPI 2: Referrals & Success Rate */}
        <Card className="shadow-xs border hover:border-gas-300 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Direct Referrals
            </CardTitle>
            <Users className="h-4 w-4 text-gas-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-foreground flex items-baseline gap-2">
              <span>{referrals.totalCount}</span>
              <span className="text-xs font-normal text-muted-foreground">registered</span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-muted-foreground mt-1.5 pt-1.5 border-t">
              <span>Qualified: <strong className="text-foreground">{referrals.successfulCount}</strong></span>
              <span className="text-gas-700 font-semibold font-mono">{referrals.conversionRate}% conv.</span>
            </div>
          </CardContent>
        </Card>

        {/* KPI 3: Eligible Earnings */}
        <Card className="shadow-xs border hover:border-gas-300 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Eligible Earnings
            </CardTitle>
            <Gift className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-foreground">
              ₹{earnings.eligibleTotal.toFixed(2)}
            </div>
            <div className="flex items-center justify-between text-[11px] text-muted-foreground mt-1.5 pt-1.5 border-t">
              <span>Pending: <strong>₹{earnings.pendingTotal.toFixed(2)}</strong></span>
              <span>Paid: <strong>₹{earnings.paidTotal.toFixed(2)}</strong></span>
            </div>
          </CardContent>
        </Card>

        {/* KPI 4: V2V Contributions */}
        <Card className="shadow-xs border hover:border-gas-300 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Value Contributions
            </CardTitle>
            <Sparkles className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-foreground flex items-baseline gap-2">
              <span>{contributions.totalCount}</span>
              <span className="text-xs font-normal text-muted-foreground">submitted</span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-muted-foreground mt-1.5 pt-1.5 border-t">
              <span>Approved: <strong className="text-emerald-700">{contributions.approvedCount}</strong></span>
              <span className="text-purple-700 font-semibold font-mono">{contributions.approvalRate}% rate</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. SECTION NAVIGATION PILLS */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2 border-b pb-3">
          {[
            { id: "refer", label: "REFER", icon: Share2, count: referrals.totalCount },
            { id: "offers", label: "OFFERS", icon: ShoppingBag, count: offers.length },
            { id: "create_value", label: "CREATE VALUE", icon: Sparkles, count: contributions.totalCount },
            { id: "recognition", label: "RECOGNITION", icon: Award, count: `${recognition.totalPoints} pts` },
            { id: "learn", label: "LEARN", icon: BookOpen, count: learning.isCompleted ? "Completed" : "Start" },
            { id: "activity", label: "ACTIVITY", icon: Activity, count: activity.length },
          ].map((sec) => (
            <button
              key={sec.id}
              onClick={() => setActiveSection(sec.id as any)}
              className={`flex items-center gap-2 text-xs font-bold px-3.5 py-2 rounded-xl transition-all ${
                activeSection === sec.id
                  ? "bg-gas-600 text-white shadow-sm"
                  : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <sec.icon className="h-3.5 w-3.5" />
              <span>{sec.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                activeSection === sec.id ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
              }`}>
                {sec.count}
              </span>
            </button>
          ))}
        </div>

        {/* SECTION 1: REFER */}
        {activeSection === "refer" && (
          <div className="space-y-6">
            <Card>
              <CardHeader className="py-4">
                <CardTitle className="text-base flex items-center gap-2">
                  <Share2 className="h-4 w-4 text-gas-600" /> My Direct Referral Engine
                </CardTitle>
                <CardDescription className="text-xs">
                  GAS™ operates on a strict single-tier direct referral model. Zero multi-level schemes or downline recruitment.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-gas-50/70 border border-gas-200 rounded-xl space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-xs font-bold text-gas-950">Your Unique Referral Identity</span>
                      <p className="text-[11px] text-gas-700">Share your direct short link to earn 10–15% commission on qualifying purchases.</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <code className="bg-white border px-2.5 py-1 rounded text-xs font-mono font-bold text-gas-800">
                        {user.referralCode}
                      </code>
                      <Button size="sm" variant="outline" onClick={handleCopyCode} className="h-8 text-xs gap-1">
                        {copiedCode ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                        {copiedCode ? "Copied" : "Copy Code"}
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      readOnly
                      value={referralUrl}
                      className="w-full bg-white border border-gas-200 rounded-lg px-3 py-2 text-xs font-mono text-foreground focus:outline-none"
                    />
                    <Button
                      size="sm"
                      onClick={handleCopyLink}
                      className="bg-gas-600 hover:bg-gas-700 text-white text-xs h-9 px-4 shrink-0 font-semibold"
                    >
                      {copiedLink ? <Check className="h-3.5 w-3.5 mr-1" /> : <Copy className="h-3.5 w-3.5 mr-1" />}
                      {copiedLink ? "Copied!" : "Copy Link"}
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 border rounded-lg text-center">
                    <div className="text-xs text-muted-foreground">Link Clicks Recorded</div>
                    <div className="text-xl font-bold mt-0.5">{referrals.clickCount}</div>
                  </div>
                  <div className="p-3 border rounded-lg text-center">
                    <div className="text-xs text-muted-foreground">Registered Users</div>
                    <div className="text-xl font-bold mt-0.5">{referrals.totalCount}</div>
                  </div>
                  <div className="p-3 border rounded-lg text-center">
                    <div className="text-xs text-muted-foreground">Qualified Purchases</div>
                    <div className="text-xl font-bold text-emerald-700 mt-0.5">{referrals.successfulCount}</div>
                  </div>
                </div>

                {/* Recent Referrals List */}
                <div className="space-y-2 pt-2">
                  <div className="text-xs font-bold text-foreground">Recent Attributed Registrations</div>
                  {referrals.recent.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground text-xs border rounded-lg border-dashed">
                      No referrals registered yet. Share your unique link above to invite your first affiliate prospect!
                    </div>
                  ) : (
                    <div className="divide-y border rounded-lg text-xs">
                      {referrals.recent.map((r) => (
                        <div key={r.id} className="p-3 flex items-center justify-between">
                          <div className="space-y-0.5">
                            <div className="font-semibold text-foreground">{r.referredUserEmail}</div>
                            <div className="text-[10px] text-muted-foreground">
                              Registered: {r.registeredAt ? new Date(r.registeredAt).toLocaleDateString("en-IN", { dateStyle: "medium" }) : "Pending"}
                            </div>
                          </div>
                          <Badge
                            variant={r.status === "QUALIFIED" ? "default" : r.status === "REJECTED" ? "destructive" : "outline"}
                            className="text-[10px]"
                          >
                            {r.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* SECTION 2: OFFERS */}
        {activeSection === "offers" && (
          <div className="space-y-4">
            <Card>
              <CardHeader className="py-4">
                <CardTitle className="text-base flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <ShoppingBag className="h-4 w-4 text-gas-600" /> Active Verified Offers
                  </span>
                  <Button size="sm" variant="ghost" asChild className="text-xs text-gas-600">
                    <Link href="/offers">View Full Catalog <ArrowRight className="ml-1 h-3 w-3" /></Link>
                  </Button>
                </CardTitle>
                <CardDescription className="text-xs">
                  High-value digital learning and software offers available for direct promotion.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {offers.length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground text-xs">
                    No active offers published at this moment. Check back shortly.
                  </div>
                ) : (
                  <div className="divide-y text-xs">
                    {offers.map((product) => (
                      <div key={product.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-muted/10 transition-colors">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-foreground">{product.name}</span>
                            <Badge variant="outline" className="text-[10px] uppercase font-mono">
                              {product.category}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 text-xs">
                            <span className="font-bold text-gas-700">₹{product.price.toFixed(2)}</span>
                            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">
                              {product.commissionText}
                            </Badge>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <Button size="sm" variant="outline" asChild className="text-xs h-8">
                            <Link href={`/offers/${product.slug || product.id}`}>
                              Details
                            </Link>
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => {
                              const productPromoUrl = `${window.location.origin}/offers/${product.slug || product.id}?ref=${user.referralCode}`
                              navigator.clipboard.writeText(productPromoUrl)
                              alert("Affiliate offer promotion link copied to clipboard!")
                            }}
                            className="bg-gas-600 hover:bg-gas-700 text-white text-xs h-8 gap-1"
                          >
                            <Share2 className="h-3 w-3" /> Share Offer
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* SECTION 3: CREATE VALUE (V2V) */}
        {activeSection === "create_value" && (
          <div className="space-y-4">
            <Card>
              <CardHeader className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-purple-600" /> V2V™ Value Creation Center
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Submit innovative proposals, platform critiques, or educational guides to earn verified points.
                  </CardDescription>
                </div>
                <Button size="sm" asChild className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold gap-1.5 shrink-0">
                  <Link href="/contribute">
                    <Sparkles className="h-3.5 w-3.5" /> Submit New Item
                  </Link>
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                {contributions.recent.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground text-xs space-y-2">
                    <Sparkles className="h-8 w-8 mx-auto text-purple-400 opacity-60" />
                    <div className="font-semibold">No value contributions submitted yet</div>
                    <p className="text-[11px] max-w-sm mx-auto">
                      Earn +25 to +50 recognition points per approved guide, tutorial, or innovation proposal.
                    </p>
                    <Button size="sm" variant="outline" asChild className="text-xs mt-2">
                      <Link href="/contribute">Create Your First Submission</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="divide-y text-xs">
                    {contributions.recent.map((c) => (
                      <div key={c.id} className="p-4 space-y-1.5 hover:bg-muted/10 transition-colors">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-foreground">{c.title}</span>
                            <Badge variant="outline" className="text-[10px] uppercase font-mono">
                              {c.category.replace(/_/g, " ")}
                            </Badge>
                          </div>
                          <Badge
                            variant={c.status === "APPROVED" ? "default" : c.status === "REJECTED" ? "destructive" : "outline"}
                            className="text-[10px]"
                          >
                            {c.status}
                          </Badge>
                        </div>

                        {c.adminNote && (
                          <div className="p-2 bg-muted/40 rounded border text-[11px] text-muted-foreground">
                            <span className="font-semibold text-foreground">Admin Feedback:</span> {c.adminNote}
                          </div>
                        )}

                        <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(c.createdAt).toLocaleDateString("en-IN", { dateStyle: "medium" })}
                          </span>
                          {c.pointsAwarded && (
                            <span className="font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                              +{c.pointsAwarded} pts awarded
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* SECTION 4: RECOGNITION */}
        {activeSection === "recognition" && (
          <div className="space-y-6">
            <Card>
              <CardHeader className="py-4">
                <CardTitle className="text-base flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-gas-600" /> Recognition Ascension & Badges
                  </span>
                  <Button size="sm" variant="ghost" asChild className="text-xs text-gas-600">
                    <Link href="/recognition">Open Recognition Hub <ArrowRight className="ml-1 h-3 w-3" /></Link>
                  </Button>
                </CardTitle>
                <CardDescription className="text-xs">
                  Points ledger balance determines standing from Explorer through GAS Champion.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Progress Bar */}
                <div className="p-4 bg-muted/20 border rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-foreground">
                      Current Standing: <strong className="text-gas-700">{recognition.currentLevel.name}</strong>
                    </span>
                    <span className="text-muted-foreground">
                      {recognition.nextLevel
                        ? `${recognition.nextLevel.pointsNeeded} pts to reach ${recognition.nextLevel.name}`
                        : "Peak Standing Achieved 🏆"}
                    </span>
                  </div>
                  <div className="w-full bg-muted h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gas-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${recognition.progressPercentage}%` }}
                    />
                  </div>
                </div>

                {/* Badges Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {recognition.badges.map((b) => (
                    <div
                      key={b.id}
                      className={`p-3 border rounded-xl flex items-start gap-2.5 ${
                        b.isEarned ? "bg-white border-gas-300 shadow-xs" : "bg-muted/20 border-dashed opacity-50"
                      }`}
                    >
                      <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${
                        b.isEarned ? "bg-gas-100 text-gas-700" : "bg-muted text-muted-foreground"
                      }`}>
                        {b.isEarned ? <Award className="h-4 w-4" /> : <Lock className="h-3.5 w-3.5" />}
                      </div>
                      <div className="space-y-0.5">
                        <div className="font-bold text-xs text-foreground">{b.name}</div>
                        <div className="text-[10px] text-muted-foreground leading-tight">{b.description}</div>
                        {b.isEarned && (
                          <span className="text-[9px] text-emerald-700 font-semibold block pt-0.5">
                            ✓ Unlocked
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* SECTION 5: LEARN */}
        {activeSection === "learn" && (
          <div className="space-y-4">
            <Card>
              <CardHeader className="py-4">
                <CardTitle className="text-base flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-indigo-600" /> V2V™ Educational Foundation
                  </span>
                  <Button size="sm" variant="ghost" asChild className="text-xs text-indigo-600">
                    <Link href="/learn">Go to Curriculum <ArrowRight className="ml-1 h-3 w-3" /></Link>
                  </Button>
                </CardTitle>
                <CardDescription className="text-xs">
                  Master the brand principle: Learn. Earn. Create Value. Get Recognised.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-indigo-50/60 border border-indigo-200 rounded-xl flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="font-bold text-sm text-indigo-950">V2V™ Ethics & Growth Curriculum</div>
                    <p className="text-xs text-indigo-700">
                      Complete the core 3-module framework to unlock +10 Recognition Points and the Learning badge.
                    </p>
                  </div>
                  <div>
                    {learning.isCompleted ? (
                      <Badge className="bg-emerald-600 text-white text-xs px-3 py-1 gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Completed (+10 pts)
                      </Badge>
                    ) : (
                      <Button size="sm" asChild className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold">
                        <Link href="/learn">Start Learning (+10 pts)</Link>
                      </Button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 border rounded-lg space-y-1">
                    <div className="font-semibold text-foreground">1. Value-to-Value Philosophy</div>
                    <p className="text-muted-foreground text-[11px]">Creating sustainable long-term affiliate equity.</p>
                  </div>
                  <div className="p-3 border rounded-lg space-y-1">
                    <div className="font-semibold text-foreground">2. Single-Tier Attribution</div>
                    <p className="text-muted-foreground text-[11px]">Honest direct attributions with zero MLM schemes.</p>
                  </div>
                  <div className="p-3 border rounded-lg space-y-1">
                    <div className="font-semibold text-foreground">3. Community Recognition</div>
                    <p className="text-muted-foreground text-[11px]">Ascending tiers from Explorer to GAS Champion.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* SECTION 6: ACTIVITY */}
        {activeSection === "activity" && (
          <div className="space-y-4">
            <Card>
              <CardHeader className="py-4">
                <CardTitle className="text-base flex items-center gap-2">
                  <Activity className="h-4 w-4 text-gas-600" /> My Activity Stream
                </CardTitle>
                <CardDescription className="text-xs">
                  Chronological event telemetry recorded strictly for your private account.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {activity.length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground text-xs">
                    No activity logs recorded yet.
                  </div>
                ) : (
                  <div className="divide-y text-xs">
                    {activity.map((ev) => (
                      <div key={ev.id} className="p-3.5 flex items-center justify-between gap-3 hover:bg-muted/10 transition-colors">
                        <div className="space-y-0.5">
                          <div className="font-semibold text-foreground flex items-center gap-2">
                            <span>{ev.event.replace(/_/g, " ")}</span>
                            {ev.entityType && (
                              <Badge variant="outline" className="text-[9px] font-mono">
                                {ev.entityType}
                              </Badge>
                            )}
                          </div>
                          {ev.metadata && (
                            <div className="text-[11px] text-muted-foreground font-mono">
                              {typeof ev.metadata === "string" ? ev.metadata : JSON.stringify(ev.metadata)}
                            </div>
                          )}
                        </div>
                        <div className="text-[10px] text-muted-foreground shrink-0 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{new Date(ev.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
