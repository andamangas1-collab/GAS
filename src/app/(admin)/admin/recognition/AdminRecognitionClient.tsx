"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Trophy,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Plus,
  Save,
  Award,
  Layers,
  X,
} from "lucide-react"

interface PointRule {
  id: string
  action: string
  points: number
  isActive: boolean
  updatedAt: string | Date
}

interface RecognitionLevel {
  id: string
  name: string
  minPoints: number
  maxPoints: number | null
  description: string | null
  order: number
}

const ACTION_DESCRIPTIONS: Record<string, string> = {
  PROFILE_COMPLETE: "Awarded when member completes 100% of user profile",
  LEARNING_COMPLETE: "Awarded when member finishes educational curriculum",
  REFERRAL_SUCCESSFUL: "Awarded to direct referrer upon verified qualified purchase",
  CONTRIBUTION_APPROVED: "Awarded when administrator verifies and approves community guide/resource",
  IDEA_APPROVED: "Awarded when innovative platform proposal is accepted",
  COMMUNITY_PARTICIPATION: "Awarded for active participation in official discussions and events",
  REGISTRATION: "Awarded upon new member account creation",
  PURCHASE: "Awarded to buyer upon completed order payment",
}

export default function AdminRecognitionClient({
  initialRules,
  initialLevels,
}: {
  initialRules: PointRule[]
  initialLevels: RecognitionLevel[]
}) {
  const router = useRouter()
  const [rules, setRules] = useState<PointRule[]>(initialRules)
  const [levels, setLevels] = useState<RecognitionLevel[]>(initialLevels)
  const [editingRule, setEditingRule] = useState<Record<string, { points: number; isActive: boolean }>>({})
  const [editingLevel, setEditingLevel] = useState<Record<string, { minPoints: number; maxPoints: number | null }>>({})
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [isAwardModalOpen, setIsAwardModalOpen] = useState(false)
  const [awardForm, setAwardForm] = useState({
    userId: "",
    points: 25,
    action: "COMMUNITY_PARTICIPATION",
    note: "",
  })
  const [isSubmittingAward, setIsSubmittingAward] = useState(false)

  // Rule edit handlers
  const handleRuleChange = (action: string, field: "points" | "isActive", value: any) => {
    const current = editingRule[action] || {
      points: rules.find((r) => r.action === action)?.points ?? 10,
      isActive: rules.find((r) => r.action === action)?.isActive ?? true,
    }
    setEditingRule({
      ...editingRule,
      [action]: { ...current, [field]: value },
    })
  }

  const handleSaveRule = async (action: string) => {
    const edit = editingRule[action]
    if (!edit) return
    setFeedbackMsg(null)

    try {
      const res = await fetch("/api/admin/recognition/rules", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          points: edit.points,
          isActive: edit.isActive,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to update point rule")

      setRules((prev) => prev.map((r) => (r.action === action ? { ...r, ...edit } : r)))
      setFeedbackMsg({ type: "success", text: `Rule for ${action} updated successfully.` })
      setTimeout(() => setFeedbackMsg(null), 3000)
    } catch (err: any) {
      setFeedbackMsg({ type: "error", text: err.message })
    }
  }

  // Level edit handlers
  const handleLevelChange = (id: string, field: "minPoints" | "maxPoints", value: any) => {
    const lvl = levels.find((l) => l.id === id)
    const current = editingLevel[id] || {
      minPoints: lvl?.minPoints ?? 0,
      maxPoints: lvl?.maxPoints ?? null,
    }
    setEditingLevel({
      ...editingLevel,
      [id]: { ...current, [field]: value },
    })
  }

  const handleSaveLevel = async (id: string) => {
    const edit = editingLevel[id]
    if (!edit) return
    setFeedbackMsg(null)

    try {
      const res = await fetch("/api/admin/recognition/levels", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          minPoints: edit.minPoints,
          maxPoints: edit.maxPoints,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to update recognition level")

      setLevels((prev) => prev.map((l) => (l.id === id ? { ...l, ...edit } : l)))
      setFeedbackMsg({ type: "success", text: "Recognition level threshold updated successfully." })
      setTimeout(() => setFeedbackMsg(null), 3000)
    } catch (err: any) {
      setFeedbackMsg({ type: "error", text: err.message })
    }
  }

  // Manual award handler
  const handleAwardSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmittingAward(true)
    setFeedbackMsg(null)

    try {
      const res = await fetch("/api/admin/recognition/award", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(awardForm),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to award points")

      setFeedbackMsg({
        type: "success",
        text: `Awarded +${data.pointsAwarded} points to user ${awardForm.userId}. New total: ${data.newTotalPoints} pts.`,
      })
      setAwardForm({ userId: "", points: 25, action: "COMMUNITY_PARTICIPATION", note: "" })
      setTimeout(() => {
        setIsAwardModalOpen(false)
        router.refresh()
      }, 1500)
    } catch (err: any) {
      setFeedbackMsg({ type: "error", text: err.message })
    } finally {
      setIsSubmittingAward(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Recognition Engine Console</h1>
          <p className="text-sm text-muted-foreground">
            Configure action reward weights, milestone tier bounds, and administer merit points ledgers.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => setIsAwardModalOpen(true)}
            className="bg-gas-600 hover:bg-gas-700 text-white text-xs font-semibold gap-1.5"
          >
            <Plus className="h-4 w-4" /> Manual Point Award
          </Button>
        </div>
      </div>

      {/* Global Alert Notification */}
      {feedbackMsg && (
        <div
          className={`p-3 text-xs rounded-md flex items-center gap-2 border ${
            feedbackMsg.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          {feedbackMsg.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0" />
          )}
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* Point Rules Configuration */}
      <Card>
        <CardHeader className="py-4">
          <CardTitle className="text-base flex items-center gap-2">
            <Sliders className="h-4 w-4 text-gas-600" /> Action Point Reward Rules
          </CardTitle>
          <CardDescription className="text-xs">
            Administer point credits for user platform actions. Changes apply immediately to new qualifying activities.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y text-xs">
            {rules.map((rule) => {
              const currentEdit = editingRule[rule.action]
              const displayPoints = currentEdit?.points !== undefined ? currentEdit.points : rule.points
              const displayActive = currentEdit?.isActive !== undefined ? currentEdit.isActive : rule.isActive
              const hasChanges = currentEdit && (currentEdit.points !== rule.points || currentEdit.isActive !== rule.isActive)

              return (
                <div
                  key={rule.id}
                  className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-muted/10 transition-colors"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-foreground font-mono">{rule.action}</span>
                      <Badge
                        variant={displayActive ? "default" : "outline"}
                        className={`text-[9px] ${displayActive ? "bg-emerald-600" : "text-muted-foreground"}`}
                      >
                        {displayActive ? "ACTIVE" : "DISABLED"}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground text-xs">
                      {ACTION_DESCRIPTIONS[rule.action] || "Standard recognition action rule"}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="flex items-center gap-1.5">
                      <Label htmlFor={`pts-${rule.action}`} className="text-[11px] text-muted-foreground">
                        Points:
                      </Label>
                      <Input
                        id={`pts-${rule.action}`}
                        type="number"
                        min={0}
                        max={500}
                        value={displayPoints}
                        onChange={(e) => handleRuleChange(rule.action, "points", parseInt(e.target.value) || 0)}
                        className="w-20 h-8 text-xs font-bold text-center"
                      />
                    </div>

                    <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-muted-foreground">
                      <input
                        type="checkbox"
                        checked={displayActive}
                        onChange={(e) => handleRuleChange(rule.action, "isActive", e.target.checked)}
                        className="rounded border-input text-gas-600 focus:ring-gas-500 h-4 w-4"
                      />
                      <span>Active</span>
                    </label>

                    {hasChanges && (
                      <Button
                        size="sm"
                        onClick={() => handleSaveRule(rule.action)}
                        className="bg-gas-600 hover:bg-gas-700 text-white text-xs h-8 gap-1"
                      >
                        <Save className="h-3 w-3" /> Save
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recognition Levels Configuration */}
      <Card>
        <CardHeader className="py-4">
          <CardTitle className="text-base flex items-center gap-2">
            <Trophy className="h-4 w-4 text-gas-600" /> Milestone Tiers Thresholds
          </CardTitle>
          <CardDescription className="text-xs">
            Configure cumulative merit point boundaries for community tiers (Explorer through GAS Champion).
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y text-xs">
            {levels.map((lvl) => {
              const currentEdit = editingLevel[lvl.id]
              const minVal = currentEdit?.minPoints !== undefined ? currentEdit.minPoints : lvl.minPoints
              const maxVal = currentEdit?.maxPoints !== undefined ? currentEdit.maxPoints : lvl.maxPoints
              const hasChanges = currentEdit && (currentEdit.minPoints !== lvl.minPoints || currentEdit.maxPoints !== lvl.maxPoints)

              return (
                <div
                  key={lvl.id}
                  className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-muted/10 transition-colors"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-foreground">{lvl.name}</span>
                      <Badge variant="outline" className="text-[10px] font-mono">
                        Tier {lvl.order}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground text-xs">{lvl.description}</p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="flex items-center gap-1.5">
                      <Label className="text-[11px] text-muted-foreground">Min:</Label>
                      <Input
                        type="number"
                        min={0}
                        value={minVal}
                        onChange={(e) => handleLevelChange(lvl.id, "minPoints", parseInt(e.target.value) || 0)}
                        className="w-20 h-8 text-xs font-mono text-center"
                      />
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Label className="text-[11px] text-muted-foreground">Max:</Label>
                      <Input
                        type="number"
                        min={0}
                        placeholder="None"
                        value={maxVal === null ? "" : maxVal}
                        onChange={(e) =>
                          handleLevelChange(
                            lvl.id,
                            "maxPoints",
                            e.target.value === "" ? null : parseInt(e.target.value) || 0
                          )
                        }
                        className="w-20 h-8 text-xs font-mono text-center"
                      />
                    </div>

                    {hasChanges && (
                      <Button
                        size="sm"
                        onClick={() => handleSaveLevel(lvl.id)}
                        className="bg-gas-600 hover:bg-gas-700 text-white text-xs h-8 gap-1"
                      >
                        <Save className="h-3 w-3" /> Save
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Manual Point Award Modal */}
      {isAwardModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4 relative">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Award className="h-5 w-5 text-gas-600" /> Manual Point Credit
              </h2>
              <button
                onClick={() => setIsAwardModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-muted-foreground">
              Directly credit a member&apos;s recognition ledger. Never overwrites balance directly; an immutable ledger transaction and audit record are generated.
            </p>

            <form onSubmit={handleAwardSubmit} className="space-y-3.5">
              <div className="space-y-1.5">
                <Label htmlFor="userId" className="text-xs font-semibold">
                  Recipient User ID *
                </Label>
                <Input
                  id="userId"
                  required
                  placeholder="e.g., cmtrq4jh50000pwucm7k4krne"
                  value={awardForm.userId}
                  onChange={(e) => setAwardForm({ ...awardForm, userId: e.target.value })}
                  className="text-xs font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="points" className="text-xs font-semibold">
                    Points to Award *
                  </Label>
                  <Input
                    id="points"
                    type="number"
                    min={1}
                    max={1000}
                    required
                    value={awardForm.points}
                    onChange={(e) => setAwardForm({ ...awardForm, points: parseInt(e.target.value) || 0 })}
                    className="text-xs font-bold"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="action" className="text-xs font-semibold">
                    Action Category
                  </Label>
                  <select
                    id="action"
                    value={awardForm.action}
                    onChange={(e) => setAwardForm({ ...awardForm, action: e.target.value })}
                    className="w-full text-xs rounded-md border border-input bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-gas-500"
                  >
                    <option value="COMMUNITY_PARTICIPATION">Community Action</option>
                    <option value="CONTRIBUTION_APPROVED">Value Contribution</option>
                    <option value="IDEA_APPROVED">Innovation Idea</option>
                    <option value="LEARNING_COMPLETE">Learning Reward</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="note" className="text-xs font-semibold">
                  Mandatory Ledger Note *
                </Label>
                <textarea
                  id="note"
                  rows={2}
                  required
                  placeholder="e.g., Exceptional community mentoring during sprint onboarding"
                  value={awardForm.note}
                  onChange={(e) => setAwardForm({ ...awardForm, note: e.target.value })}
                  className="w-full text-xs rounded-md border border-input bg-background p-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-gas-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAwardModalOpen(false)}
                  disabled={isSubmittingAward}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSubmittingAward}
                  className="bg-gas-600 hover:bg-gas-700 text-white text-xs font-semibold"
                >
                  {isSubmittingAward ? "Recording Ledger..." : "Confirm & Award Points"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
