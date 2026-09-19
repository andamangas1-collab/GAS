"use client"

import { useState } from "react"
import Link from "next/link"
import { Calculator, Sparkles, TrendingUp, Award, ArrowRight, ShieldCheck } from "lucide-react"
import { BorderBeam } from "@/components/ui/border-beam"
import { AnimatedCounter } from "@/components/ui/animated-counter"


export function InteractiveCommissionCalculator() {

  const [referrals, setReferrals] = useState(8)
  const [averageOrderValue, setAverageOrderValue] = useState(2500)
  const [commissionRate, setCommissionRate] = useState(15) // 15% average
  const [contributions, setContributions] = useState(3)

  // Calculations
  const monthlyVolume = referrals * averageOrderValue
  const estimatedCommission = Math.round((monthlyVolume * commissionRate) / 100)
  
  // Recognition points calculation:
  // 10 pts baseline + 20 pts per successful referral + 25 pts per contribution + 10 pts learning
  const estimatedPoints = 10 + 10 + referrals * 20 + contributions * 25

  // Projected Tier
  const getProjectedTier = (points: number) => {
    if (points >= 700) return { name: "GAS Champion", color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/40" }
    if (points >= 350) return { name: "Community Builder", color: "text-purple-500", bg: "bg-purple-500/10", border: "border-purple-500/40" }
    if (points >= 150) return { name: "Value Builder", color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/40" }
    if (points >= 50) return { name: "Contributor", color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/40" }
    return { name: "Explorer", color: "text-slate-400", bg: "bg-slate-500/10", border: "border-slate-500/40" }
  }

  const projectedTier = getProjectedTier(estimatedPoints)

  return (
    <section className="py-20 bg-muted/40 border-y border-border/60">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gas-100 dark:bg-gas-950/80 text-gas-700 dark:text-gas-300 text-xs font-bold uppercase tracking-wider mb-3">
            <Calculator className="h-3.5 w-3.5" />
            Interactive Value Simulator
          </div>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
            Calculate Your Potential Earnings & Standing
          </h2>
          <p className="mt-2 text-sm sm:text-base text-muted-foreground">
            Simulate your monthly direct commissions and V2V™ recognition points. Real calculations backed by verified platform rules.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 items-stretch">
          {/* Controls Panel */}
          <div className="lg:col-span-7 bg-card rounded-2xl border border-border p-6 sm:p-8 shadow-sm space-y-7">
            {/* Slider 1: Referrals */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-foreground">
                  Monthly Successful Referrals
                </label>
                <span className="text-sm font-mono font-bold text-gas-600 dark:text-gas-400 px-2.5 py-0.5 rounded bg-gas-50 dark:bg-gas-950 border border-gas-200 dark:border-gas-800">
                  {referrals} orders
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="50"
                value={referrals}
                onChange={(e) => setReferrals(Number(e.target.value))}
                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-gas-600"
              />
              <div className="flex justify-between text-[11px] text-muted-foreground font-mono">
                <span>1 order</span>
                <span>25 orders</span>
                <span>50 orders</span>
              </div>
            </div>

            {/* Slider 2: Average Order Value */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-foreground">
                  Average Product Order Value
                </label>
                <span className="text-sm font-mono font-bold text-gas-600 dark:text-gas-400 px-2.5 py-0.5 rounded bg-gas-50 dark:bg-gas-950 border border-gas-200 dark:border-gas-800">
                  ₹{averageOrderValue.toLocaleString("en-IN")}
                </span>
              </div>
              <input
                type="range"
                min="500"
                max="25000"
                step="500"
                value={averageOrderValue}
                onChange={(e) => setAverageOrderValue(Number(e.target.value))}
                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-gas-600"
              />
              <div className="flex justify-between text-[11px] text-muted-foreground font-mono">
                <span>₹500</span>
                <span>₹12,500</span>
                <span>₹25,000</span>
              </div>
            </div>

            {/* Slider 3: Commission Percentage */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-foreground">
                  Average Offer Commission Rate
                </label>
                <span className="text-sm font-mono font-bold text-gas-600 dark:text-gas-400 px-2.5 py-0.5 rounded bg-gas-50 dark:bg-gas-950 border border-gas-200 dark:border-gas-800">
                  {commissionRate}%
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="30"
                step="1"
                value={commissionRate}
                onChange={(e) => setCommissionRate(Number(e.target.value))}
                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-gas-600"
              />
              <div className="flex justify-between text-[11px] text-muted-foreground font-mono">
                <span>5%</span>
                <span>15% (Typical)</span>
                <span>30%</span>
              </div>
            </div>

            {/* Slider 4: V2V Community Contributions */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-foreground">
                  Approved V2V™ Contributions & Ideas
                </label>
                <span className="text-sm font-mono font-bold text-purple-600 dark:text-purple-400 px-2.5 py-0.5 rounded bg-purple-50 dark:bg-purple-950 border border-purple-200 dark:border-purple-800">
                  {contributions} approved
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                value={contributions}
                onChange={(e) => setContributions(Number(e.target.value))}
                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-purple-600"
              />
              <div className="flex justify-between text-[11px] text-muted-foreground font-mono">
                <span>0 ideas</span>
                <span>5 ideas</span>
                <span>10 ideas</span>
              </div>
            </div>
          </div>

          {/* Results Summary Display */}
          <div className="relative overflow-hidden lg:col-span-5 rounded-2xl border border-slate-800 bg-slate-950 p-6 sm:p-8 text-white shadow-2xl flex flex-col justify-between">
            <BorderBeam size={280} duration={10} colorFrom="#10b981" colorTo="#3b82f6" />
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
                  Projected Monthly Value
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  DIRECT ATTRIBUTION
                </span>
              </div>

              {/* Cash Earnings */}
              <div className="py-6 border-b border-slate-800 space-y-1">
                <span className="text-xs text-slate-400 font-medium">Estimated Direct Earnings</span>
                <div className="text-4xl sm:text-5xl font-black tracking-tight text-emerald-400">
                  <AnimatedCounter value={estimatedCommission} prefix="₹" duration={600} />
                </div>
                <div className="text-[11px] text-slate-400 font-mono">
                  Calculated from ₹{monthlyVolume.toLocaleString("en-IN")} in referred volume
                </div>
              </div>

              {/* Recognition Points & Tier */}
              <div className="py-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Total Recognition Points</span>
                  <span className="text-lg font-mono font-black text-gas-400">
                    {estimatedPoints} Pts
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Projected Ecosystem Tier</span>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${projectedTier.bg} ${projectedTier.color} border ${projectedTier.border}`}>
                    {projectedTier.name}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 space-y-3">
              <Link
                href="/register"
                className="w-full text-center py-3 px-4 rounded-xl bg-gas-600 hover:bg-gas-500 text-white text-sm font-bold shadow-lg shadow-gas-600/30 transition-all flex items-center justify-center gap-2"
              >
                Start Earning & Creating Value <ArrowRight className="h-4 w-4" />
              </Link>
              <p className="text-center text-[11px] text-slate-400 font-mono">
                *Simulated figures based on standard commission rules and active points ledger.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
