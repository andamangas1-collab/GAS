import { Metadata } from "next"
import Link from "next/link"
import { Scale, ArrowLeft, CheckCircle2, AlertTriangle, ShieldCheck, HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Terms of Service | GAS™ — Grand Affiliate System",
  description: "Terms and conditions governing the use of GAS™ affiliate and e-commerce services.",
}

export default function TermsOfServicePage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-12 md:py-16">
      <div className="mb-8">
        <Link href="/">
          <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Button>
        </Link>
      </div>

      <div className="space-y-8">
        <div className="space-y-3 border-b border-border/60 pb-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-gas-50 dark:bg-gas-950/50 px-3 py-1 text-xs font-semibold text-gas-700 dark:text-gas-300 border border-gas-200/60 dark:border-gas-800/60">
            <Scale className="h-3.5 w-3.5" />
            Platform Agreement
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Terms of Service
          </h1>
          <p className="text-sm text-muted-foreground">
            Effective Date: September 2026 • GAS™ (Grand Affiliate System)
          </p>
        </div>

        <section className="space-y-4 text-sm leading-relaxed text-muted-foreground">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-gas-600" /> 1. Platform Philosophy: Direct vs. MLM
          </h2>
          <p>
            GAS™ operates on a <strong>pure, direct single-tier affiliate and value-creation model</strong>. By participating in this platform, you acknowledge and agree that:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>There are <strong>no multi-level downlines</strong>, pyramid structures, or mandatory recruitment fees.</li>
            <li>Commissions are generated solely from genuine customer purchases and validated value contributions.</li>
            <li>No member can earn passive override percentages from the ongoing activities of subordinate affiliates.</li>
          </ul>
        </section>

        <section className="space-y-4 text-sm leading-relaxed text-muted-foreground">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-gas-600" /> 2. Affiliate Responsibilities &amp; Fair Play
          </h2>
          <p>
            Affiliates and registered members must uphold the highest standards of integrity:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Self-Referrals Prohibited:</strong> Using personal referral codes to purchase products for self-gain is strictly monitored and will result in commission forfeiture.</li>
            <li><strong>No Deceptive Promotion:</strong> Affiliates must not make misleading earnings claims, spam unverified audiences, or impersonate brand representatives.</li>
            <li><strong>Single Account Policy:</strong> Each individual user is permitted one active personal account. Duplicate or synthetic accounts are subject to immediate suspension.</li>
          </ul>
        </section>

        <section className="space-y-4 text-sm leading-relaxed text-muted-foreground">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-gas-600" /> 3. Commission Payouts &amp; Thresholds
          </h2>
          <p>
            Commissions are calculated based on approved orders and verified returns policies:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Commissions transition from <strong>Pending</strong> to <strong>Approved</strong> after the product&apos;s cooling/refund window has elapsed.</li>
            <li>Payout disbursements are processed in accordance with administrative payout cycles to verified UPI/Bank accounts.</li>
            <li>GAS™ reserves the right to hold or audit transactions suspected of fraudulent activity, automated bot traffic, or chargeback disputes.</li>
          </ul>
        </section>

        <section className="space-y-4 text-sm leading-relaxed text-muted-foreground">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-gas-600" /> 4. Modifications &amp; Governing Law
          </h2>
          <p>
            GAS™ reserves the right to amend commission rates, recognition rules, and terms of service with reasonable prior notice posted on the platform. Continued participation constitutes acceptance of any revised terms.
          </p>
        </section>
      </div>
    </div>
  )
}
