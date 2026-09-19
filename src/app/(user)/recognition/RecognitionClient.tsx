"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Trophy,
  Award,
  Sparkles,
  ArrowRight,
  Clock,
  CheckCircle2,
  Lock,
  Compass,
  FileText,
  Users,
  ShieldCheck,
  TrendingUp,
  Activity,
  History,
} from "lucide-react"
import { RecognitionSummary } from "@/lib/services/recognition.service"

const ACTION_LABELS: Record<string, { label: string; color: string }> = {
  PROFILE_COMPLETE: { label: "Profile Completion", color: "bg-blue-50 text-blue-700 border-blue-200" },
  LEARNING_COMPLETE: { label: "Learning Module", color: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  REFERRAL_SUCCESSFUL: { label: "Successful Referral", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  CONTRIBUTION_APPROVED: { label: "Value Contribution", color: "bg-purple-50 text-purple-700 border-purple-200" },
  IDEA_APPROVED: { label: "Approved Innovation", color: "bg-amber-50 text-amber-700 border-amber-200" },
  COMMUNITY_PARTICIPATION: { label: "Community Action", color: "bg-teal-50 text-teal-700 border-teal-200" },
  REGISTRATION: { label: "Account Registration", color: "bg-slate-50 text-slate-700 border-slate-200" },
  PURCHASE: { label: "Verified Purchase", color: "bg-green-50 text-green-700 border-green-200" },
}

export default function RecognitionClient({
  initialSummary,
  allLevels,
}: {
  initialSummary: RecognitionSummary
  allLevels: Array<{
    id: string
    name: string
    minPoints: number
    maxPoints: number | null
    description: string | null
    order: number
  }>
}) {
  const [activeTab, setActiveTab] = useState<"ledger" | "badges" | "activity">("ledger")
  const summary = initialSummary
  const { totalPoints, currentLevel, nextLevel, progressPercentage, pointsHistory, badges, activityHistory } = summary

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">GAS™ Recognition & Value Engine</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Ascend through merit-based community tiers from Explorer to GAS Champion by creating and sharing value.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-gas-50 text-gas-800 border-gas-200 text-xs font-semibold px-2.5 py-1">
            V2V™ Merit Ledger
          </Badge>
        </div>
      </div>

      {/* Hero Standing Card */}
      <Card className="bg-gradient-to-r from-gas-900 via-gas-800 to-emerald-950 text-white p-6 rounded-xl shadow-lg border-gas-800 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 space-y-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider font-semibold text-emerald-400">Current Standing</span>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <div className="text-3xl sm:text-4xl font-black tracking-tight text-white flex items-center gap-3">
                <Trophy className="h-8 w-8 text-amber-400 shrink-0" />
                <span>{currentLevel.name}</span>
              </div>
              <p className="text-xs text-slate-300 max-w-lg leading-relaxed mt-1">
                {currentLevel.description || "Consistent creator and contributor of verified community value."}
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md px-5 py-3.5 rounded-xl border border-white/15 text-left sm:text-right shrink-0">
              <div className="text-3xl font-black text-white">{totalPoints}</div>
              <div className="text-[11px] uppercase tracking-wider font-semibold text-emerald-300">
                Recognition Points
              </div>
            </div>
          </div>

          {/* Progress to Next Level */}
          <div className="pt-2 border-t border-white/15 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium">
                {nextLevel ? (
                  <>
                    Next Tier: <strong className="text-white">{nextLevel.name}</strong> ({nextLevel.pointsNeeded} pts needed)
                  </>
                ) : (
                  <span className="text-amber-300 font-semibold flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5" /> Highest Tier Achieved: GAS Champion!
                  </span>
                )}
              </span>
              <span className="text-emerald-400 font-mono font-bold">{progressPercentage}%</span>
            </div>
            <div className="w-full bg-white/20 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-emerald-400 to-teal-300 h-full transition-all duration-500 rounded-full"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Actionable Ways to Earn Points */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link href="/dashboard/profile" className="block group">
          <Card className="p-3 border hover:border-gas-400 transition-all shadow-xs h-full flex flex-col justify-between">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <FileText className="h-4 w-4 text-blue-600" />
                <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-700 font-mono font-semibold">+10 pts</Badge>
              </div>
              <div className="font-semibold text-xs text-foreground group-hover:text-gas-600 transition-colors">Profile Details</div>
              <p className="text-[11px] text-muted-foreground">Complete full profile verification</p>
            </div>
            <div className="text-[10px] text-gas-600 font-semibold flex items-center gap-1 mt-2">
              Complete Profile <ArrowRight className="h-2.5 w-2.5" />
            </div>
          </Card>
        </Link>

        <Link href="/learn" className="block group">
          <Card className="p-3 border hover:border-gas-400 transition-all shadow-xs h-full flex flex-col justify-between">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Compass className="h-4 w-4 text-indigo-600" />
                <Badge variant="outline" className="text-[10px] bg-indigo-50 text-indigo-700 font-mono font-semibold">+10 pts</Badge>
              </div>
              <div className="font-semibold text-xs text-foreground group-hover:text-gas-600 transition-colors">Complete Learning</div>
              <p className="text-[11px] text-muted-foreground">Study the V2V™ master guide</p>
            </div>
            <div className="text-[10px] text-gas-600 font-semibold flex items-center gap-1 mt-2">
              Start Learning <ArrowRight className="h-2.5 w-2.5" />
            </div>
          </Card>
        </Link>

        <Link href="/contribute" className="block group">
          <Card className="p-3 border hover:border-gas-400 transition-all shadow-xs h-full flex flex-col justify-between">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Sparkles className="h-4 w-4 text-purple-600" />
                <Badge variant="outline" className="text-[10px] bg-purple-50 text-purple-700 font-mono font-semibold">+25-50 pts</Badge>
              </div>
              <div className="font-semibold text-xs text-foreground group-hover:text-gas-600 transition-colors">V2V Value Item</div>
              <p className="text-[11px] text-muted-foreground">Submit guide, idea, or feedback</p>
            </div>
            <div className="text-[10px] text-gas-600 font-semibold flex items-center gap-1 mt-2">
              Submit Item <ArrowRight className="h-2.5 w-2.5" />
            </div>
          </Card>
        </Link>

        <Link href="/refer" className="block group">
          <Card className="p-3 border hover:border-gas-400 transition-all shadow-xs h-full flex flex-col justify-between">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Users className="h-4 w-4 text-emerald-600" />
                <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 font-mono font-semibold">+20 pts</Badge>
              </div>
              <div className="font-semibold text-xs text-foreground group-hover:text-gas-600 transition-colors">Direct Referral</div>
              <p className="text-[11px] text-muted-foreground">Refer an active customer</p>
            </div>
            <div className="text-[10px] text-gas-600 font-semibold flex items-center gap-1 mt-2">
              Share Link <ArrowRight className="h-2.5 w-2.5" />
            </div>
          </Card>
        </Link>
      </div>

      {/* Recognition Tiers Breakdown */}
      <Card>
        <CardHeader className="py-4">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-gas-600" /> Recognition Tiers & Thresholds
          </CardTitle>
          <CardDescription className="text-xs">
            Dynamic community ranks determined solely by cumulative merit points ledger.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            {allLevels.map((lvl) => {
              const reached = totalPoints >= lvl.minPoints
              const isCurrent = currentLevel.name === lvl.name
              return (
                <div
                  key={lvl.id}
                  className={`p-3.5 rounded-xl border text-center space-y-2 transition-all ${
                    isCurrent
                      ? "bg-gas-50/90 border-gas-500 shadow-xs ring-2 ring-gas-500/20"
                      : reached
                      ? "bg-emerald-50/40 border-emerald-300"
                      : "opacity-60 bg-muted/20 border-dashed"
                  }`}
                >
                  <div className="font-bold text-xs text-foreground">{lvl.name}</div>
                  <div className="text-[11px] font-mono text-gas-700 font-semibold">
                    {lvl.minPoints}{lvl.maxPoints ? ` – ${lvl.maxPoints}` : "+"} pts
                  </div>
                  {isCurrent ? (
                    <Badge className="bg-gas-600 text-white text-[9px] px-2 py-0.5 mx-auto">
                      Current Standing
                    </Badge>
                  ) : reached ? (
                    <Badge variant="outline" className="border-emerald-400 text-emerald-700 bg-emerald-50 text-[9px] px-2 py-0.5 mx-auto">
                      ✓ Achieved
                    </Badge>
                  ) : (
                    <span className="text-[10px] text-muted-foreground block font-medium">
                      Locked
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Interactive Tabs: Points Ledger | Badges | Activity History */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b pb-2">
          <button
            onClick={() => setActiveTab("ledger")}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === "ledger"
                ? "bg-gas-600 text-white shadow-xs"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            <History className="h-3.5 w-3.5" /> Points Ledger ({pointsHistory.length})
          </button>
          <button
            onClick={() => setActiveTab("badges")}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === "badges"
                ? "bg-gas-600 text-white shadow-xs"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            <Award className="h-3.5 w-3.5" /> Milestone Badges ({badges.filter((b) => b.isEarned).length}/{badges.length})
          </button>
          <button
            onClick={() => setActiveTab("activity")}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === "activity"
                ? "bg-gas-600 text-white shadow-xs"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            <Activity className="h-3.5 w-3.5" /> Activity History ({activityHistory.length})
          </button>
        </div>

        {/* TAB 1: Points Ledger Table */}
        {activeTab === "ledger" && (
          <Card>
            <CardHeader className="py-4">
              <CardTitle className="text-base flex items-center justify-between">
                <span>Immutable Points Ledger</span>
                <span className="text-xs font-mono font-normal text-muted-foreground">
                  Ledger Balance: <strong>{totalPoints} pts</strong>
                </span>
              </CardTitle>
              <CardDescription className="text-xs">
                Every point credit is cryptographically immutable and recorded as an individual ledger transaction.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {pointsHistory.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground text-xs space-y-2">
                  <History className="h-8 w-8 mx-auto text-gas-500 opacity-60" />
                  <div className="font-semibold">No points transactions recorded yet</div>
                  <p className="text-[11px] max-w-sm mx-auto">
                    Complete your profile, finish learning modules, or submit value contributions to earn recognition points.
                  </p>
                </div>
              ) : (
                <div className="divide-y text-xs">
                  {pointsHistory.map((item) => {
                    const meta = ACTION_LABELS[item.action] || {
                      label: item.action.replace(/_/g, " "),
                      color: "bg-muted text-foreground border-border",
                    }
                    return (
                      <div
                        key={item.id}
                        className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-muted/10 transition-colors"
                      >
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="outline" className={`text-[10px] uppercase font-mono ${meta.color}`}>
                              {meta.label}
                            </Badge>
                            {item.referenceId && (
                              <span className="text-[10px] font-mono text-muted-foreground">
                                Ref: #{item.referenceId.slice(-8)}
                              </span>
                            )}
                          </div>
                          <p className="text-foreground text-xs font-medium">{item.note}</p>
                          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>
                              {new Date(item.createdAt).toLocaleString("en-IN", {
                                dateStyle: "medium",
                                timeStyle: "short",
                              })}
                            </span>
                          </div>
                        </div>

                        <div className="shrink-0 self-end sm:self-center">
                          <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                            +{item.points} pts
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* TAB 2: Badges Grid */}
        {activeTab === "badges" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {badges.map((b) => (
              <Card
                key={b.id}
                className={`p-4 border transition-all ${
                  b.isEarned
                    ? "bg-white border-gas-300 shadow-xs ring-1 ring-gas-500/10"
                    : "bg-muted/20 border-dashed opacity-60"
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 text-lg ${
                      b.isEarned ? "bg-gas-100 text-gas-700 shadow-xs" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {b.isEarned ? <Award className="h-6 w-6 text-gas-600" /> : <Lock className="h-5 w-5" />}
                  </div>

                  <div className="space-y-1 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="font-bold text-xs text-foreground">{b.name}</h4>
                      {b.isEarned && (
                        <Badge className="bg-emerald-600 text-white text-[9px] px-1.5 py-0">
                          Unlocked
                        </Badge>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-snug">{b.description}</p>
                    <div className="pt-1.5 text-[10px] text-slate-500 font-medium border-t border-muted/50 mt-1">
                      {b.isEarned && b.earnedAt ? (
                        <span className="text-emerald-700 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" /> Earned on{" "}
                          {new Date(b.earnedAt).toLocaleDateString("en-IN", { dateStyle: "medium" })}
                        </span>
                      ) : (
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Lock className="h-3 w-3" /> Requirement: {b.condition || "Qualifying activity"}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* TAB 3: Activity History */}
        {activeTab === "activity" && (
          <Card>
            <CardHeader className="py-4">
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="h-4 w-4 text-gas-600" /> Platform Activity Telemetry
              </CardTitle>
              <CardDescription className="text-xs">
                Real-time chronological events recorded for your account.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {activityHistory.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground text-xs">
                  No activity events recorded yet.
                </div>
              ) : (
                <div className="divide-y text-xs">
                  {activityHistory.map((ev) => (
                    <div key={ev.id} className="p-3.5 flex items-center justify-between gap-4">
                      <div className="space-y-0.5">
                        <div className="font-semibold text-foreground flex items-center gap-2">
                          <span>{ev.event.replace(/_/g, " ")}</span>
                          {ev.entityType && (
                            <Badge variant="outline" className="text-[9px] font-mono">
                              {ev.entityType}
                            </Badge>
                          )}
                        </div>
                        {ev.metadata && (
                          <p className="text-[11px] text-muted-foreground font-mono">
                            {typeof ev.metadata === "string"
                              ? ev.metadata
                              : JSON.stringify(ev.metadata)}
                          </p>
                        )}
                      </div>
                      <div className="text-[10px] text-muted-foreground shrink-0 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{new Date(ev.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
