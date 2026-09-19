import { Metadata } from "next"
import Link from "next/link"
import { ShieldCheck, ArrowLeft, Lock, Eye, FileText, Database } from "lucide-react"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Privacy Policy | GAS™ — Grand Affiliate System",
  description: "Privacy Policy and data protection guidelines for the GAS™ platform.",
}

export default function PrivacyPolicyPage() {
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
            <ShieldCheck className="h-3.5 w-3.5" />
            Legal &amp; Trust
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Privacy Policy
          </h1>
          <p className="text-sm text-muted-foreground">
            Last Updated: September 2026 • GAS™ (Grand Affiliate System)
          </p>
        </div>

        <section className="space-y-4 text-sm leading-relaxed text-muted-foreground">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Eye className="h-5 w-5 text-gas-600" /> 1. Information We Collect
          </h2>
          <p>
            At GAS™ (Grand Affiliate System), we respect your privacy and are committed to protecting your personal data. We collect information necessary to facilitate direct affiliate partnerships, transparent revenue calculations, and platform services:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Account Identity:</strong> Your full name, email address, mobile phone number, and city/state.</li>
            <li><strong>Affiliate Telemetry:</strong> Unique referral codes, qualified referral milestones, click logs, and conversion tracking.</li>
            <li><strong>Financial &amp; Commission Data:</strong> Transaction references, earned commissions, payout statuses, and banking/UPI details provided for withdrawal processing.</li>
            <li><strong>V2V Value Contributions:</strong> Case studies, marketing creative submissions, and community contributions submitted for platform evaluation.</li>
          </ul>
        </section>

        <section className="space-y-4 text-sm leading-relaxed text-muted-foreground">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Database className="h-5 w-5 text-gas-600" /> 2. How We Use Your Data
          </h2>
          <p>
            We process your personal information strictly for legitimate operational purposes:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>To manage your affiliate account and secure authentication sessions via NextAuth.</li>
            <li>To accurately compute direct sales commissions without multi-level downline dependencies.</li>
            <li>To award recognition points, tier elevations, and performance badges based on transparent criteria.</li>
            <li>To prevent fraud, multiple account abuse, self-referrals, and malicious activity.</li>
          </ul>
        </section>

        <section className="space-y-4 text-sm leading-relaxed text-muted-foreground">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Lock className="h-5 w-5 text-gas-600" /> 3. Data Protection &amp; Security
          </h2>
          <p>
            Your credentials and sensitive records are safeguarded with industry-standard security protocols:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Passwords are cryptographically hashed using <strong>bcrypt</strong> before being stored in our Supabase PostgreSQL infrastructure.</li>
            <li>All network communications are strictly enforced through <strong>TLS/HTTPS encryption</strong>.</li>
            <li>Session states utilize secure JWT tokens with rotating cryptographic secrets.</li>
            <li>We do not sell, rent, or trade your personal data to third-party data brokers.</li>
          </ul>
        </section>

        <section className="space-y-4 text-sm leading-relaxed text-muted-foreground">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <FileText className="h-5 w-5 text-gas-600" /> 4. Contact &amp; Inquiries
          </h2>
          <p>
            If you have questions regarding this Privacy Policy or wish to request data updates, please contact our administrative team at{" "}
            <a href="mailto:support@singularityingolok.blog" className="text-gas-600 font-medium hover:underline">
              support@singularityingolok.blog
            </a>.
          </p>
        </section>
      </div>
    </div>
  )
}
