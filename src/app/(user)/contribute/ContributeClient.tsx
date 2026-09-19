"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Sparkles, Plus, X, Lightbulb, CheckCircle2, Clock, AlertCircle, ExternalLink, Award } from "lucide-react"

interface Contribution {
  id: string
  title: string
  description: string
  category: string
  attachmentUrl?: string | null
  status: string
  adminNote: string | null
  pointsAwarded: number | null
  recognitionLevel?: string | null
  createdAt: string | Date
}

export default function ContributeClient({ initialContributions }: { initialContributions: Contribution[] }) {
  const router = useRouter()
  const [contributions, setContributions] = useState<Contribution[]>(initialContributions)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    title: "",
    category: "IDEA",
    description: "",
    attachmentUrl: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    setSuccessMsg(null)

    try {
      const res = await fetch("/api/contributions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit contribution")
      }

      setContributions([data.contribution, ...contributions])
      setSuccessMsg("Contribution submitted successfully! An admin will review it shortly.")
      setFormData({ title: "", category: "IDEA", description: "", attachmentUrl: "" })
      setTimeout(() => {
        setIsModalOpen(false)
        setSuccessMsg(null)
        router.refresh()
      }, 1500)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">V2V™ Value Creation Engine</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Submit ideas, feedback, tutorials, or educational resources to earn community recognition points.
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => setIsModalOpen(true)}
          className="bg-gas-600 hover:bg-gas-700 text-white text-xs font-semibold gap-1.5"
        >
          <Plus className="h-4 w-4" /> Submit Value Item
        </Button>
      </div>

      {/* Info Banner */}
      <Card className="bg-gradient-to-r from-gas-50 to-emerald-50 border-gas-200">
        <CardContent className="p-4 flex items-start gap-3">
          <Lightbulb className="h-5 w-5 text-gas-700 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <div className="font-semibold text-gas-900">How Value-to-Value (V2V™) Works</div>
            <p className="text-gas-700 leading-relaxed">
              Every genuine contribution is reviewed by administrators. When approved, you are awarded merit-based
              <strong> Recognition Points</strong> that advance your community standing and unlock verified badges.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Contributions List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-gas-600" /> My Submitted Contributions
          </CardTitle>
          <CardDescription className="text-xs">
            Review status, admin notes, and earned recognition points.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {contributions.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground text-xs space-y-2">
              <Sparkles className="h-8 w-8 mx-auto text-gas-500 opacity-60" />
              <div className="font-semibold">No contributions submitted yet</div>
              <p className="text-[11px] max-w-sm mx-auto">
                Value-to-Value (V2V™) rewards contributors who help our community grow through practical feedback and resources.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsModalOpen(true)}
                className="mt-2 text-xs"
              >
                Submit your first contribution
              </Button>
            </div>
          ) : (
            <div className="divide-y text-xs">
              {contributions.map((c) => (
                <div key={c.id} className="py-4 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground text-sm">{c.title}</span>
                      <Badge variant="outline" className="text-[10px] uppercase font-mono">
                        {c.category.replace(/_/g, " ")}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground text-xs leading-relaxed">{c.description}</p>
                    {c.attachmentUrl && (
                      <div className="pt-1">
                        <a
                          href={c.attachmentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-gas-600 hover:text-gas-800 underline font-medium"
                        >
                          <ExternalLink className="h-3 w-3" /> View Attachment / Resource
                        </a>
                      </div>
                    )}
                    {c.adminNote && (
                      <div className="p-2 bg-muted/40 rounded border text-[11px] text-muted-foreground mt-2">
                        <span className="font-medium text-foreground">Admin Feedback:</span> {c.adminNote}
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground pt-1">
                      <Clock className="h-3 w-3" />
                      <span>{new Date(c.createdAt).toLocaleDateString("en-IN", { dateStyle: "medium" })}</span>
                    </div>
                  </div>
                  <div className="flex sm:flex-col items-end justify-between sm:justify-start gap-2 shrink-0">
                    <Badge
                      variant={
                        c.status === "APPROVED"
                          ? "default"
                          : c.status === "REJECTED"
                          ? "destructive"
                          : "outline"
                      }
                      className="text-[10px]"
                    >
                      {c.status}
                    </Badge>
                    {c.pointsAwarded && (
                      <span className="text-[11px] font-bold text-gas-700 bg-gas-50 px-2 py-0.5 rounded border border-gas-200">
                        +{c.pointsAwarded} pts
                      </span>
                    )}
                    {c.recognitionLevel && (
                      <span className="text-[10px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200 flex items-center gap-1">
                        <Award className="h-3 w-3 text-purple-600" /> {c.recognitionLevel}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Submission Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 space-y-4 relative animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-gas-600" />
                <h2 className="text-lg font-bold text-gray-900">Submit Value Contribution</h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 rounded-md p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-md flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-md flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="title" className="text-xs font-semibold">
                  Contribution Title *
                </Label>
                <Input
                  id="title"
                  placeholder="e.g., Marketing strategy for affiliate onboarding"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="category" className="text-xs font-semibold">
                  Category *
                </Label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full text-xs rounded-md border border-input bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-gas-500"
                >
                  <option value="IDEA">Idea & Innovation</option>
                  <option value="FEEDBACK">Platform Feedback</option>
                  <option value="PRODUCT_IMPROVEMENT">Product Improvement</option>
                  <option value="EDUCATIONAL_CONTENT">Educational Content / Tutorial</option>
                  <option value="COMMUNITY">Community Initiative</option>
                  <option value="RESOURCE">Resource / Guide</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="description" className="text-xs font-semibold">
                  Detailed Description *
                </Label>
                <textarea
                  id="description"
                  rows={4}
                  required
                  placeholder="Explain your idea, rationale, implementation steps, or practical value for the community..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full text-xs rounded-md border border-input bg-background p-3 text-foreground focus:outline-none focus:ring-2 focus:ring-gas-500"
                />
                <span className="text-[10px] text-muted-foreground">Minimum 20 characters required.</span>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="attachmentUrl" className="text-xs font-semibold">
                  Attachment / Resource Link (Optional)
                </Label>
                <Input
                  id="attachmentUrl"
                  type="url"
                  placeholder="https://drive.google.com/... or https://github.com/..."
                  value={formData.attachmentUrl}
                  onChange={(e) => setFormData({ ...formData, attachmentUrl: e.target.value })}
                  className="text-xs"
                />
                <span className="text-[10px] text-muted-foreground">
                  External link to a document, screenshot, presentation, or code repository.
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSubmitting}
                  className="bg-gas-600 hover:bg-gas-700 text-white text-xs font-semibold"
                >
                  {isSubmitting ? "Submitting..." : "Submit for Review"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
