"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Megaphone,
  Plus,
  Search,
  Calendar,
  Package,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  Eye,
  ChevronLeft,
  ChevronRight,
  X,
  AlertCircle,
  Loader2
} from "lucide-react"

interface CampaignRecord {
  id: string
  name: string
  description: string | null
  startDate: string | Date
  endDate: string | Date
  isActive: boolean
  createdAt: string | Date
  products: Array<{
    productId: string
    product: {
      id: string
      name: string
      price: string | number
      category: string
    }
  }>
}

interface ProductOption {
  id: string
  name: string
  price: string | number
  category: string
}

export default function AdminCampaignsClient({
  initialCampaigns,
  availableProducts,
}: {
  initialCampaigns: CampaignRecord[]
  availableProducts: ProductOption[]
}) {
  const router = useRouter()
  const [campaigns, setCampaigns] = useState<CampaignRecord[]>(initialCampaigns)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 6

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [detailCampaign, setDetailCampaign] = useState<CampaignRecord | null>(null)

  // Form State
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [isActive, setIsActive] = useState(true)
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const filtered = campaigns.filter((c) => {
    if (statusFilter === "ACTIVE" && !c.isActive) return false
    if (statusFilter === "INACTIVE" && c.isActive) return false
    if (search.trim()) {
      const q = search.toLowerCase()
      return c.name.toLowerCase().includes(q) || (c.description && c.description.toLowerCase().includes(q))
    }
    return true
  })

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const paginatedCampaigns = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const openCreateModal = () => {
    setEditingId(null)
    setName("")
    setDescription("")
    const today = new Date().toISOString().split("T")[0]
    const nextMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
    setStartDate(today)
    setEndDate(nextMonth)
    setIsActive(true)
    setSelectedProductIds([])
    setFeedback(null)
    setIsModalOpen(true)
  }

  const openEditModal = (c: CampaignRecord) => {
    setEditingId(c.id)
    setName(c.name)
    setDescription(c.description || "")
    setStartDate(new Date(c.startDate).toISOString().split("T")[0])
    setEndDate(new Date(c.endDate).toISOString().split("T")[0])
    setIsActive(c.isActive)
    setSelectedProductIds(c.products.map((p) => p.productId))
    setFeedback(null)
    setIsModalOpen(true)
  }

  const handleProductToggle = (productId: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    )
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)
    setFeedback(null)

    const payload = {
      name,
      description,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      isActive,
      productIds: selectedProductIds,
    }

    try {
      const url = editingId ? `/api/admin/campaigns/${editingId}` : "/api/admin/campaigns"
      const method = editingId ? "PATCH" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const json = await res.json()
      if (!res.ok) {
        throw new Error(json.error || "Failed to save campaign")
      }

      setFeedback({
        type: "success",
        text: editingId ? "Campaign successfully updated." : "New campaign published.",
      })

      setTimeout(() => {
        setIsModalOpen(false)
        router.refresh()
      }, 1000)
    } catch (err: any) {
      setFeedback({ type: "error", text: err.message })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleToggleStatus = async (c: CampaignRecord) => {
    try {
      const res = await fetch(`/api/admin/campaigns/${c.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !c.isActive }),
      })
      if (res.ok) {
        setCampaigns((prev) =>
          prev.map((item) => (item.id === c.id ? { ...item, isActive: !c.isActive } : item))
        )
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this promotional campaign?")) return
    try {
      const res = await fetch(`/api/admin/campaigns/${id}`, { method: "DELETE" })
      if (res.ok) {
        setCampaigns((prev) => prev.filter((c) => c.id !== id))
      }
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Promotional Campaigns</h1>
          <p className="text-sm text-muted-foreground">
            Create time-limited affiliate incentives, seasonal promotions, and bonus offerings.
          </p>
        </div>
        <Button onClick={openCreateModal} className="bg-gas-600 hover:bg-gas-700 text-white font-semibold text-xs gap-1.5">
          <Plus className="h-4 w-4" /> Create Campaign
        </Button>
      </div>

      {/* Filter & Search Header */}
      <Card>
        <CardContent className="p-4 flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search campaigns by title or description..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setCurrentPage(1)
              }}
              className="pl-9 text-xs h-9"
            />
          </div>
          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setCurrentPage(1)
              }}
              className="text-xs rounded-md border border-input bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-gas-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">ACTIVE Only</option>
              <option value="INACTIVE">INACTIVE Only</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Campaigns Grid */}
      <Card>
        <CardHeader className="py-4">
          <CardTitle className="text-base flex items-center justify-between">
            <span>Campaigns ({filtered.length})</span>
            <span className="text-xs font-normal text-muted-foreground">
              Showing {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, filtered.length)} of {filtered.length}
            </span>
          </CardTitle>
          <CardDescription className="text-xs">
            Live database records from MariaDB &apos;campaigns&apos; table.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground text-xs">
              No promotional campaigns found. Click &apos;Create Campaign&apos; to schedule an affiliate promotion.
            </div>
          ) : (
            <div className="divide-y text-xs">
              {paginatedCampaigns.map((c) => (
                <div key={c.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-muted/10 transition-colors">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-foreground">{c.name}</span>
                      <Badge variant={c.isActive ? "default" : "outline"} className="text-[10px]">
                        {c.isActive ? "Active" : "Inactive"}
                      </Badge>
                      <span className="text-[11px] text-muted-foreground font-mono">
                        ({c.products.length} Products Linked)
                      </span>
                    </div>

                    {c.description && (
                      <p className="text-xs text-muted-foreground line-clamp-1 max-w-xl">{c.description}</p>
                    )}

                    <div className="flex items-center gap-4 text-[11px] text-muted-foreground pt-0.5">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-gas-600" />
                        {new Date(c.startDate).toLocaleDateString("en-IN")} — {new Date(c.endDate).toLocaleDateString("en-IN")}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setDetailCampaign(c)}
                      className="text-xs h-8 px-2 text-gas-700 hover:text-gas-800 hover:bg-gas-50"
                    >
                      <Eye className="h-3.5 w-3.5 mr-1" /> Dossier
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditModal(c)}
                      className="text-xs h-8"
                    >
                      <Edit className="h-3.5 w-3.5 mr-1" /> Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleToggleStatus(c)}
                      className={`text-xs h-8 ${c.isActive ? "text-amber-700 hover:bg-amber-50" : "text-emerald-700 hover:bg-emerald-50"}`}
                    >
                      {c.isActive ? "Deactivate" : "Activate"}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(c.id)}
                      className="text-xs h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
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
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  className="h-7 px-2.5 text-xs gap-1"
                >
                  <ChevronLeft className="h-3 w-3" /> Prev
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  className="h-7 px-2.5 text-xs gap-1"
                >
                  Next <ChevronRight className="h-3 w-3" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Campaign Detail Dossier Modal */}
      {detailCampaign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 space-y-4 relative animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-gas-50 rounded-md border border-gas-200">
                  <Megaphone className="h-5 w-5 text-gas-600" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-foreground">Campaign Dossier</h2>
                  <p className="text-[11px] text-muted-foreground font-mono">ID: {detailCampaign.id}</p>
                </div>
              </div>
              <button onClick={() => setDetailCampaign(null)} className="text-gray-400 hover:text-gray-600 p-1">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <div className="text-[10px] uppercase text-muted-foreground font-semibold">Campaign Name</div>
                <div className="text-sm font-bold text-foreground mt-0.5">{detailCampaign.name}</div>
              </div>

              {detailCampaign.description && (
                <div className="p-3 bg-muted/20 border rounded-md">
                  <div className="text-[10px] uppercase text-muted-foreground font-semibold">Description</div>
                  <p className="text-xs text-foreground mt-1 whitespace-pre-wrap">{detailCampaign.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="p-2.5 border rounded-md bg-muted/10">
                  <div className="text-[10px] uppercase text-muted-foreground font-semibold">Start Date</div>
                  <div className="font-semibold text-foreground mt-0.5">
                    {new Date(detailCampaign.startDate).toLocaleDateString("en-IN", { dateStyle: "long" })}
                  </div>
                </div>
                <div className="p-2.5 border rounded-md bg-muted/10">
                  <div className="text-[10px] uppercase text-muted-foreground font-semibold">End Date</div>
                  <div className="font-semibold text-foreground mt-0.5">
                    {new Date(detailCampaign.endDate).toLocaleDateString("en-IN", { dateStyle: "long" })}
                  </div>
                </div>
              </div>

              {/* Linked Products */}
              <div className="space-y-1.5">
                <div className="text-[10px] uppercase text-muted-foreground font-semibold">Linked Catalog Products</div>
                {detailCampaign.products.length === 0 ? (
                  <div className="text-xs text-muted-foreground p-3 border rounded-md">
                    No individual products mapped. Campaign applies globally.
                  </div>
                ) : (
                  <div className="divide-y border rounded-md text-xs">
                    {detailCampaign.products.map((p) => (
                      <div key={p.productId} className="p-2.5 flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-foreground">{p.product.name}</div>
                          <div className="text-[10px] text-muted-foreground">{p.product.category}</div>
                        </div>
                        <div className="font-bold text-foreground">₹{Number(p.product.price).toLocaleString()}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t">
              <Button size="sm" variant="outline" onClick={() => setDetailCampaign(null)} className="text-xs">
                Close Dossier
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Campaign Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 space-y-4 relative animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Megaphone className="h-5 w-5 text-gas-600" />
                {editingId ? "Edit Promotional Campaign" : "Create New Campaign"}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1">
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

            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="campName" className="text-xs font-semibold">
                  Campaign Title
                </Label>
                <Input
                  id="campName"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Q4 Accelerator Blitz"
                  className="text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="campDesc" className="text-xs font-semibold">
                  Description
                </Label>
                <textarea
                  id="campDesc"
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide promotion details and affiliate bonus conditions..."
                  className="w-full text-xs rounded-md border border-input bg-background p-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-gas-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="startDate" className="text-xs font-semibold">
                    Start Date
                  </Label>
                  <Input
                    id="startDate"
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="endDate" className="text-xs font-semibold">
                    End Date
                  </Label>
                  <Input
                    id="endDate"
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="text-xs"
                  />
                </div>
              </div>

              {/* Product Selection */}
              <div className="space-y-1.5 border p-3 rounded-lg bg-muted/20">
                <Label className="text-xs font-semibold">Attach Eligible Catalog Products</Label>
                <div className="max-h-36 overflow-y-auto space-y-1.5 divide-y pr-1">
                  {availableProducts.map((p) => {
                    const checked = selectedProductIds.includes(p.id)
                    return (
                      <div key={p.id} className="pt-1.5 flex items-center justify-between text-xs">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => handleProductToggle(p.id)}
                            className="rounded border-gray-300 text-gas-600 focus:ring-gas-500 h-3.5 w-3.5"
                          />
                          <span className="font-medium text-foreground">{p.name}</span>
                        </label>
                        <span className="text-[11px] text-muted-foreground">₹{Number(p.price).toLocaleString()}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-muted/10 border rounded-lg text-xs">
                <span className="font-semibold text-foreground">Campaign Operational Status</span>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setIsActive(!isActive)}
                  className={`text-xs h-7 ${isActive ? "text-emerald-700 border-emerald-300 bg-emerald-50" : "text-muted-foreground"}`}
                >
                  {isActive ? "Active (Live)" : "Inactive (Paused)"}
                </Button>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
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
                  {isProcessing ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                  {editingId ? "Save Changes" : "Publish Campaign"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
