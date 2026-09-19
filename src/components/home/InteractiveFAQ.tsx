"use client"

import { useState } from "react"
import { HelpCircle, ChevronDown, ChevronUp, Search } from "lucide-react"

export function InteractiveFAQ() {
  const [searchTerm, setSearchTerm] = useState("")
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const faqs = [
    {
      q: "How does referral attribution work in GAS™?",
      a: "Every verified user receives a unique referral code and direct link (e.g. /r/GAS-USER-10245). When a prospective customer clicks your link, a secure cookie tracks attribution. If they register and make a verified purchase, your commission is calculated server-side. Once the validation period expires and refund risk clears, the commission transitions from PENDING to APPROVED for payout.",
      category: "Referrals",
    },
    {
      q: "Is GAS™ an MLM (Multi-Level Marketing) company or pyramid scheme?",
      a: "No, absolutely not. GAS™ operates strictly on a Single-Tier Direct Referral model. There are zero downlines, no recruitment bonuses, and no multi-level commissions. You only earn on products purchased by direct customers you refer. Downline recruitment schemes are explicitly prohibited.",
      category: "Compliance",
    },
    {
      q: "What is the V2V™ (Value-to-Value) Engine?",
      a: "V2V™ stands for 'Value-to-Value'. Beyond monetary affiliate sales, users can earn Recognition Points by contributing valuable product ideas, tutorials, feedback, and community support. In return, the ecosystem recognizes and elevates contributors through progressive status tiers and badges.",
      category: "V2V Engine",
    },
    {
      q: "How and when are commissions paid?",
      a: "Commissions are reviewed and approved by administrators following order verification. Approved balances are disbursed via direct Bank Transfer or UPI. Every payout includes a verified UTR reference recorded in your private immutable financial ledger.",
      category: "Payouts",
    },
    {
      q: "Can I refer myself to earn commissions on my own purchases?",
      a: "No. The GAS™ referral engine includes automated anti-fraud checks that reject self-referrals (same user ID, duplicate identity, or flagged IPs) at qualification time to protect merchants and maintain integrity.",
      category: "Security",
    },
    {
      q: "How do I earn Recognition Points and ascend tiers?",
      a: "Points are awarded automatically based on system rules: Profile Completion (+10), Learning Curriculum (+10), Successful Referral (+20), Useful Contribution (+25), and Approved Ideas (+50). Point balances are never overwritten; every change creates an immutable transaction in your ledger.",
      category: "Recognition",
    },
  ]

  const filteredFaqs = faqs.filter(
    (item) =>
      item.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.a.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const toggleOpen = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gas-100 dark:bg-gas-950/80 text-gas-700 dark:text-gas-300 text-xs font-bold uppercase tracking-wider mb-3">
            <HelpCircle className="h-3.5 w-3.5" />
            Clear Answers
          </div>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
            Frequently Asked Questions
          </h2>
          <p className="mt-2 text-sm sm:text-base text-muted-foreground">
            Everything you need to know about referral rules, payouts, and the V2V™ ecosystem.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search questions (e.g. payouts, attribution, MLM, points)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-gas-500/20 focus:border-gas-500 transition-all shadow-sm"
          />
        </div>

        {/* Accordion */}
        <div className="space-y-3">
          {filteredFaqs.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-border rounded-xl">
              <p className="text-xs text-muted-foreground">No matching questions found.</p>
            </div>
          ) : (
            filteredFaqs.map((faq, idx) => {
              const isOpen = openIndex === idx
              return (
                <div
                  key={faq.q}
                  className="rounded-xl border border-border bg-card overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => toggleOpen(idx)}
                    className="w-full flex items-center justify-between p-5 text-left font-bold text-sm sm:text-base text-foreground hover:text-gas-600 transition-colors"
                  >
                    <span className="pr-4">{faq.q}</span>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-muted text-muted-foreground uppercase hidden sm:inline-block">
                        {faq.category}
                      </span>
                      {isOpen ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 text-xs sm:text-sm text-muted-foreground leading-relaxed border-t border-border/40 pt-4 bg-muted/20">
                      {faq.a}
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>
    </section>
  )
}
