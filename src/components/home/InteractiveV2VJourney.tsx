"use client"

import { useState } from "react"
import Link from "next/link"

import {
  BookOpen,
  DollarSign,
  Sparkles,
  Award,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Zap,
  TrendingUp,
  Share2,
} from "lucide-react"
import { BorderBeam } from "@/components/ui/border-beam"
import { AnimatedV2VLoop, AnimatedShield, AnimatedRupee, AnimatedTrophy, AnimatedIdea } from "@/components/ui/motion-icons"

export function InteractiveV2VJourney() {

  const [activeTab, setActiveTab] = useState<"learn" | "earn" | "create" | "recognise">("learn")

  const stages = [
    {
      id: "learn" as const,
      step: "01",
      title: "LEARN",
      shortDesc: "Affiliate Ethics & Foundation",
      icon: BookOpen,
      color: "from-blue-500 to-indigo-600",
      accent: "text-blue-600 dark:text-blue-400",
      border: "border-blue-500",
      bg: "bg-blue-500/10",
      headline: "Master Sustainable Value Creation & Compliance",
      summary:
        "Begin by completing the foundational GAS™ ethics and V2V™ modules. Discover how direct affiliate attribution operates, understand verified commerce guidelines, and earn your first +10 Recognition Points.",
      features: [
        "Interactive Foundation Curriculum with zero fluff",
        "Clear compliance rules: Single-Tier direct only (Anti-MLM)",
        "Instant +10 Points Ledger credit upon completion",
        "Access to verified marketing resources and creatives",
      ],
      ctaText: "Explore Learning Modules",
      ctaLink: "/learn",
      previewSnippet: {
        badge: "Curriculum Complete",
        points: "+10 Pts Added",
        status: "Verified Explorer",
      },
    },
    {
      id: "earn" as const,
      step: "02",
      title: "EARN",
      shortDesc: "Direct Referral Attribution",
      icon: DollarSign,
      color: "from-emerald-500 to-teal-600",
      accent: "text-emerald-600 dark:text-emerald-400",
      border: "border-emerald-500",
      bg: "bg-emerald-500/10",
      headline: "Real Cash Commissions on Verified Purchases",
      summary:
        "Share verified catalog products using your unique direct referral identity. When customers purchase, commissions are calculated server-side, approved through administrative audit, and paid with real bank UTR references.",
      features: [
        "Unique direct link: /r/[YOUR_CODE] with click tracking",
        "Automated qualification: Anti-self referral protection",
        "Clear lifecycle: PENDING → APPROVED → PAID",
        "Direct bank/UPI disbursement with tamper-proof logs",
      ],
      ctaText: "Browse Active Offers",
      ctaLink: "/offers",
      previewSnippet: {
        badge: "Direct Attribution",
        points: "₹450 Commission",
        status: "UTR: CMS8829104",
      },
    },
    {
      id: "create" as const,
      step: "03",
      title: "CREATE VALUE",
      shortDesc: "V2V™ Community Contributions",
      icon: Sparkles,
      color: "from-purple-500 to-pink-600",
      accent: "text-purple-600 dark:text-purple-400",
      border: "border-purple-500",
      bg: "bg-purple-500/10",
      headline: "Contribute Ideas, Improvements & Tutorials",
      summary:
        "GAS™ values your insight. Submit product suggestions, feature feedback, community resources, or case studies through the V2V™ engine. High-value contributions are approved and rewarded with points.",
      features: [
        "Structured submissions: Ideas, Feedback, Content & Guides",
        "Administrative review with personalized feedback",
        "Earn up to +50 Recognition Points per approved idea",
        "Featured spotlight on community bulletin",
      ],
      ctaText: "Submit a Contribution",
      ctaLink: "/contribute",
      previewSnippet: {
        badge: "Idea Approved",
        points: "+50 Pts Credited",
        status: "Peer Reviewed",
      },
    },
    {
      id: "recognise" as const,
      step: "04",
      title: "GET RECOGNISED",
      shortDesc: "Ledger Standing & Badges",
      icon: Award,
      color: "from-amber-500 to-orange-600",
      accent: "text-amber-600 dark:text-amber-400",
      border: "border-amber-500",
      bg: "bg-amber-500/10",
      headline: "Ascend Progressive Recognition Tiers",
      summary:
        "Every single action credits an immutable points ledger. Advance from Explorer to Contributor, Value Builder, Community Builder, and ultimately GAS Champion, unlocking ecosystem badges and authority.",
      features: [
        "Double-entry style immutable points ledger",
        "5 progressive milestone tiers with automated qualification",
        "Collectible profile badges and verification marks",
        "Priority support, campaign invites, and platform prestige",
      ],
      ctaText: "View Recognition Tiers",
      ctaLink: "/recognition",
      previewSnippet: {
        badge: "Tier Unlocked",
        points: "Standing: Value Builder",
        status: "Badge Awarded",
      },
    },
  ]

  const current = stages.find((s) => s.id === activeTab) || stages[0]
  const CurrentIcon = current.icon

  return (
    <section className="py-24 bg-gradient-to-b from-background via-muted/30 to-background border-y border-border/40">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-gas-100 dark:bg-gas-950/80 border border-gas-200 dark:border-gas-800/80 text-gas-700 dark:text-gas-300 text-xs font-bold tracking-wide uppercase mb-4">
            <Sparkles className="h-3.5 w-3.5" />
            The V2V™ Lifecycle Journey
          </div>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
            Learn. Earn. Create Value. Get Recognised.
          </h2>
          <p className="mt-3 text-base sm:text-lg text-muted-foreground">
            A virtuous cycle engineered for reciprocal value exchange. Select a stage to explore how every action compounds inside the GAS™ ecosystem.
          </p>
        </div>

        {/* Interactive Tab Navigation */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-10">
          {stages.map((stage) => {
            const Icon = stage.icon
            const isSelected = activeTab === stage.id
            return (
              <button
                key={stage.id}
                onClick={() => setActiveTab(stage.id)}
                className={`relative flex flex-col items-start p-4 rounded-xl text-left transition-all duration-200 border ${
                  isSelected
                    ? "bg-card shadow-lg border-gas-500 ring-2 ring-gas-500/20"
                    : "bg-muted/40 hover:bg-muted/80 border-border/60 hover:border-border"
                }`}
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <span className={`text-[10px] font-mono font-bold tracking-widest ${isSelected ? stage.accent : "text-muted-foreground"}`}>
                    {stage.step}
                  </span>
                  <div className={`p-1.5 rounded-lg ${isSelected ? stage.bg : "bg-muted"}`}>
                    <Icon className={`h-4 w-4 ${isSelected ? stage.accent : "text-muted-foreground"}`} />
                  </div>
                </div>
                <span className="font-bold text-sm sm:text-base text-foreground">
                  {stage.title}
                </span>
                <span className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                  {stage.shortDesc}
                </span>
                {isSelected && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-gas-600 to-emerald-500 rounded-b-xl" />
                )}
              </button>
            )
          })}
        </div>

        {/* Active Stage Interactive Showcase */}
        <div className="relative overflow-hidden bg-card rounded-2xl border border-border shadow-xl p-6 sm:p-10 transition-all duration-300">
          <BorderBeam size={320} duration={14} colorFrom="#2563eb" colorTo="#10b981" />
          <div className="grid lg:grid-cols-12 gap-8 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 text-xs font-bold font-mono tracking-wider uppercase px-3 py-1 rounded-md bg-muted text-muted-foreground">
                <CurrentIcon className={`h-4 w-4 ${current.accent}`} />
                Stage {current.step} Focus
              </div>

              <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                {current.headline}
              </h3>

              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                {current.summary}
              </p>

              <div className="grid sm:grid-cols-2 gap-3 pt-2">
                {current.features.map((feat) => (
                  <div key={feat} className="flex items-start gap-2 text-xs text-foreground/90">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4 flex flex-wrap gap-4">
                <Link
                  href={current.ctaLink}
                  className="inline-flex items-center gap-2 rounded-lg bg-gas-600 hover:bg-gas-700 text-white px-6 py-2.5 text-sm font-semibold shadow-md transition-colors"
                >
                  {current.ctaText} <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 rounded-lg border border-border hover:bg-muted px-5 py-2.5 text-sm font-semibold text-foreground transition-colors"
                >
                  Join the Ecosystem
                </Link>
              </div>
            </div>

            {/* Right Interactive Simulation Widget */}
            <div className="lg:col-span-5">
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-6 shadow-2xl text-slate-200 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gas-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-mono font-semibold text-slate-400">GAS™ Engine Live Simulation</span>
                  </div>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    Stage {current.step}
                  </span>
                </div>

                <div className="py-6 space-y-4">
                  <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <span className="text-xs text-slate-400">Action Type</span>
                    <span className="text-xs font-bold text-slate-200">{current.title} Activity</span>
                  </div>
                  <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <span className="text-xs text-slate-400">Status Output</span>
                    <span className="text-xs font-bold text-emerald-400">{current.previewSnippet.badge}</span>
                  </div>
                  <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <span className="text-xs text-slate-400">Ledger Reward</span>
                    <span className="text-xs font-bold font-mono text-gas-400">{current.previewSnippet.points}</span>
                  </div>
                  <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <span className="text-xs text-slate-400">Verification</span>
                    <span className="text-xs font-mono text-slate-400">{current.previewSnippet.status}</span>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-800/80">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5 text-gas-400" /> Tamper-Proof Audit Trail
                  </span>
                  <span>MariaDB v2v_engine</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
