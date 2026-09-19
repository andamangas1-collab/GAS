"use client"

import { AnimatedCounter } from "@/components/ui/animated-counter"
import { AnimatedRupee, AnimatedShield, AnimatedTrophy, AnimatedV2VLoop } from "@/components/ui/motion-icons"
import { BorderBeam } from "@/components/ui/border-beam"

export function ValueTicker() {
  const stats = [
    {
      label: "Verified Value Circulated",
      numericValue: 58999,
      prefix: "₹",
      suffix: "+",
      sub: "100% Audit Tracked",
      renderIcon: () => <AnimatedRupee size={28} />,
    },
    {
      label: "Single-Tier Direct Attributed",
      numericValue: 100,
      suffix: "%",
      sub: "Zero MLM / Downlines",
      renderIcon: () => <AnimatedShield size={28} />,
    },
    {
      label: "Recognition Points Awarded",
      numericValue: 710,
      suffix: "+ Pts",
      sub: "Immutable Points Ledger",
      renderIcon: () => <AnimatedTrophy size={28} />,
    },
    {
      label: "V2V™ Direct Payouts",
      staticValue: "Direct UTR",
      sub: "Verified Bank Transfers",
      renderIcon: () => <AnimatedV2VLoop size={28} />,
    },
  ]

  return (
    <section className="relative z-20 -mt-8 max-w-6xl mx-auto px-4">
      <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/95 backdrop-blur-md shadow-2xl p-6 md:p-8">
        <BorderBeam size={300} duration={12} delay={2} colorFrom="#2563eb" colorTo="#10b981" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 divide-y md:divide-y-0 md:divide-x divide-slate-800/80">
          {stats.map((item, idx) => {
            return (
              <div
                key={item.label}
                className={`flex flex-col items-center text-center group transition-transform duration-200 hover:-translate-y-1 ${
                  idx > 0 ? "pt-6 md:pt-0 md:pl-6" : ""
                }`}
              >
                <div className="mb-3 flex items-center justify-center">
                  {item.renderIcon()}
                </div>
                <div className="text-2xl md:text-3xl font-black text-white tracking-tight">
                  {item.numericValue !== undefined ? (
                    <AnimatedCounter
                      value={item.numericValue}
                      prefix={item.prefix}
                      suffix={item.suffix}
                    />
                  ) : (
                    item.staticValue
                  )}
                </div>
                <div className="text-xs font-semibold text-slate-300 mt-1 uppercase tracking-wider">
                  {item.label}
                </div>
                <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                  {item.sub}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

