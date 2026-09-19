"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Users,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Ban,
  CheckCircle2,
  AlertCircle,
  X,
  Phone,
  Mail,
  Share2,
  Eye,
  Calendar,
  ShoppingCart,
  DollarSign,
  Sparkles,
  ChevronLeft,
  ChevronRight
} from "lucide-react"

interface UserRecord {
  id: string
  email: string
  role: string
  status: string
  referralCode: string
  referredBy: string | null
  createdAt: string | Date
  profile: {
    firstName: string
    lastName: string
    mobile: string | null
    city?: string | null
    state?: string | null
  } | null
  _count: {
    referralsMade: number
    ordersPlaced: number
    commissions: number
    contributions: number
  }
}

export default function AdminUsersClient({ initialUsers }: { initialUsers: UserRecord[] }) {
  const router = useRouter()
  const [users, setUsers] = useState<UserRecord[]>(initialUsers)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [roleFilter, setRoleFilter] = useState("ALL")

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 8

  // Modal States
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null)
  const [detailUser, setDetailUser] = useState<UserRecord | null>(null)
  const [newStatus, setNewStatus] = useState<string>("ACTIVE")
  const [adminNote, setAdminNote] = useState<string>("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const filtered = users.filter((u) => {
    if (statusFilter !== "ALL" && u.status !== statusFilter) return false
    if (roleFilter !== "ALL" && u.role !== roleFilter) return false
    if (search.trim()) {
      const q = search.toLowerCase()
      const fullName = `${u.profile?.firstName || ""} ${u.profile?.lastName || ""}`.toLowerCase()
      return (
        u.email.toLowerCase().includes(q) ||
        u.referralCode.toLowerCase().includes(q) ||
        fullName.includes(q) ||
        (u.profile?.mobile && u.profile.mobile.includes(q))
      )
    }
    return true
  })

  // Paginated slice
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const paginatedUsers = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const handleSearchChange = (val: string) => {
    setSearch(val)
    setCurrentPage(1)
  }

  const handleStatusFilterChange = (val: string) => {
    setStatusFilter(val)
    setCurrentPage(1)
  }

  const handleRoleFilterChange = (val: string) => {
    setRoleFilter(val)
    setCurrentPage(1)
  }

  const openStatusModal = (user: UserRecord) => {
    setSelectedUser(user)
    setNewStatus(user.status)
    setAdminNote("")
    setFeedback(null)
    setIsModalOpen(true)
  }

  const handleStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUser) return

    setIsProcessing(true)
    setFeedback(null)

    try {
      const res = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          adminNote,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Failed to update user status")
      }

      setUsers((prev) =>
        prev.map((u) => (u.id === selectedUser.id ? { ...u, status: newStatus } : u))
      )

      setFeedback({
        type: "success",
        text: `Account status updated to ${newStatus}. Audit log entry created.`,
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
          <h1 className="text-2xl font-bold tracking-tight">Affiliate User Management</h1>
          <p className="text-sm text-muted-foreground">
            Monitor registered members, review attributed referral counts, and enforce account security statuses.
          </p>
        </div>
        <Badge variant="outline" className="text-xs bg-gas-50 text-gas-800 border-gas-200">
          {users.length} Total Registered Users
        </Badge>
      </div>

      {/* Filter & Search Bar */}
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-col md:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, mobile, or referral code..."
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-9 text-xs"
              />
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => handleStatusFilterChange(e.target.value)}
                className="text-xs rounded-md border border-input bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-gas-500"
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">ACTIVE</option>
                <option value="SUSPENDED">SUSPENDED</option>
                <option value="BLOCKED">BLOCKED</option>
                <option value="PENDING">PENDING</option>
              </select>

              <select
                value={roleFilter}
                onChange={(e) => handleRoleFilterChange(e.target.value)}
                className="text-xs rounded-md border border-input bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-gas-500"
              >
                <option value="ALL">All Roles</option>
                <option value="USER">USER</option>
                <option value="ADMIN">ADMIN</option>
                <option value="SUPER_ADMIN">SUPER_ADMIN</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader className="py-4">
          <CardTitle className="text-base flex items-center justify-between">
            <span>Members List ({filtered.length})</span>
            <span className="text-xs font-normal text-muted-foreground">
              Showing {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, filtered.length)} of {filtered.length}
            </span>
          </CardTitle>
          <CardDescription className="text-xs">
            Live accounts from MariaDB &apos;gas_mvp&apos; database. Status changes immediately restrict or restore login access.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-xs">
              No users found matching your search and filter criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/40 text-muted-foreground uppercase text-[10px] tracking-wider border-b">
                  <tr>
                    <th className="px-4 py-3">Member</th>
                    <th className="px-4 py-3">Contact</th>
                    <th className="px-4 py-3">Referral Code</th>
                    <th className="px-4 py-3 text-center">Referrals</th>
                    <th className="px-4 py-3 text-center">Orders</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {paginatedUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-muted/10 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-foreground">
                          {u.profile?.firstName ? `${u.profile.firstName} ${u.profile.lastName}` : "Unnamed"}
                        </div>
                        <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                          <Mail className="h-3 w-3" /> {u.email}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-muted-foreground flex items-center gap-1">
                          <Phone className="h-3 w-3" /> {u.profile?.mobile || "Not set"}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono bg-muted/60 px-2 py-0.5 rounded text-[11px] font-medium">
                          {u.referralCode}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="font-semibold text-gas-700 bg-gas-50 px-2 py-0.5 rounded border border-gas-200">
                          {u._count.referralsMade}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="font-semibold text-foreground">
                          {u._count.ordersPlaced}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={
                            u.role === "SUPER_ADMIN"
                              ? "destructive"
                              : u.role === "ADMIN"
                              ? "default"
                              : "outline"
                          }
                          className="text-[10px]"
                        >
                          {u.role}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={
                            u.status === "ACTIVE"
                              ? "default"
                              : u.status === "BLOCKED"
                              ? "destructive"
                              : "secondary"
                          }
                          className="text-[10px]"
                        >
                          {u.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setDetailUser(u)}
                            className="text-[11px] h-7 px-2 text-gas-700 hover:text-gas-800 hover:bg-gas-50"
                          >
                            <Eye className="h-3.5 w-3.5 mr-1" /> Dossier
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openStatusModal(u)}
                            className="text-[11px] h-7 px-2.5"
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

      {/* User Detail Dossier Modal */}
      {detailUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 space-y-4 relative animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-gas-50 rounded-md border border-gas-200">
                  <Users className="h-5 w-5 text-gas-600" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-foreground">Member Dossier</h2>
                  <p className="text-[11px] text-muted-foreground font-mono">User ID: {detailUser.id}</p>
                </div>
              </div>
              <button onClick={() => setDetailUser(null)} className="text-gray-400 hover:text-gray-600 p-1">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-muted/30 rounded-lg space-y-1">
                <div className="text-[10px] uppercase text-muted-foreground font-semibold">Full Name</div>
                <div className="font-bold text-foreground">
                  {detailUser.profile?.firstName ? `${detailUser.profile.firstName} ${detailUser.profile.lastName}` : "Unnamed"}
                </div>
              </div>
              <div className="p-3 bg-muted/30 rounded-lg space-y-1">
                <div className="text-[10px] uppercase text-muted-foreground font-semibold">Email Address</div>
                <div className="font-semibold text-foreground truncate">{detailUser.email}</div>
              </div>
              <div className="p-3 bg-muted/30 rounded-lg space-y-1">
                <div className="text-[10px] uppercase text-muted-foreground font-semibold">Referral Code</div>
                <div className="font-mono font-bold text-gas-800">{detailUser.referralCode}</div>
              </div>
              <div className="p-3 bg-muted/30 rounded-lg space-y-1">
                <div className="text-[10px] uppercase text-muted-foreground font-semibold">Contact Mobile</div>
                <div className="font-medium text-foreground">{detailUser.profile?.mobile || "Not specified"}</div>
              </div>
            </div>

            {/* Performance Stats */}
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="p-2 border rounded-lg bg-blue-50/50">
                <div className="text-base font-bold text-blue-900">{detailUser._count.referralsMade}</div>
                <div className="text-[9px] uppercase text-blue-700 font-semibold">Referrals</div>
              </div>
              <div className="p-2 border rounded-lg bg-indigo-50/50">
                <div className="text-base font-bold text-indigo-900">{detailUser._count.ordersPlaced}</div>
                <div className="text-[9px] uppercase text-indigo-700 font-semibold">Orders</div>
              </div>
              <div className="p-2 border rounded-lg bg-emerald-50/50">
                <div className="text-base font-bold text-emerald-900">{detailUser._count.commissions}</div>
                <div className="text-[9px] uppercase text-emerald-700 font-semibold">Commissions</div>
              </div>
              <div className="p-2 border rounded-lg bg-rose-50/50">
                <div className="text-base font-bold text-rose-900">{detailUser._count.contributions}</div>
                <div className="text-[9px] uppercase text-rose-700 font-semibold">V2V Ideas</div>
              </div>
            </div>

            <div className="p-3 border rounded-lg text-xs space-y-2 bg-gas-50/30">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Account Role:</span>
                <Badge variant={detailUser.role === "SUPER_ADMIN" ? "destructive" : "outline"} className="text-[10px]">
                  {detailUser.role}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Operational Status:</span>
                <Badge variant={detailUser.status === "ACTIVE" ? "default" : "secondary"} className="text-[10px]">
                  {detailUser.status}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Registered Date:</span>
                <span className="font-medium text-foreground">
                  {new Date(detailUser.createdAt).toLocaleDateString("en-IN", { dateStyle: "long" })}
                </span>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t">
              <Button size="sm" variant="outline" onClick={() => setDetailUser(null)} className="text-xs">
                Close Dossier
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Status Management Modal */}
      {isModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4 relative animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Shield className="h-5 w-5 text-gas-600" /> Manage User Status
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-3 bg-muted/40 rounded-md text-xs space-y-1">
              <div className="font-semibold text-foreground">
                {selectedUser.profile?.firstName
                  ? `${selectedUser.profile.firstName} ${selectedUser.profile.lastName}`
                  : selectedUser.email}
              </div>
              <div className="text-muted-foreground">{selectedUser.email}</div>
              <div className="text-[11px] text-muted-foreground">
                Current Status: <span className="font-semibold">{selectedUser.status}</span>
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
                {feedback.type === "success" ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                ) : (
                  <AlertCircle className="h-4 w-4 shrink-0" />
                )}
                <span>{feedback.text}</span>
              </div>
            )}

            <form onSubmit={handleStatusUpdate} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="statusSelect" className="text-xs font-semibold">
                  Account Status
                </Label>
                <select
                  id="statusSelect"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full text-xs rounded-md border border-input bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-gas-500"
                >
                  <option value="ACTIVE">ACTIVE (Normal operational access)</option>
                  <option value="SUSPENDED">SUSPENDED (Temporarily restricted from login)</option>
                  <option value="BLOCKED">BLOCKED (Permanently prohibited from login)</option>
                  <option value="PENDING">PENDING (Awaiting verification)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="note" className="text-xs font-semibold">
                  Administrative Reason / Note
                </Label>
                <textarea
                  id="note"
                  rows={3}
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="Provide context for audit records..."
                  className="w-full text-xs rounded-md border border-input bg-background p-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-gas-500"
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
                  className="bg-gas-600 hover:bg-gas-700 text-white text-xs font-semibold"
                >
                  {isProcessing ? "Updating..." : "Save Status"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
