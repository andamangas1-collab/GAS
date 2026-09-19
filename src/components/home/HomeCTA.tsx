"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowRight, ShieldCheck, Sparkles, CheckCircle2, Gift } from "lucide-react"

export function HomeCTA() {
  const router = useRouter()
  const [refCode, setRefCode] = useState("")

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault()
    if (refCode.trim()) {
      router.push(`/register?ref=${encodeURIComponent(refCode.trim().toUpperCase())}`)
    } else {
      router.push("/register")
    }
  }

  return (
    <section className="py-24 bg-gradient-to-b from-muted/30 to-background border-t border-border/60 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-white/5 pointer-events-none" />
      <div className="container mx-auto px-4 max-w-5xl relative z-10">
        <div className="rounded-3xl border border-border bg-gradient-to-r from-gas-900 via-slate-900 to-gas-950 p-8 sm:p-14 text-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gas-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-2xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold uppercase tracking-wider text-emerald-300">
              <Sparkles className="h-3.5 w-3.5" />
              Join the V2V™ Movement
            </div>

            <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              Ready to Learn, Earn &amp; Get Recognised?
            </h2>

            <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed">
              Create your free verified account in under 60 seconds. Unlock your unique single-tier referral identity and start accumulating points on an immutable ledger.
            </p>

            {/* Quick Referral Input / Registration Form */}
            <form onSubmit={handleStart} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto pt-2">
              <input
                type="text"
                placeholder="Have a referral code? (Optional)"
                value={refCode}
                onChange={(e) => setRefCode(e.target.value.toUpperCase())}
                className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-gas-400/50 uppercase font-mono tracking-wider"
              />
              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-gas-600 hover:bg-gas-500 text-white text-sm font-bold shadow-lg shadow-gas-600/30 transition-all flex items-center justify-center gap-2 shrink-0"
              >
                Create Account <ArrowRight className="h-4 w-4" />
              </button>
            </form>

            {/* Trust points */}
            <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 font-medium">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Free to Join
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-blue-400" /> Direct 1-Tier Affiliate
              </span>
              <span className="flex items-center gap-1.5">
                <Gift className="h-4 w-4 text-purple-400" /> +10 Pts on Profile Complete
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
