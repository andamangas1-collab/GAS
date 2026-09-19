"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
  User,
  AlertCircle,
  X,
  Award,
  ExternalLink,
  Search,
  Eye,
  ChevronLeft,
  ChevronRight,
  FileText
} from "lucide-react"

interface ContributionItem {
  id: string
  title: string
  description: string
  category: string
  attachmentUrl: string | null
  status: string
  adminNote: string | null
  pointsAwarded: number | null
  recognitionLevel: string | null
  createdAt: string | Date
  user: {
    id: string
    email: string
    referralCode: string
    profile: {
      firstName: string
      lastName: string
    } | null
  }
}

export default function AdminContributionsClient({
  initialContributions,
}: {
  initialContributions: ContributionItem[]
}) {
  const router = useRouter()
  const [contributions, setContributions] = useState<ContributionItem[]>(initialContributions)
  const [filterStatus, setFilterStatus] = useState<string>("ALL")
  const [search, setSearch] = useState("")

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 6

  // Modal States
  const [isActionModalOpen, setIsActionModalOpen] = useState(false)
  const [selectedContribution, setSelectedContribution] = useState<ContributionItem | null>(null)
  const [detailContribution, setDetailContribution] = useState<ContributionItem | null>(null)
  const [actionType, setActionType] = useState<"UNDER_REVIEW" | "APPROVED" | "REJECTED">("APPROVED")
  const [points, setPoints] = useState<number>(50)
  const [recognitionLevel, setRecognitionLevel] = useState<string>("")
  const [adminNote, setAdminNote] = useState<string>("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const filtered = contributions.filter((c) => {
    if (filterStatus !== "ALL" && c.status !== filterStatus) return false
    if (search.trim()) {
      const q = search.toLowerCase()
      const author = `${c.user.profile?.firstName || ""} ${c.user.profile?.lastName || ""}`.toLowerCase()
      return (
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        c.user.email.toLowerCase().includes(q) ||
        author.includes(q)
      )
    }
    return true
  })

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const paginatedItems = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const handleSearchChange = (val: string) => {
    setSearch(val)
    setCurrentPage(1)
  }

  const handleStatusFilterChange = (val: string) => {
    setFilterStatus(val)
    setCurrentPage(1)
  }

  const openActionModal = (item: ContributionItem, type: "UNDER_REVIEW" | "APPROVED" | "REJECTED") => {
    setSelectedContribution(item)
    setActionType(type)
    setPoints(type === "APPROVED" ? 50 : 0)
    setRecognitionLevel(item.recognitionLevel || "")
    setAdminNote(
      type === "APPROVED"
        ? "Excellent community value! Points awarded."
        : type === "UNDER_REVIEW"
        ? "Assigned for editorial verification."
        : ""
    )
    setFeedbackMsg(null)
    setIsActionModalOpen(true)
  }

  const handleActionSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedContribution) return

    setIsProcessing(true)
    setFeedbackMsg(null)

    try {
      const res = await fetch(`/api/admin/contributions/${selectedContribution.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: actionType,
          pointsAwarded: actionType === "APPROVED" ? points : undefined,
          recognitionLevel: actionType === "APPROVED" && recognitionLevel ? recognitionLevel : undefined,
          adminNote,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Failed to update contribution status")
      }

      setContributions((prev) =>
        prev.map((c) =>
          c.id === selectedContribution.id
            ? {
                ...c,
                status: actionType,
                pointsAwarded: actionType === "APPROVED" ? points : c.pointsAwarded,
                recognitionLevel: actionType === "APPROVED" ? recognitionLevel : c.recognitionLevel,
                adminNote,
              }
            : c
        )
      )

      setFeedbackMsg({
        type: "success",
        text: `Item successfully marked as ${actionType}. Recognition ledger credited & audit log entry created.`,
      })

      setTimeout(() => {
        setIsActionModalOpen(false)
        setFeedbackMsg(null)
        router.refresh()
      }, 1000)
    } catch (err: any) {
      setFeedbackMsg({ type: "error", text: err.message })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">V2V™ Value Contribution Queue</h1>
          <p className="text-sm text-muted-foreground">
            Review community ideas, assign recognition points, and cultivate decentralized ecosystem value.
          </p>
        </div>
        <Badge variant="outline" className="text-xs bg-gas-50 text-gas-800 border-gas-200">
          {contributions.length} Contributions Total
        </Badge>
      </div>

      {/* Filter & Search Bar */}
      <Card>
        <CardContent className="p-4 flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by title, description, category, or author..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-9 text-xs"
            />
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {["ALL", "SUBMITTED", "UNDER_REVIEW", "APPROVED", "REJECTED"].map((status) => (
              <Button
                key={status}
                size="sm"
                variant={filterStatus === status ? "default" : "outline"}
                onClick={() => handleStatusFilterChange(status)}
                className={`text-xs h-8 ${filterStatus === status ? "bg-gas-600 hover:bg-gas-700" : ""}`}
              >
                {status}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Contributions List */}
      <Card>
        <CardHeader className="py-4">
          <CardTitle className="text-base flex items-center justify-between">
            <span>Submitted Items ({filtered.length})</span>
            <span className="text-xs font-normal text-muted-foreground">
              Showing {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, filtered.length)} of {filtered.length}
            </span>
          </CardTitle>
          <CardDescription className="text-xs">
            Review pending submissions from affiliates and community participants. Points awarded directly credit the ledger.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-xs">
              No contributions found matching criteria.
            </div>
          ) : (
            <div className="divide-y text-xs">
              {paginatedItems.map((item) => (
                <div key={item.id} className="p-4 flex flex-col md:flex-row md:items-start justify-between gap-4 hover:bg-muted/10 transition-colors">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-foreground">{item.title}</span>
                      <Badge variant="outline" className="text-[10px] font-mono uppercase bg-muted/30">
                        {item.category.replace(/_/g, " ")}
                      </Badge>
                      <Badge
                        variant={
                          item.status === "APPROVED"
                            ? "default"
                            : item.status === "UNDER_REVIEW"
                            ? "secondary"
                            : item.status === "REJECTED"
                            ? "destructive"
                            : "outline"
                        }
                        className="text-[10px]"
                      >
                        {item.status}
                      </Badge>
                    </div>

                    <p className="text-xs text-muted-foreground line-clamp-2">{item.description}</p>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground pt-1">
                      <div className="flex items-center gap-1 font-medium text-foreground">
                        <User className="h-3 w-3 text-gas-600" />
                        <span>
                          {item.user.profile?.firstName
                            ? `${item.user.profile.firstName} ${item.user.profile.lastName}`
                            : item.user.email}
                        </span>
                        <span className="text-muted-foreground font-normal">({item.user.referralCode})</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{new Date(item.createdAt).toLocaleDateString("en-IN", { dateStyle: "medium" })}</span>
                      </div>
                      {item.pointsAwarded && (
                        <span className="font-semibold text-gas-700 bg-gas-50 px-2 py-0.5 rounded border border-gas-200 flex items-center gap-1">
                          <Award className="h-3 w-3 text-gas-600" /> +{item.pointsAwarded} pts
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 self-start">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setDetailContribution(item)}
                      className="text-xs h-8 px-2 text-gas-700 hover:text-gas-800 hover:bg-gas-50"
                    >
                      <Eye className="h-3.5 w-3.5 mr-1" /> Dossier
                    </Button>
                    {item.status !== "APPROVED" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openActionModal(item, "APPROVED")}
                        className="text-xs h-8 text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                      >
                        Approve
                      </Button>
                    )}
                    {item.status === "SUBMITTED" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openActionModal(item, "UNDER_REVIEW")}
                        className="text-xs h-8"
                      >
                        Review
                      </Button>
                    )}
                    {item.status !== "REJECTED" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openActionModal(item, "REJECTED")}
                        className="text-xs h-8 text-red-700 border-red-200 hover:bg-red-50"
                      >
                        Reject
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="p-3 border-t flex items-center justify-between text-xs bg-muted/10">
              <span className="text-muted-foreground">
                Page {currentPage} of {totalPages} ({filtered.length} total entries)
              </span>
              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="h-7 px-2.5 text-xs gap-1"
                >
                  <ChevronLeft className="h-3 w-3" /> Prev
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="h-7 px-2.5 text-xs gap-1"
                >
                  Next <ChevronRight className="h-3 w-3" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Contribution Detail Dossier Modal */}
      {detailContribution && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 space-y-4 relative animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-gas-50 rounded-md border border-gas-200">
                  <Sparkles className="h-5 w-5 text-gas-600" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-foreground">Contribution Dossier</h2>
                  <p className="text-[11px] text-muted-foreground font-mono">ID: {detailContribution.id}</p>
                </div>
              </div>
              <button onClick={() => setDetailContribution(null)} className="text-gray-400 hover:text-gray-600 p-1">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <div className="text-[10px] uppercase text-muted-foreground font-semibold">Title</div>
                <div className="text-sm font-bold text-foreground mt-0.5">{detailContribution.title}</div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-2.5 bg-muted/20 border rounded-md">
                  <div className="text-[10px] uppercase text-muted-foreground font-semibold">Category</div>
                  <div className="font-semibold text-foreground mt-0.5">{detailContribution.category.replace(/_/g, " ")}</div>
                </div>
                <div className="p-2.5 bg-muted/20 border rounded-md">
                  <div className="text-[10px] uppercase text-muted-foreground font-semibold">Status</div>
                  <Badge className="mt-0.5 text-[10px]">{detailContribution.status}</Badge>
                </div>
              </div>

              <div className="p-3 bg-muted/20 border rounded-md space-y-1">
                <div className="text-[10px] uppercase text-muted-foreground font-semibold">Full Description</div>
                <p className="text-xs text-foreground whitespace-pre-wrap">{detailContribution.description}</p>
              </div>

              {detailContribution.attachmentUrl && (
                <div className="p-2.5 border rounded-md bg-blue-50/30 flex items-center justify-between">
                  <span className="font-semibold text-blue-900">Submitted Attachment</span>
                  <a
                    href={detailContribution.attachmentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-gas-600 hover:underline font-semibold"
                  >
                    <ExternalLink className="h-3 w-3" /> Open File
                  </a>
                </div>
              )}

              {detailContribution.adminNote && (
                <div className="p-3 border rounded-md bg-amber-50/30 text-xs">
                  <div className="font-semibold text-amber-900 flex items-center gap-1">
                    <FileText className="h-3 w-3 text-amber-700" /> Admin Feedback / Note
                  </div>
                  <p className="text-muted-foreground mt-1">{detailContribution.adminNote}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t">
              <Button size="sm" variant="outline" onClick={() => setDetailContribution(null)} className="text-xs">
                Close Dossier
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Action Modal (Approve, Review, Reject) */}
      {isActionModalOpen && selectedContribution && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4 relative animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                {actionType === "APPROVED" ? (
                  <>
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" /> Approve Contribution
                  </>
                ) : actionType === "UNDER_REVIEW" ? (
                  <>
                    <Clock className="h-5 w-5 text-blue-600" /> Move Under Review
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5 text-red-600" /> Reject Contribution
                  </>
                )}
              </h2>
              <button onClick={() => setIsActionModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-3 bg-muted/40 rounded-md text-xs space-y-1">
              <div className="font-semibold text-foreground">{selectedContribution.title}</div>
              <div className="text-muted-foreground">
                Author: {selectedContribution.user.email} • Category: {selectedContribution.category}
              </div>
            </div>

            {feedbackMsg && (
              <div
                className={`p-3 text-xs rounded-md flex items-center gap-2 border ${
                  feedbackMsg.type === "success"
                    ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                    : "bg-red-50 border-red-200 text-red-700"
                }`}
              >
                {feedbackMsg.type === "success" ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
                <span>{feedbackMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleActionSubmit} className="space-y-4">
              {actionType === "APPROVED" && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="points" className="text-xs font-semibold">
                      Points to Award
                    </Label>
                    <Input
                      id="points"
                      type="number"
                      min={0}
                      max={500}
                      value={points}
                      onChange={(e) => setPoints(Number(e.target.value))}
                      className="text-xs"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="level" className="text-xs font-semibold">
                      Assign Recognition Tier
                    </Label>
                    <select
                      id="level"
                      value={recognitionLevel}
                      onChange={(e) => setRecognitionLevel(e.target.value)}
                      className="w-full text-xs rounded-md border border-input bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-gas-500"
                    >
                      <option value="">Auto-calculate by points</option>
                      <option value="CONTRIBUTOR">Contributor</option>
                      <option value="VALUE_BUILDER">Value Builder</option>
                      <option value="COMMUNITY_BUILDER">Community Builder</option>
                      <option value="GAS_CHAMPION">GAS Champion</option>
                    </select>
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="adminNote" className="text-xs font-semibold">
                  {actionType === "REJECTED" ? "Reason for Rejection (Visible to User)" : "Administrative Feedback / Note"}
                </Label>
                <textarea
                  id="adminNote"
                  rows={3}
                  required={actionType === "REJECTED"}
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder={
                    actionType === "REJECTED"
                      ? "Explain clearly why this contribution does not meet publication standards..."
                      : "Provide encouraging feedback to the creator..."
                  }
                  className="w-full text-xs rounded-md border border-input bg-background p-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-gas-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsActionModalOpen(false)}
                  disabled={isProcessing}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isProcessing}
                  className={`text-white text-xs font-semibold ${
                    actionType === "APPROVED"
                      ? "bg-emerald-600 hover:bg-emerald-700"
                      : actionType === "UNDER_REVIEW"
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "bg-red-600 hover:bg-red-700"
                  }`}
                >
                  {isProcessing ? "Processing..." : `Confirm ${actionType.replace("_", " ")}`}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
