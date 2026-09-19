"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Search,
  ShoppingBag,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Eye,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  X,
  CreditCard,
  User,
  Package
} from "lucide-react"

interface OrderRecord {
  id: string
  totalAmount: string | number
  status: string
  createdAt: string | Date
  notes?: string | null
  user: {
    id: string
    email: string
    profile: {
      firstName: string
      lastName: string
      mobile?: string | null
    } | null
  }
  payment: {
    id?: string
    status: string
    method: string | null
    razorpayOrderId: string
    razorpayPaymentId?: string | null
  } | null
  items: Array<{
    id: string
    quantity: number
    price: string | number
    product: {
      id?: string
      name: string
      category: string
    }
  }>
  commissions: Array<{
    id?: string
    amount: string | number
    status: string
  }>
}

export default function AdminOrdersClient({ initialOrders }: { initialOrders: OrderRecord[] }) {
  const router = useRouter()
  const [orders, setOrders] = useState<OrderRecord[]>(initialOrders)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 8

  // Modal States
  const [detailOrder, setDetailOrder] = useState<OrderRecord | null>(null)
  const [actionOrder, setActionOrder] = useState<OrderRecord | null>(null)
  const [newStatus, setNewStatus] = useState<string>("REFUNDED")
  const [adminNote, setAdminNote] = useState<string>("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const filtered = orders.filter((o) => {
    if (statusFilter !== "ALL" && o.status !== statusFilter) return false
    if (search.trim()) {
      const q = search.toLowerCase()
      const customer = `${o.user.profile?.firstName || ""} ${o.user.profile?.lastName || ""}`.toLowerCase()
      return (
        o.id.toLowerCase().includes(q) ||
        o.user.email.toLowerCase().includes(q) ||
        customer.includes(q)
      )
    }
    return true
  })

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const paginatedOrders = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const handleSearchChange = (val: string) => {
    setSearch(val)
    setCurrentPage(1)
  }

  const handleStatusFilterChange = (val: string) => {
    setStatusFilter(val)
    setCurrentPage(1)
  }

  const openActionModal = (order: OrderRecord, targetStatus: "REFUNDED" | "CANCELLED") => {
    setActionOrder(order)
    setNewStatus(targetStatus)
    setAdminNote(targetStatus === "REFUNDED" ? "Customer requested refund" : "Administrative cancellation")
    setFeedback(null)
  }

  const handleStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!actionOrder) return

    setIsProcessing(true)
    setFeedback(null)

    try {
      const res = await fetch(`/api/admin/orders/${actionOrder.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          adminNote,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Failed to update order status")
      }

      setOrders((prev) =>
        prev.map((o) => (o.id === actionOrder.id ? { ...o, status: newStatus } : o))
      )

      setFeedback({
        type: "success",
        text: `Order #${actionOrder.id.slice(-8)} status updated to ${newStatus}. Commissions adjusted & audit log recorded.`,
      })

      setTimeout(() => {
        setActionOrder(null)
        setFeedback(null)
        router.refresh()
      }, 1200)
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
          <h1 className="text-2xl font-bold tracking-tight">Order & Transaction Ledger</h1>
          <p className="text-sm text-muted-foreground">
            Audit customer orders, server-calculated totals, and verified gateway payment records.
          </p>
        </div>
        <Badge variant="outline" className="text-xs bg-gas-50 text-gas-800 border-gas-200">
          {orders.length} Total Orders
        </Badge>
      </div>

      <Card>
        <CardContent className="p-4 flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by order ID, customer name, or email..."
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
            <option value="ALL">All Order Statuses</option>
            <option value="PAID">PAID</option>
            <option value="PENDING">PENDING</option>
            <option value="CANCELLED">CANCELLED</option>
            <option value="REFUNDED">REFUNDED</option>
          </select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="py-4">
          <CardTitle className="text-base flex items-center justify-between">
            <span>Order History ({filtered.length})</span>
            <span className="text-xs font-normal text-muted-foreground">
              Showing {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, filtered.length)} of {filtered.length}
            </span>
          </CardTitle>
          <CardDescription className="text-xs">
            Live database transactions from MariaDB. Server-side calculated and tamper-proof.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-xs">
              No orders found matching the filter.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/40 text-muted-foreground uppercase text-[10px] tracking-wider border-b">
                  <tr>
                    <th className="px-4 py-3">Order ID</th>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Products</th>
                    <th className="px-4 py-3 text-right">Total Amount</th>
                    <th className="px-4 py-3">Payment</th>
                    <th className="px-4 py-3">Order Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {paginatedOrders.map((o) => (
                    <tr key={o.id} className="hover:bg-muted/10 transition-colors">
                      <td className="px-4 py-3 font-mono text-[11px] font-semibold text-foreground">
                        #{o.id.slice(-8)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-foreground">
                          {o.user.profile?.firstName
                            ? `${o.user.profile.firstName} ${o.user.profile.lastName}`
                            : "Customer"}
                        </div>
                        <div className="text-[11px] text-muted-foreground">{o.user.email}</div>
                      </td>
                      <td className="px-4 py-3">
                        {o.items.map((item) => (
                          <div key={item.id} className="text-[11px]">
                            {item.product.name} <span className="text-muted-foreground">× {item.quantity}</span>
                          </div>
                        ))}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-foreground">
                        ₹{Number(o.totalAmount).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={
                            o.payment?.status === "CAPTURED"
                              ? "default"
                              : o.payment?.status === "FAILED"
                              ? "destructive"
                              : "outline"
                          }
                          className="text-[10px]"
                        >
                          {o.payment?.status || "UNPAID"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={
                            o.status === "PAID"
                              ? "default"
                              : o.status === "REFUNDED"
                              ? "destructive"
                              : "outline"
                          }
                          className="text-[10px]"
                        >
                          {o.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setDetailOrder(o)}
                            className="text-[11px] h-7 px-2 text-gas-700 hover:text-gas-800 hover:bg-gas-50"
                          >
                            <Eye className="h-3.5 w-3.5 mr-1" /> View
                          </Button>
                          {o.status === "PAID" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openActionModal(o, "REFUNDED")}
                              className="text-[11px] h-7 px-2 text-rose-700 hover:bg-rose-50 border-rose-200"
                            >
                              <RotateCcw className="h-3 w-3 mr-1" /> Refund
                            </Button>
                          )}
                          {o.status === "PENDING" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openActionModal(o, "CANCELLED")}
                              className="text-[11px] h-7 px-2 text-muted-foreground hover:bg-muted"
                            >
                              Cancel
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

      {/* Order Detail Dossier Modal */}
      {detailOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 space-y-4 relative animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-gas-50 rounded-md border border-gas-200">
                  <ShoppingBag className="h-5 w-5 text-gas-600" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-foreground">Order Dossier #{detailOrder.id.slice(-8)}</h2>
                  <p className="text-[11px] text-muted-foreground">
                    Placed on {new Date(detailOrder.createdAt).toLocaleDateString("en-IN", { dateStyle: "long" })}
                  </p>
                </div>
              </div>
              <button onClick={() => setDetailOrder(null)} className="text-gray-400 hover:text-gray-600 p-1">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Customer info */}
            <div className="p-3 bg-muted/30 rounded-lg text-xs space-y-1">
              <div className="font-semibold text-foreground flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-gas-600" />
                {detailOrder.user.profile?.firstName ? `${detailOrder.user.profile.firstName} ${detailOrder.user.profile.lastName}` : "Customer"}
              </div>
              <div className="text-muted-foreground">{detailOrder.user.email}</div>
              {detailOrder.user.profile?.mobile && (
                <div className="text-muted-foreground">Phone: {detailOrder.user.profile.mobile}</div>
              )}
            </div>

            {/* Line Items */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Package className="h-3.5 w-3.5 text-gas-600" /> Items Breakdown
              </div>
              <div className="divide-y border rounded-lg text-xs">
                {detailOrder.items.map((item) => (
                  <div key={item.id} className="p-2.5 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-foreground">{item.product.name}</div>
                      <div className="text-[11px] text-muted-foreground">{item.product.category} • Qty: {item.quantity}</div>
                    </div>
                    <div className="font-bold text-foreground">
                      ₹{Number(item.price).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment & Commissions Info */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 border rounded-lg space-y-1 bg-muted/10">
                <div className="text-[10px] uppercase text-muted-foreground font-semibold flex items-center gap-1">
                  <CreditCard className="h-3 w-3" /> Payment Status
                </div>
                <div className="font-bold text-foreground">
                  <Badge variant={detailOrder.payment?.status === "CAPTURED" ? "default" : "outline"} className="text-[10px]">
                    {detailOrder.payment?.status || "UNPAID"}
                  </Badge>
                </div>
                {detailOrder.payment?.razorpayOrderId && (
                  <div className="text-[10px] text-muted-foreground font-mono truncate">
                    RPay: {detailOrder.payment.razorpayOrderId}
                  </div>
                )}
              </div>

              <div className="p-3 border rounded-lg space-y-1 bg-muted/10">
                <div className="text-[10px] uppercase text-muted-foreground font-semibold">Attributed Commission</div>
                <div className="font-bold text-foreground">
                  {detailOrder.commissions.length > 0 ? (
                    <span>₹{Number(detailOrder.commissions[0].amount).toFixed(2)} ({detailOrder.commissions[0].status})</span>
                  ) : (
                    <span className="text-muted-foreground font-normal">Direct Order (No Commission)</span>
                  )}
                </div>
                <div className="text-[10px] text-muted-foreground">Order Total: ₹{Number(detailOrder.totalAmount).toLocaleString()}</div>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t">
              <Button size="sm" variant="outline" onClick={() => setDetailOrder(null)} className="text-xs">
                Close Dossier
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Order Status Action Modal (Refund / Cancel) */}
      {actionOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4 relative animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <RotateCcw className="h-5 w-5 text-rose-600" /> Update Order Status
              </h2>
              <button onClick={() => setActionOrder(null)} className="text-gray-400 hover:text-gray-600 p-1">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-3 bg-muted/40 rounded-md text-xs space-y-1">
              <div className="font-semibold text-foreground">Order #{actionOrder.id.slice(-8)}</div>
              <div className="text-muted-foreground">Total: ₹{Number(actionOrder.totalAmount).toLocaleString()} • Customer: {actionOrder.user.email}</div>
              <div className="text-[11px] text-muted-foreground">Current Status: <span className="font-semibold">{actionOrder.status}</span></div>
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

            <form onSubmit={handleStatusSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Target Status</Label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full text-xs rounded-md border border-input bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-gas-500"
                >
                  <option value="REFUNDED">REFUNDED (Revokes commission & records refund)</option>
                  <option value="CANCELLED">CANCELLED (Cancels order & revokes commission)</option>
                  <option value="PAID">PAID (Settled)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Administrative Reason (Mandatory for Audit)</Label>
                <textarea
                  rows={3}
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  required
                  placeholder="Explain why this order status is being changed..."
                  className="w-full text-xs rounded-md border border-input bg-background p-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-gas-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setActionOrder(null)}
                  disabled={isProcessing}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isProcessing}
                  className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold"
                >
                  {isProcessing ? "Updating..." : `Confirm ${newStatus}`}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
