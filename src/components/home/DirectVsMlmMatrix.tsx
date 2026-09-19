"use client"

import { ShieldCheck, XCircle, CheckCircle2, HelpCircle } from "lucide-react"

export function DirectVsMlmMatrix() {
  const comparisons = [
    {
      factor: "Referral Attribution Model",
      gas: "Single-Tier Direct Referral Only (Direct Referrer Gets 100% of Attributed Commission)",
      mlm: "Multi-Tier Pyramid / Matrix Downlines (Up to 10+ layers taking cuts)",
      gasAdvantage: true,
    },
    {
      factor: "Upfront Cost / Package Purchase",
      gas: "Zero Mandatory Purchases (Completely Free to Join & Refer)",
      mlm: "Mandatory Starter Kits, Monthly Minimum PVs, or Auto-Ships",
      gasAdvantage: true,
    },
    {
      factor: "Source of Financial Payouts",
      gas: "Real External Product Sales with Genuine Market Utility",
      mlm: "Recruitment Fees of Newer Downline Members",
      gasAdvantage: true,
    },
    {
      factor: "Audit & Calculation Engine",
      gas: "Server-Side Immutable MariaDB Ledger with Banking UTR IDs",
      mlm: "Opaque Internal Point Balancing & Shifting PV Requirements",
      gasAdvantage: true,
    },
    {
      factor: "Value Creation Beyond Sales",
      gas: "V2V™ Recognition Engine: Earn Points for Ideas, Guides & Feedback",
      mlm: "Purely Volume & Headcount Driven (Zero Non-Monetary Value)",
      gasAdvantage: true,
    },
  ]

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider mb-3">
            <ShieldCheck className="h-3.5 w-3.5" />
            Ethical Transparency Matrix
          </div>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
            GAS™ Direct Affiliate vs. Predatory MLM
          </h2>
          <p className="mt-2 text-sm sm:text-base text-muted-foreground">
            We operate with strict anti-MLM compliance. No pyramids, no downlines, and no inventory loading. Just transparent, single-tier commerce.
          </p>
        </div>

        {/* Matrix Table */}
        <div className="rounded-2xl border border-border bg-card shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-12 bg-muted/60 border-b border-border p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground font-mono">
            <div className="md:col-span-4">Evaluation Factor</div>
            <div className="md:col-span-4 text-gas-600 dark:text-gas-400 flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" /> GAS™ System (Direct V2V™)
            </div>
            <div className="md:col-span-4 text-rose-500 flex items-center gap-1.5 mt-2 md:mt-0">
              <XCircle className="h-4 w-4 text-rose-500" /> Multi-Level Marketing (MLM)
            </div>
          </div>

          <div className="divide-y divide-border/60">
            {comparisons.map((row) => (
              <div
                key={row.factor}
                className="grid grid-cols-1 md:grid-cols-12 p-4 sm:p-5 gap-3 md:gap-4 hover:bg-muted/30 transition-colors items-center"
              >
                <div className="md:col-span-4 font-bold text-sm text-foreground">
                  {row.factor}
                </div>
                <div className="md:col-span-4 flex items-start gap-2 text-xs sm:text-sm text-foreground font-medium bg-emerald-50/50 dark:bg-emerald-950/20 p-2.5 rounded-lg border border-emerald-500/20">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{row.gas}</span>
                </div>
                <div className="md:col-span-4 flex items-start gap-2 text-xs sm:text-sm text-muted-foreground bg-rose-50/50 dark:bg-rose-950/20 p-2.5 rounded-lg border border-rose-500/20">
                  <XCircle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                  <span>{row.mlm}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
