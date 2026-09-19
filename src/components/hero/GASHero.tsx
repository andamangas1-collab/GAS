"use client"

import React from "react"
import dynamic from "next/dynamic"
import Link from "next/link"
import { ArrowRight, ShieldCheck, Sparkles, BookOpen, Layers, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { GASLogo } from "@/components/branding/GASLogo"
import { BorderBeam } from "@/components/ui/border-beam"


// Dynamically import Three.js client canvas with ssr: false
const GASHero3D = dynamic(() => import("./GASHero3D"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] md:h-[500px] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-12 h-12 rounded-full border-2 border-gas-500 border-t-transparent animate-spin" />
        <span className="text-xs font-mono text-muted-foreground">Initializing V2V™ 3D Engine...</span>
      </div>
    </div>
  ),
})

export function GASHero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white border-b border-slate-800">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Brand Copy & CTAs */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700 text-slate-300 text-xs font-semibold backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
              <span>GAS™ — GRAND AFFILIATE SYSTEM</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-tight text-balance">
              LEARN. EARN. <br className="hidden sm:inline" />
              CREATE VALUE. <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-teal-300 to-emerald-400">
                GET RECOGNISED.
              </span>
            </h1>

            {/* Supporting Message */}
            <div className="space-y-2">
              <div className="text-base sm:text-lg font-bold text-slate-200 font-sans flex items-center justify-center lg:justify-start gap-2">
                <Zap className="h-4 w-4 text-emerald-400" />
                V2V™ — Value-to-Value Engine
              </div>
              <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto lg:mx-0 text-balance leading-relaxed">
                A modern reciprocal affiliate ecosystem. Promote verified offerings, submit educational community value,
                climb recognition tiers, and earn server-qualified commissions with single-tier direct transparency.
              </p>
            </div>

            {/* Primary & Secondary Action CTAs */}
            <div className="flex flex-col sm:flex-row gap-3.5 justify-center lg:justify-start pt-2">
              <Button
                size="lg"
                asChild
                className="bg-gas-600 hover:bg-gas-500 text-white font-bold text-sm h-12 px-7 shadow-lg shadow-gas-600/25 gap-2"
              >
                <Link href="/register">
                  GET STARTED <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="border-gas-500/40 bg-slate-900/60 hover:bg-gas-950/50 hover:border-gas-400 text-slate-100 hover:text-white font-semibold text-sm h-12 px-6 gap-2 shadow-sm shadow-gas-950/50 backdrop-blur-sm transition-all duration-200"
              >
                <Link href="/learn">
                  <BookOpen className="h-4 w-4 text-gas-400" /> EXPLORE HOW IT WORKS
                </Link>
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-center lg:justify-start gap-5 text-xs text-slate-400 font-medium">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-400" /> Single-Tier Direct (Zero MLM)
              </div>
              <div className="flex items-center gap-1.5">
                <Layers className="h-4 w-4 text-blue-400" /> Verified Server Calculations
              </div>
              <div className="flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-purple-400" /> V2V™ Points Ledger
              </div>
            </div>
          </div>

          {/* Right Column: Interactive 3D V2V Engine */}
          <div className="lg:col-span-6 relative">
            <div className="relative overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-950/50 p-2 shadow-2xl shadow-blue-950/20 backdrop-blur">
              <BorderBeam size={350} duration={16} colorFrom="#3b82f6" colorTo="#10b981" />
              <GASHero3D />
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
