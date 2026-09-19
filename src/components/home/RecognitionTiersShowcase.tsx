"use client"

import { useState } from "react"
import Link from "next/link"

import { Award, Trophy, Compass, Sparkles, Users, Star, ArrowRight, Shield } from "lucide-react"
import { BorderBeam } from "@/components/ui/border-beam"

export function RecognitionTiersShowcase() {

  const [selectedTier, setSelectedTier] = useState<number>(2) // Default to Value Builder

  const tiers = [
    {
      id: 0,
      name: "Explorer",
      pointsRange: "0 – 49 Pts",
      icon: Compass,
      badge: "🌱 Baseline Pioneer",
      color: "from-slate-500 to-slate-700",
      accent: "text-slate-500 dark:text-slate-400",
      border: "border-slate-400",
      bg: "bg-slate-500/10",
      qualifications: "Complete profile (+10 pts) and foundational V2V™ ethics curriculum (+10 pts).",
      benefits: [
        "Unique personal referral identity (/r/USER-ID)",
        "Real-time click & attribution tracking",
        "Community forum participation",
      ],
    },
    {
      id: 1,
      name: "Contributor",
      pointsRange: "50 – 149 Pts",
      icon: Sparkles,
      badge: "✨ Verified Creator",
      color: "from-emerald-500 to-teal-700",
      accent: "text-emerald-500 dark:text-emerald-400",
      border: "border-emerald-500",
      bg: "bg-emerald-500/10",
      qualifications: "Achieve first successful referral (+20 pts) or get your first community idea approved (+25 pts).",
      benefits: [
        "All Explorer privileges",
        "Submission privileges for V2V™ Ideas & Feedback",
        "Contributor profile verification badge",
      ],
    },
    {
      id: 2,
      name: "Value Builder",
      pointsRange: "150 – 349 Pts",
      icon: Star,
      badge: "⚡ Engine Driver",
      color: "from-blue-500 to-indigo-700",
      accent: "text-blue-500 dark:text-blue-400",
      border: "border-blue-500",
      bg: "bg-blue-500/10",
      qualifications: "Demonstrate sustained value through multiple confirmed orders and educational tutorials.",
      benefits: [
        "All Contributor privileges",
        "Priority administrative review of submitted contributions",
        "Early access to new marketplace offers",
        "Value Builder status mark on ledger",
      ],
    },
    {
      id: 3,
      name: "Community Builder",
      pointsRange: "350 – 699 Pts",
      icon: Users,
      badge: "🏆 Ecosystem Pillar",
      color: "from-purple-500 to-pink-700",
      accent: "text-purple-500 dark:text-purple-400",
      border: "border-purple-500",
      bg: "bg-purple-500/10",
      qualifications: "Consistent high-volume referrals, top-rated idea approvals, and active community peer support.",
      benefits: [
        "All Value Builder privileges",
        "Featured member spotlight across user dashboard",
        "Expedited commission disbursement processing",
        "Invitation to private creator advisory calls",
      ],
    },
    {
      id: 4,
      name: "GAS Champion",
      pointsRange: "700+ Pts",
      icon: Trophy,
      badge: "👑 Sovereign Champion",
      color: "from-amber-500 to-yellow-600",
      accent: "text-amber-500 dark:text-amber-400",
      border: "border-amber-500",
      bg: "bg-amber-500/10",
      qualifications: "Elite standing achieved through peak value contribution and exceptional ethical referral leadership.",
      benefits: [
        "Highest ecosystem prestige badge",
        "Direct communication channel with core leadership",
        "Exclusive campaign bonus allocations",
        "Immutable recognition honor roll entry",
      ],
    },
  ]

  const active = tiers[selectedTier]
  const ActiveIcon = active.icon

  return (
    <section className="py-20 bg-muted/30 border-b border-border/60">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-gas-100 dark:bg-gas-950/80 text-gas-700 dark:text-gas-300 text-xs font-bold uppercase tracking-wider mb-3">
            <Award className="h-3.5 w-3.5" />
            Progression Roadmap
          </div>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
            The 5 Progressive Recognition Tiers
          </h2>
          <p className="mt-2 text-sm sm:text-base text-muted-foreground">
            In GAS™, recognition cannot be purchased with money. It is earned step-by-step through real value creation recorded on an immutable ledger.
          </p>
        </div>

        {/* Milestone Steps Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-10">
          {tiers.map((t, idx) => {
            const Icon = t.icon
            const isCurrent = selectedTier === idx
            return (
              <button
                key={t.name}
                onClick={() => setSelectedTier(idx)}
                className={`flex flex-col items-center p-4 rounded-xl text-center transition-all duration-200 border ${
                  isCurrent
                    ? "bg-card shadow-lg border-gas-500 ring-2 ring-gas-500/20 scale-[1.02]"
                    : "bg-card/50 hover:bg-card border-border/60 hover:border-border"
                }`}
              >
                <div className={`h-10 w-10 rounded-xl ${t.bg} flex items-center justify-center mb-2`}>
                  <Icon className={`h-5 w-5 ${t.accent}`} />
                </div>
                <span className="font-bold text-xs sm:text-sm text-foreground">{t.name}</span>
                <span className="text-[11px] font-mono text-muted-foreground mt-0.5">{t.pointsRange}</span>
              </button>
            )
          })}
        </div>

        {/* Tier Details Card */}
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-xl p-6 sm:p-10">
          <BorderBeam size={300} duration={12} colorFrom="#f59e0b" colorTo="#8b5cf6" />
          <div className="grid lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-6">
              <div className="flex flex-wrap items-center gap-3">
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${active.bg} ${active.accent} border ${active.border}`}>
                  {active.badge}
                </span>
                <span className="text-xs font-mono text-muted-foreground">
                  Threshold: <strong className="text-foreground">{active.pointsRange}</strong>
                </span>
              </div>

              <div>
                <h3 className="text-2xl sm:text-3xl font-black text-foreground">
                  Tier {selectedTier + 1}: {active.name}
                </h3>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                  <strong className="text-foreground">How to qualify:</strong> {active.qualifications}
                </p>
              </div>

              <div className="space-y-2.5 pt-2">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-mono">
                  Unlocked Platform Privileges:
                </span>
                <div className="grid sm:grid-cols-2 gap-2.5">
                  {active.benefits.map((b) => (
                    <div key={b} className="flex items-center gap-2 text-xs text-foreground bg-muted/40 p-2.5 rounded-lg border border-border/60">
                      <Shield className="h-3.5 w-3.5 text-gas-600 dark:text-gas-400 shrink-0" />
                      <span>{b}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 flex flex-col items-center justify-center p-8 rounded-2xl bg-gradient-to-b from-muted/80 to-muted/30 border border-border text-center space-y-4">
              <div className={`h-20 w-20 rounded-2xl ${active.bg} flex items-center justify-center shadow-lg`}>
                <ActiveIcon className={`h-10 w-10 ${active.accent}`} />
              </div>
              <div>
                <div className="text-lg font-black text-foreground">{active.name} Standing</div>
                <div className="text-xs text-muted-foreground mt-0.5">Automated Rule Engine Verification</div>
              </div>
              <Link
                href="/register"
                className="w-full text-center py-2.5 px-4 rounded-xl bg-gas-600 hover:bg-gas-700 text-white text-xs font-bold shadow-md transition-colors flex items-center justify-center gap-1.5"
              >
                Join & Climb Tiers <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
