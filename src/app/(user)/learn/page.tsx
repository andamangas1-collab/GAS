"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, Shield, Award, Users, CheckCircle2, Sparkles, BookOpen } from "lucide-react"

export default function LearnPage() {
  const [isClaiming, setIsClaiming] = useState(false)
  const [claimStatus, setClaimStatus] = useState<{ type: "success" | "info" | "error"; text: string } | null>(null)

  const steps = [
    {
      title: "1. The V2V™ Philosophy",
      desc: "Value-to-Value represents sustainable commerce. You earn recognition and commissions by genuinely helping others discover verified solutions.",
      icon: Shield,
    },
    {
      title: "2. How Referral Attribution Works",
      desc: "Every member receives a unique GAS identifier. Share your link with friends or community members. You earn eligible commissions upon confirmed purchases.",
      icon: Users,
    },
    {
      title: "3. Creating Value & Recognition",
      desc: "Beyond purchases, submit ideas, tutorials, and community feedback. Earn recognition points, unlock badges, and ascend from Explorer to GAS Champion.",
      icon: Award,
    },
  ]

  const handleCompleteLearning = async () => {
    setIsClaiming(true)
    setClaimStatus(null)

    try {
      const res = await fetch("/api/recognition/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "LEARNING_COMPLETE",
          referenceId: "v2v_core_curriculum",
          note: "Completed V2V Foundation & Affiliate Ethics Curriculum",
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to claim learning reward")

      if (data.alreadyClaimed) {
        setClaimStatus({
          type: "info",
          text: "You have already completed this curriculum and claimed your recognition points.",
        })
      } else {
        setClaimStatus({
          type: "success",
          text: `Curriculum completed! You earned +${data.pointsAwarded} Recognition Points. Standing: ${data.currentLevel}.`,
        })
      }
    } catch (err: any) {
      setClaimStatus({ type: "error", text: err.message })
    } finally {
      setIsClaiming(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl space-y-8">
      <div className="text-center space-y-3">
        <Badge variant="outline" className="bg-gas-50 text-gas-800 border-gas-200">
          Knowledge Base & Framework
        </Badge>
        <h1 className="text-3xl font-extrabold tracking-tight">
          Learn the GAS™ V2V™ Engine
        </h1>
        <p className="text-muted-foreground text-sm max-w-xl mx-auto">
          Grand Affiliate System is engineered for transparent, high-integrity value creation. No hype, no gambling, no predatory multi-level schemes.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {steps.map((step, idx) => (
          <Card key={idx} className="shadow-sm border">
            <CardHeader>
              <div className="h-10 w-10 rounded-lg bg-gas-100 text-gas-700 flex items-center justify-center mb-2">
                <step.icon className="h-5 w-5" />
              </div>
              <CardTitle className="text-base">{step.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {step.desc}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Completion & Recognition Points Claim Card */}
      <Card className="border-gas-300 bg-gradient-to-r from-gas-50 to-emerald-50 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <BookOpen className="h-4 w-4 text-gas-700" />
              <h3 className="text-base font-bold text-gas-900">Finish Curriculum & Claim Recognition</h3>
            </div>
            <p className="text-xs text-gas-700">
              Confirm your understanding of the V2V™ core principles and receive +10 merit points.
            </p>
          </div>

          <Button
            size="sm"
            onClick={handleCompleteLearning}
            disabled={isClaiming}
            className="bg-gas-600 hover:bg-gas-700 text-white font-semibold text-xs gap-1.5 shrink-0"
          >
            <Sparkles className="h-3.5 w-3.5" />
            {isClaiming ? "Recording..." : "Complete & Claim +10 pts"}
          </Button>
        </div>

        {claimStatus && (
          <div
            className={`mt-4 p-3 text-xs rounded-md border flex items-center gap-2 ${
              claimStatus.type === "success"
                ? "bg-emerald-100 border-emerald-300 text-emerald-800"
                : claimStatus.type === "info"
                ? "bg-blue-50 border-blue-200 text-blue-800"
                : "bg-red-50 border-red-200 text-red-800"
            }`}
          >
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{claimStatus.text}</span>
          </div>
        )}
      </Card>

      <Card className="border-gas-200 p-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-gray-900">Ready to put learning into action?</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Explore active catalog offers or submit your first community contribution.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button size="sm" asChild className="bg-gas-600 hover:bg-gas-700 text-white font-semibold text-xs">
              <Link href="/offers">View Offers <ArrowRight className="ml-1.5 h-3.5 w-3.5" /></Link>
            </Button>
            <Button size="sm" variant="outline" asChild className="text-xs">
              <Link href="/recognition">My Recognition Hub</Link>
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
