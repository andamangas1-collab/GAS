"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  DollarSign,
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
  User,
  AlertCircle,
  X,
  CreditCard,
  ArrowUpRight,
  Search,
  Eye,
  ChevronLeft,
  ChevronRight,
  Package,
  FileText
} from "lucide-react"

interface CommissionRecord {
  id: string
  amount: string | number
  status: string
  createdAt: string | Date
  adminNote: string | null
  rejectReason: string | null
  user: {
    id: string
    email: string
    referralCode: string
    profile: {
      firstName: string
      lastName: string
    } | null
  }
  order: {
    id: string
    totalAmount: string | number
    status: string
    createdAt: string | Date
    items: Array<{
      product: {
        name: string
      }
    }>
  }
  referral: {
    id: string
    status: string
    referred: {
      email: string
    }
  }
}

export default function AdminCommissionsClient({
  initialCommissions,
}: {
  initialCommissions: CommissionRecord[]
}) {
  const router = useRouter()
  const [commissions, setCommissions] = useState<CommissionRecord[]>(initialCommissions)
  const [filterStatus, setFilterStatus] = useState("ALL")
  const [search, setSearch] = useState("")

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 8

  // Modal States
  const [selectedCommission, setSelectedCommission] = useState<CommissionRecord | null>(null)
  const [detailCommission, setDetailCommission] = useState<CommissionRecord | null>(null)
  const [actionType, setActionType] = useState<"APPROVED" | "PAID" | "REJECTED">("APPROVED")
  const [adminNote, setAdminNote] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const filtered = commissions.filter((c) => {
    if (filterStatus !== "ALL" && c.status !== filterStatus) return false
    if (search.trim()) {
      const q = search.toLowerCase()
      const affName = `${c.user.profile?.firstName || ""} ${c.user.profile?.lastName || ""}`.toLowerCase()
      return (
        c.user.email.toLowerCase().includes(q) ||
        c.user.referralCode.toLowerCase().includes(q) ||
        c.order.id.toLowerCase().includes(q) ||
        c.referral.referred.email.toLowerCase().includes(q) ||
        affName.includes(q)
      )
    }
    return true
  })

  // Metrics
  const totalPending = commissions
    .filter((c) => c.status === "PENDING")
    .reduce((sum, c) => sum + Number(c.amount), 0)

  const totalApproved = commissions
    .filter((c) => c.status === "APPROVED")
    .reduce((sum, c) => sum + Number(c.amount), 0)

  const totalPaid = commissions
    .filter((c) => c.status === "PAID")
    .reduce((sum, c) => sum + Number(c.amount), 0)

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const paginatedCommissions = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const handleSearchChange = (val: string) => {
    setSearch(val)
    setCurrentPage(1)
  }

  const handleStatusFilter = (status: string) => {
    setFilterStatus(status)
    setCurrentPage(1)
  }

  const openActionModal = (comm: CommissionRecord, type: "APPROVED" | "PAID" | "REJECTED") => {
    setSelectedCommission(comm)
    setActionType(type)
    setAdminNote("")
    setFeedback(null)
    setIsModalOpen(true)
  }

  const handleActionSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCommission) return

    setIsProcessing(true)
    setFeedback(null)

    try {
      const res = await fetch(`/api/admin/commissions/${selectedCommission.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: actionType,
          adminNote,
          payoutReference: actionType === "PAID" ? adminNote : undefined,
          rejectReason: actionType === "REJECTED" ? adminNote : undefined,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Failed to update commission status")
      }

      setCommissions((prev) =>
        prev.map((c) =>
          c.id === selectedCommission.id
            ? {
                ...c,
                status: actionType,
                adminNote: adminNote || c.adminNote,
                rejectReason: actionType === "REJECTED" ? adminNote : c.rejectReason,
              }
            : c
        )
      )

      setFeedback({
        type: "success",
        text: `Commission #${selectedCommission.id.slice(-6)} marked as ${actionType}. Audit log entry logged.`,
      })

      setTimeout(() => {
        setIsModalOpen(false)
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
          <h1 className="text-2xl font-bold tracking-tight">Commission Governance & Payouts</h1>
          <p className="text-sm text-muted-foreground">
            Audit, approve, disburse, and manage server-qualified affiliate commission liabilities.
          </p>
        </div>
        <Badge variant="outline" className="text-xs bg-gas-50 text-gas-800 border-gas-200">
          {commissions.length} Total Allocations
        </Badge>
      </div>

      {/* Financial KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-amber-200 bg-amber-50/40">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider">
                Pending Review
              </div>
              <div className="text-2xl font-bold text-amber-900 mt-1">₹{totalPending.toFixed(2)}</div>
            </div>
            <Clock className="h-8 w-8 text-amber-500 opacity-60" />
          </CardContent>
        </Card>

        <Card className="border-teal-200 bg-teal-50/40">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-semibold text-teal-800 uppercase tracking-wider">
                Approved (Awaiting Payout)
              </div>
              <div className="text-2xl font-bold text-teal-900 mt-1">₹{totalApproved.toFixed(2)}</div>
            </div>
            <CheckCircle2 className="h-8 w-8 text-teal-500 opacity-60" />
          </CardContent>
        </Card>

        <Card className="border-emerald-200 bg-emerald-50/40">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider">
                Disbursed / Paid
              </div>
              <div className="text-2xl font-bold text-emerald-900 mt-1">₹{totalPaid.toFixed(2)}</div>
            </div>
            <CreditCard className="h-8 w-8 text-emerald-500 opacity-60" />
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4 flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by affiliate email, referral code, order ID, or buyer..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-9 text-xs"
            />
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {["ALL", "PENDING", "APPROVED", "PAID", "REJECTED"].map((status) => (
              <Button
                key={status}
                size="sm"
                variant={filterStatus === status ? "default" : "outline"}
                onClick={() => handleStatusFilter(status)}
                className={`text-xs h-8 ${filterStatus === status ? "bg-gas-600 hover:bg-gas-700" : ""}`}
              >
                {status}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Commissions Table */}
      <Card>
        <CardHeader className="py-4">
          <CardTitle className="text-base flex items-center justify-between">
            <span>Commissions ({filtered.length})</span>
            <span className="text-xs font-normal text-muted-foreground">
              Showing {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, filtered.length)} of {filtered.length}
            </span>
          </CardTitle>
          <CardDescription className="text-xs">
            Calculated server-side upon verified payment confirmation. Strictly non-manipulable.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-xs">
              No commissions matching search &amp; status criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/40 text-muted-foreground uppercase text-[10px] tracking-wider border-b">
                  <tr>
                    <th className="px-4 py-3">Affiliate Earner</th>
                    <th className="px-4 py-3">Referred Buyer</th>
                    <th className="px-4 py-3">Order / Product</th>
                    <th className="px-4 py-3 text-right">Commission</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {paginatedCommissions.map((c) => (
                    <tr key={c.id} className="hover:bg-muted/10 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-foreground">
                          {c.user.profile?.firstName
                            ? `${c.user.profile.firstName} ${c.user.profile.lastName}`
                            : c.user.email}
                        </div>
                        <div className="text-[11px] text-muted-foreground font-mono">
                          {c.user.referralCode}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-muted-foreground">{c.referral.referred.email}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-foreground">
                          {c.order.items[0]?.product.name || "Product Offer"}
                        </div>
                        <div className="text-[11px] text-muted-foreground font-mono">
                          Order #{c.order.id.slice(-6)} (₹{Number(c.order.totalAmount).toLocaleString()})
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-foreground">
                        ₹{Number(c.amount).toFixed(2)}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={
                            c.status === "PAID"
                              ? "default"
                              : c.status === "APPROVED"
                              ? "outline"
                              : c.status === "PENDING"
                              ? "secondary"
                              : "destructive"
                          }
                          className="text-[10px]"
                        >
                          {c.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-[11px]">
                        {new Date(c.createdAt).toLocaleDateString("en-IN", { dateStyle: "short" })}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setDetailCommission(c)}
                            className="text-[11px] h-7 px-2 text-gas-700 hover:text-gas-800 hover:bg-gas-50"
                          >
                            <Eye className="h-3.5 w-3.5 mr-1" /> Dossier
                          </Button>
                          {c.status === "PENDING" && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openActionModal(c, "APPROVED")}
                                className="text-[11px] h-7 px-2 border-teal-200 text-teal-700 hover:bg-teal-50"
                              >
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openActionModal(c, "REJECTED")}
                                className="text-[11px] h-7 px-2 border-red-200 text-red-700 hover:bg-red-50"
                              >
                                Reject
                              </Button>
                            </>
                          )}
                          {c.status === "APPROVED" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openActionModal(c, "PAID")}
                              className="text-[11px] h-7 px-2.5 border-emerald-300 text-emerald-700 bg-emerald-50/50 hover:bg-emerald-100"
                            >
                              Pay
                            </Button>
                          )}
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

      {/* Commission Detail Dossier Modal */}
      {detailCommission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 space-y-4 relative animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-gas-50 rounded-md border border-gas-200">
                  <DollarSign className="h-5 w-5 text-gas-600" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-foreground">Commission Dossier #{detailCommission.id.slice(-6)}</h2>
                  <p className="text-[11px] text-muted-foreground font-mono">
                    Qualified: {new Date(detailCommission.createdAt).toLocaleString("en-IN")}
                  </p>
                </div>
              </div>
              <button onClick={() => setDetailCommission(null)} className="text-gray-400 hover:text-gray-600 p-1">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 bg-gas-50/50 rounded-lg border border-gas-200 flex items-center justify-between">
              <div>
                <div className="text-[10px] uppercase font-semibold text-gas-800">Calculated Commission Amount</div>
                <div className="text-2xl font-extrabold text-gas-900 mt-0.5">₹{Number(detailCommission.amount).toFixed(2)}</div>
              </div>
              <Badge
                variant={
                  detailCommission.status === "PAID"
                    ? "default"
                    : detailCommission.status === "APPROVED"
                    ? "outline"
                    : detailCommission.status === "PENDING"
                    ? "secondary"
                    : "destructive"
                }
              >
                {detailCommission.status}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-muted/20 border rounded-lg space-y-1">
                <div className="text-[10px] uppercase text-muted-foreground font-semibold">Affiliate Earner</div>
                <div className="font-bold text-foreground">
                  {detailCommission.user.profile?.firstName ? `${detailCommission.user.profile.firstName} ${detailCommission.user.profile.lastName}` : "Affiliate"}
                </div>
                <div className="text-[11px] text-muted-foreground truncate">{detailCommission.user.email}</div>
                <div className="font-mono text-gas-800 font-semibold mt-1">Code: {detailCommission.user.referralCode}</div>
              </div>

              <div className="p-3 bg-muted/20 border rounded-lg space-y-1">
                <div className="text-[10px] uppercase text-muted-foreground font-semibold">Order Information</div>
                <div className="font-bold text-foreground truncate">
                  {detailCommission.order.items[0]?.product.name || "Product Offer"}
                </div>
                <div className="text-[11px] text-muted-foreground">
                  Order ID: #{detailCommission.order.id.slice(-8)}
                </div>
                <div className="font-semibold text-foreground mt-1">
                  Order Total: ₹{Number(detailCommission.order.totalAmount).toLocaleString()}
                </div>
              </div>
            </div>

            {detailCommission.adminNote && (
              <div className="p-3 border rounded-lg text-xs bg-amber-50/30 space-y-1">
                <div className="font-semibold text-amber-900 flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5 text-amber-700" /> Admin Note / Reference
                </div>
                <div className="text-muted-foreground">{detailCommission.adminNote}</div>
              </div>
            )}

            {detailCommission.rejectReason && (
              <div className="p-3 border border-red-200 rounded-lg text-xs bg-red-50/50 space-y-1">
                <div className="font-semibold text-red-900 flex items-center gap-1.5">
                  <AlertCircle className="h-3.5 w-3.5 text-red-600" /> Rejection Reason
                </div>
                <div className="text-red-700">{detailCommission.rejectReason}</div>
              </div>
            )}

            <div className="flex justify-end pt-2 border-t">
              <Button size="sm" variant="outline" onClick={() => setDetailCommission(null)} className="text-xs">
                Close Dossier
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Action Modal (Approve, Disburse, Reject) */}
      {isModalOpen && selectedCommission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4 relative animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                {actionType === "APPROVED" && <CheckCircle2 className="h-5 w-5 text-teal-600" />}
                {actionType === "PAID" && <CreditCard className="h-5 w-5 text-emerald-600" />}
                {actionType === "REJECTED" && <XCircle className="h-5 w-5 text-red-600" />}
                {actionType === "APPROVED" ? "Approve Commission" : actionType === "PAID" ? "Disburse Payout" : "Reject Commission"}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-3 bg-muted/40 rounded-md text-xs space-y-1">
              <div className="font-semibold text-foreground">
                Affiliate: {selectedCommission.user.email}
              </div>
              <div className="text-muted-foreground">
                Amount: <span className="font-bold text-foreground">₹{Number(selectedCommission.amount).toFixed(2)}</span>
              </div>
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
                <Label htmlFor="actionNote" className="text-xs font-semibold">
                  {actionType === "PAID" ? "Bank UTR / Payout Transaction ID" : actionType === "REJECTED" ? "Mandatory Reason for Rejection" : "Audit Note (Optional)"}
                </Label>
                <Input
                  id="actionNote"
                  required={actionType === "REJECTED" || actionType === "PAID"}
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder={
                    actionType === "PAID"
                      ? "e.g. UTR-2026-9938120"
                      : actionType === "REJECTED"
                      ? "e.g. Disqualified due to incentivized traffic"
                      : "e.g. Verified order delivery confirmation"
                  }
                  className="text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
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
                      ? "bg-teal-600 hover:bg-teal-700"
                      : actionType === "PAID"
                      ? "bg-emerald-600 hover:bg-emerald-700"
                      : "bg-red-600 hover:bg-red-700"
                  }`}
                >
                  {isProcessing ? "Processing..." : actionType === "APPROVED" ? "Approve Commission" : actionType === "PAID" ? "Confirm Disbursed" : "Reject Commission"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
