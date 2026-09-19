"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Share2,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  UserCheck,
  Eye,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  X,
  User,
  ShoppingBag,
  AlertCircle
} from "lucide-react"

interface ReferralRecord {
  id: string
  status: string
  isSelfReferral: boolean
  isFlagged: boolean
  flagReason: string | null
  registeredAt: string | Date | null
  qualifiedAt: string | Date | null
  createdAt: string | Date
  referrer: {
    id?: string
    email: string
    referralCode: string
    profile: {
      firstName: string
      lastName: string
      mobile?: string | null
    } | null
  }
  referred: {
    id?: string
    email: string
    profile: {
      firstName: string
      lastName: string
      mobile?: string | null
    } | null
  }
  order: {
    id: string
    totalAmount: string | number
    status: string
  } | null
}

export default function AdminReferralsClient({
  initialReferrals,
}: {
  initialReferrals: ReferralRecord[]
}) {
  const router = useRouter()
  const [referrals, setReferrals] = useState<ReferralRecord[]>(initialReferrals)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 8

  // Modal States
  const [detailReferral, setDetailReferral] = useState<ReferralRecord | null>(null)
  const [actionReferral, setActionReferral] = useState<ReferralRecord | null>(null)
  const [actionStatus, setActionStatus] = useState<string>("QUALIFIED")
  const [isFlagged, setIsFlagged] = useState<boolean>(false)
  const [flagReason, setFlagReason] = useState<string>("")
  const [adminNote, setAdminNote] = useState<string>("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const filtered = referrals.filter((r) => {
    if (statusFilter !== "ALL" && r.status !== statusFilter) return false
    if (search.trim()) {
      const q = search.toLowerCase()
      const referrerName = `${r.referrer.profile?.firstName || ""} ${r.referrer.profile?.lastName || ""}`.toLowerCase()
      const referredName = `${r.referred.profile?.firstName || ""} ${r.referred.profile?.lastName || ""}`.toLowerCase()
      return (
        r.referrer.email.toLowerCase().includes(q) ||
        r.referrer.referralCode.toLowerCase().includes(q) ||
        r.referred.email.toLowerCase().includes(q) ||
        referrerName.includes(q) ||
        referredName.includes(q)
      )
    }
    return true
  })

  const qualifiedCount = referrals.filter((r) => r.status === "QUALIFIED").length
  const flaggedCount = referrals.filter((r) => r.isFlagged || r.isSelfReferral).length

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const paginatedReferrals = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const handleSearchChange = (val: string) => {
    setSearch(val)
    setCurrentPage(1)
  }

  const handleStatusFilterChange = (val: string) => {
    setStatusFilter(val)
    setCurrentPage(1)
  }

  const openActionModal = (ref: ReferralRecord) => {
    setActionReferral(ref)
    setActionStatus(ref.status)
    setIsFlagged(ref.isFlagged)
    setFlagReason(ref.flagReason || "")
    setAdminNote("")
    setFeedback(null)
  }

  const handleActionSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!actionReferral) return

    setIsProcessing(true)
    setFeedback(null)

    try {
      const res = await fetch(`/api/admin/referrals/${actionReferral.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: actionStatus,
          isFlagged,
          flagReason: isFlagged ? flagReason : null,
          adminNote,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Failed to update referral")
      }

      setReferrals((prev) =>
        prev.map((r) =>
          r.id === actionReferral.id
            ? {
                ...r,
                status: actionStatus,
                isFlagged,
                flagReason: isFlagged ? flagReason : null,
              }
            : r
        )
      )

      setFeedback({
        type: "success",
        text: `Referral attribution updated. Audit log created.`,
      })

      setTimeout(() => {
        setActionReferral(null)
        setFeedback(null)
        router.refresh()
      }, 1000)
    } catch (err: any) {
      setFeedback({ type: "error", text: err.message })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Referral Attribution & Network</h1>
          <p className="text-sm text-muted-foreground">
            Inspect direct member attributions, qualification milestones, and anti-fraud alerts.
          </p>
        </div>
        <Badge variant="outline" className="text-xs bg-gas-50 text-gas-800 border-gas-200">
          {referrals.length} Attributions Tracked
        </Badge>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-blue-200 bg-blue-50/40">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-semibold text-blue-800 uppercase tracking-wider">
                Total Attributed
              </div>
              <div className="text-2xl font-bold text-blue-900 mt-1">{referrals.length}</div>
            </div>
            <Share2 className="h-8 w-8 text-blue-500 opacity-60" />
          </CardContent>
        </Card>

        <Card className="border-emerald-200 bg-emerald-50/40">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider">
                Qualified (Purchased)
              </div>
              <div className="text-2xl font-bold text-emerald-900 mt-1">{qualifiedCount}</div>
            </div>
            <CheckCircle2 className="h-8 w-8 text-emerald-500 opacity-60" />
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50/40">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-semibold text-red-800 uppercase tracking-wider">
                Flagged / Self-Referrals
              </div>
              <div className="text-2xl font-bold text-red-900 mt-1">{flaggedCount}</div>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-500 opacity-60" />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-4 flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by referrer code, name, or email..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-9 text-xs"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => handleStatusFilterChange(e.target.value)}
            className="text-xs rounded-md border border-input bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-gas-500 w-full sm:w-auto"
          >
            <option value="ALL">All Attribution Statuses</option>
            <option value="QUALIFIED">QUALIFIED</option>
            <option value="REGISTERED">REGISTERED</option>
            <option value="PURCHASED">PURCHASED</option>
            <option value="REJECTED">REJECTED</option>
          </select>
        </CardContent>
      </Card>

      {/* Referrals Table */}
      <Card>
        <CardHeader className="py-4">
          <CardTitle className="text-base flex items-center justify-between">
            <span>Attribution Ledger ({filtered.length})</span>
            <span className="text-xs font-normal text-muted-foreground">
              Showing {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, filtered.length)} of {filtered.length}
            </span>
          </CardTitle>
          <CardDescription className="text-xs">
            Direct single-tier affiliate attributions. Self-referrals and duplicate links are detected server-side.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-xs">
              No referral attributions matching criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/40 text-muted-foreground uppercase text-[10px] tracking-wider border-b">
                  <tr>
                    <th className="px-4 py-3">Referrer</th>
                    <th className="px-4 py-3">Referred Member</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Anti-Fraud</th>
                    <th className="px-4 py-3">Order Total</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {paginatedReferrals.map((r) => (
                    <tr key={r.id} className="hover:bg-muted/10 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-foreground">
                          {r.referrer.profile?.firstName
                            ? `${r.referrer.profile.firstName} ${r.referrer.profile.lastName}`
                            : r.referrer.email}
                        </div>
                        <div className="text-[11px] font-mono text-gas-800 font-medium">
                          {r.referrer.referralCode}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-foreground">
                          {r.referred.profile?.firstName
                            ? `${r.referred.profile.firstName} ${r.referred.profile.lastName}`
                            : r.referred.email}
                        </div>
                        <div className="text-[11px] text-muted-foreground">{r.referred.email}</div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={
                            r.status === "QUALIFIED"
                              ? "default"
                              : r.status === "REJECTED"
                              ? "destructive"
                              : "outline"
                          }
                          className="text-[10px]"
                        >
                          {r.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        {r.isSelfReferral || r.isFlagged ? (
                          <span className="text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1 w-fit">
                            <AlertTriangle className="h-3 w-3 text-red-600" />
                            {r.flagReason || "Self-Referral"}
                          </span>
                        ) : (
                          <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-medium flex items-center gap-1 w-fit">
                            <ShieldCheck className="h-3 w-3 text-emerald-600" /> Clean
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-medium">
                        {r.order ? (
                          <span>₹{Number(r.order.totalAmount).toLocaleString()}</span>
                        ) : (
                          <span className="text-muted-foreground text-[11px]">No order yet</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setDetailReferral(r)}
                            className="text-[11px] h-7 px-2 text-gas-700 hover:text-gas-800 hover:bg-gas-50"
                          >
                            <Eye className="h-3.5 w-3.5 mr-1" /> Dossier
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openActionModal(r)}
                            className="text-[11px] h-7 px-2"
                          >
                            Manage
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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

      {/* Referral Detail Modal */}
      {detailReferral && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 space-y-4 relative animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-gas-50 rounded-md border border-gas-200">
                  <Share2 className="h-5 w-5 text-gas-600" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-foreground">Attribution Dossier #{detailReferral.id.slice(-8)}</h2>
                  <p className="text-[11px] text-muted-foreground font-mono">Created: {new Date(detailReferral.createdAt).toLocaleString("en-IN")}</p>
                </div>
              </div>
              <button onClick={() => setDetailReferral(null)} className="text-gray-400 hover:text-gray-600 p-1">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-blue-50/40 border border-blue-200 rounded-lg space-y-1">
                <div className="text-[10px] uppercase text-blue-800 font-semibold">Referrer (Affiliate)</div>
                <div className="font-bold text-foreground">
                  {detailReferral.referrer.profile?.firstName ? `${detailReferral.referrer.profile.firstName} ${detailReferral.referrer.profile.lastName}` : "Affiliate"}
                </div>
                <div className="text-[11px] text-muted-foreground">{detailReferral.referrer.email}</div>
                <div className="font-mono text-gas-800 font-semibold mt-1">Code: {detailReferral.referrer.referralCode}</div>
              </div>

              <div className="p-3 bg-indigo-50/40 border border-indigo-200 rounded-lg space-y-1">
                <div className="text-[10px] uppercase text-indigo-800 font-semibold">Referred Member</div>
                <div className="font-bold text-foreground">
                  {detailReferral.referred.profile?.firstName ? `${detailReferral.referred.profile.firstName} ${detailReferral.referred.profile.lastName}` : "Member"}
                </div>
                <div className="text-[11px] text-muted-foreground">{detailReferral.referred.email}</div>
                <div className="text-[10px] text-muted-foreground mt-1">Registered: {detailReferral.registeredAt ? new Date(detailReferral.registeredAt).toLocaleDateString("en-IN") : "Pending"}</div>
              </div>
            </div>

            {/* Anti-Fraud & Qualification status */}
            <div className="p-3 border rounded-lg text-xs space-y-2 bg-muted/20">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Qualification Status:</span>
                <Badge variant={detailReferral.status === "QUALIFIED" ? "default" : "outline"} className="text-[10px]">
                  {detailReferral.status}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Anti-Fraud Security Check:</span>
                {detailReferral.isSelfReferral || detailReferral.isFlagged ? (
                  <span className="text-red-700 font-bold flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" /> Flagged ({detailReferral.flagReason || "Self-Referral"})
                  </span>
                ) : (
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3" /> Clean Verification
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Linked Order:</span>
                <span className="font-semibold text-foreground">
                  {detailReferral.order ? `₹${Number(detailReferral.order.totalAmount).toLocaleString()} (${detailReferral.order.status})` : "None"}
                </span>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t">
              <Button size="sm" variant="outline" onClick={() => setDetailReferral(null)} className="text-xs">
                Close Dossier
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Referral Action Modal (Status / Anti-Fraud Flag) */}
      {actionReferral && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4 relative animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-gas-600" /> Manage Attribution #{actionReferral.id.slice(-8)}
              </h2>
              <button onClick={() => setActionReferral(null)} className="text-gray-400 hover:text-gray-600 p-1">
                <X className="h-5 w-5" />
              </button>
            </div>

            {feedback && (
              <div
                className={`p-3 text-xs rounded-md flex items-center gap-2 border ${
                  feedback.type === "success"
                    ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                    : "bg-red-50 border-red-200 text-red-700"
                }`}
              >
                {feedback.type === "success" ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
                <span>{feedback.text}</span>
              </div>
            )}

            <form onSubmit={handleActionSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Attribution Status</Label>
                <select
                  value={actionStatus}
                  onChange={(e) => setActionStatus(e.target.value)}
                  className="w-full text-xs rounded-md border border-input bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-gas-500"
                >
                  <option value="QUALIFIED">QUALIFIED (Eligible for commission calculation)</option>
                  <option value="PURCHASED">PURCHASED (Order placed, awaiting validation)</option>
                  <option value="REGISTERED">REGISTERED (Signed up via link)</option>
                  <option value="REJECTED">REJECTED (Disqualified)</option>
                </select>
              </div>

              <div className="p-3 border rounded-md space-y-2 bg-muted/20">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold cursor-pointer" htmlFor="fraudFlag">
                    Flag as Suspicious / Fraudulent
                  </Label>
                  <input
                    id="fraudFlag"
                    type="checkbox"
                    checked={isFlagged}
                    onChange={(e) => setIsFlagged(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-gas-600 focus:ring-gas-500"
                  />
                </div>
                {isFlagged && (
                  <div className="space-y-1 pt-1">
                    <Label className="text-[11px] text-muted-foreground">Flag Reason</Label>
                    <Input
                      value={flagReason}
                      onChange={(e) => setFlagReason(e.target.value)}
                      placeholder="e.g. Duplicate IP match / Suspicious traffic"
                      className="text-xs h-8"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Administrative Note</Label>
                <textarea
                  rows={2}
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="Audit reason for this update..."
                  className="w-full text-xs rounded-md border border-input bg-background p-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-gas-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setActionReferral(null)}
                  disabled={isProcessing}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isProcessing}
                  className="bg-gas-600 hover:bg-gas-700 text-white text-xs font-semibold"
                >
                  {isProcessing ? "Saving..." : "Save Attribution"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
