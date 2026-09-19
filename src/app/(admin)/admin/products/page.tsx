"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import {
  Plus,
  Package,
  Edit,
  Archive,
  Loader2,
  Search,
  CheckCircle,
  Upload,
  Eye,
  ChevronLeft,
  ChevronRight,
  X,
  Calendar,
  Percent,
  DollarSign,
  Tag
} from "lucide-react"

interface Product {
  id: string
  name: string
  description: string
  category: string
  price: string
  status: "DRAFT" | "ACTIVE" | "INACTIVE" | "EXPIRED"
  imageUrl?: string | null
  startDate?: string | null
  endDate?: string | null
  createdAt?: string | Date
  commissionRules: Array<{ id: string; type: "PERCENTAGE" | "FIXED"; value: string }>
}

export default function AdminProductsPage() {
  const { toast } = useToast()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [categoryFilter, setCategoryFilter] = useState("ALL")

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 8

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [detailProduct, setDetailProduct] = useState<Product | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)

  // Form State
  const [name, setName] = useState("")
  const [category, setCategory] = useState("Education")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [status, setStatus] = useState<"DRAFT" | "ACTIVE" | "INACTIVE" | "EXPIRED">("ACTIVE")
  const [commissionType, setCommissionType] = useState<"PERCENTAGE" | "FIXED">("PERCENTAGE")
  const [commissionValue, setCommissionValue] = useState("10")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/products?status=ALL&search=${search}`)
      const json = await res.json()
      if (json.data) setProducts(json.data)
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Failed to load products" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])

  const filtered = products.filter((p) => {
    if (statusFilter !== "ALL" && p.status !== statusFilter) return false
    if (categoryFilter !== "ALL" && p.category !== categoryFilter) return false
    return true
  })

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const paginatedProducts = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const categories = Array.from(new Set(products.map((p) => p.category)))

  const openCreateModal = () => {
    setEditingId(null)
    setName("")
    setCategory("Education")
    setDescription("")
    setPrice("")
    setImageUrl("")
    setStatus("ACTIVE")
    setCommissionType("PERCENTAGE")
    setCommissionValue("10")
    setStartDate("")
    setEndDate("")
    setIsModalOpen(true)
  }

  const openEditModal = (p: Product) => {
    setEditingId(p.id)
    setName(p.name)
    setCategory(p.category)
    setDescription(p.description)
    setPrice(p.price)
    setImageUrl(p.imageUrl || "")
    setStatus(p.status)
    const rule = p.commissionRules?.[0]
    setCommissionType(rule ? rule.type : "PERCENTAGE")
    setCommissionValue(rule ? String(rule.value) : "10")
    setStartDate(p.startDate ? p.startDate.split("T")[0] : "")
    setEndDate(p.endDate ? p.endDate.split("T")[0] : "")
    setIsModalOpen(true)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const formData = new FormData()
    formData.append("file", file)

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })
      const data = await res.json()
      if (res.ok && data.data?.url) {
        setImageUrl(data.data.url)
        toast({ variant: "success", title: "Image Uploaded", description: "Product image saved successfully" })
      } else {
        toast({ variant: "destructive", title: "Upload Failed", description: data.error || "Failed to upload image" })
      }
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Upload error" })
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    const payload = {
      name,
      category,
      description,
      price: parseFloat(price),
      imageUrl: imageUrl || undefined,
      status,
      commissionType,
      commissionValue: parseFloat(commissionValue),
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    }

    try {
      const url = editingId ? `/api/products/${editingId}` : "/api/products"
      const method = editingId ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const json = await res.json()
      if (!res.ok) {
        toast({ variant: "destructive", title: "Save Failed", description: json.error || "Failed to save product" })
        return
      }

      toast({
        variant: "success",
        title: editingId ? "Product Updated" : "Product Created",
        description: `${name} has been successfully recorded in the catalog.`,
      })

      setIsModalOpen(false)
      fetchProducts()
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Network error while saving" })
    } finally {
      setSaving(false)
    }
  }

  const handleArchive = async (id: string, currentStatus: string) => {
    const targetStatus = currentStatus === "INACTIVE" ? "ACTIVE" : "INACTIVE"
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: targetStatus }),
      })
      if (res.ok) {
        toast({ variant: "success", title: "Status Updated", description: `Product is now ${targetStatus}` })
        fetchProducts()
      }
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Failed to update status" })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Product & Offer Management</h1>
          <p className="text-sm text-muted-foreground">
            Create, edit, publish/unpublish, and configure affiliate commission structures.
          </p>
        </div>
        <Button onClick={openCreateModal} className="bg-gas-600 hover:bg-gas-700 text-white font-semibold text-xs gap-1.5">
          <Plus className="h-4 w-4" /> Create New Product
        </Button>
      </div>

      {/* Filter & Search Header */}
      <Card>
        <CardContent className="p-4 flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products by title or description..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setCurrentPage(1)
              }}
              className="pl-9 text-xs h-9"
            />
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setCurrentPage(1)
              }}
              className="text-xs rounded-md border border-input bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-gas-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="DRAFT">DRAFT</option>
              <option value="INACTIVE">INACTIVE</option>
              <option value="EXPIRED">EXPIRED</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value)
                setCurrentPage(1)
              }}
              className="text-xs rounded-md border border-input bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-gas-500"
            >
              <option value="ALL">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Product List */}
      <Card className="shadow-sm">
        <CardHeader className="py-4">
          <CardTitle className="text-base flex items-center justify-between">
            <span>Product Catalog ({filtered.length})</span>
            <span className="text-xs font-normal text-muted-foreground">
              Showing {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, filtered.length)} of {filtered.length}
            </span>
          </CardTitle>
          <CardDescription className="text-xs">
            Published and draft offerings with server-calculated prices and commissions.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="text-center py-16 space-y-2">
              <Loader2 className="h-6 w-6 animate-spin text-gas-600 mx-auto" />
              <p className="text-xs text-muted-foreground">Loading products from database...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground text-xs">
              No products found in catalog. Click &apos;Create New Product&apos; to add one.
            </div>
          ) : (
            <div className="divide-y text-xs">
              {paginatedProducts.map((p) => {
                const rule = p.commissionRules?.[0]
                return (
                  <div key={p.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted/10">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-foreground">{p.name}</span>
                        <Badge
                          variant={
                            p.status === "ACTIVE"
                              ? "default"
                              : p.status === "DRAFT"
                              ? "outline"
                              : "destructive"
                          }
                          className="text-[10px]"
                        >
                          {p.status}
                        </Badge>
                        <span className="text-[11px] text-muted-foreground font-mono">({p.category})</span>
                      </div>
                      <p className="text-muted-foreground text-xs line-clamp-1 max-w-xl">{p.description}</p>
                      <div className="flex items-center gap-3 text-[11px] text-muted-foreground pt-1">
                        <span className="font-semibold text-foreground">₹{Number(p.price).toFixed(2)}</span>
                        <span>•</span>
                        <span className="text-gas-700 font-semibold font-mono">
                          Commission: {rule ? (rule.type === "PERCENTAGE" ? `${rule.value}%` : `₹${rule.value} Fixed`) : "None"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDetailProduct(p)}
                        className="text-xs h-8 px-2 text-gas-700 hover:text-gas-800 hover:bg-gas-50"
                      >
                        <Eye className="h-3.5 w-3.5 mr-1" /> Dossier
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => openEditModal(p)} className="text-xs h-8">
                        <Edit className="h-3.5 w-3.5 mr-1 text-gas-600" /> Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleArchive(p.id, p.status)}
                        className={`text-xs h-8 ${p.status === "ACTIVE" ? "text-amber-700 hover:bg-amber-50" : "text-gas-700 hover:bg-gas-50"}`}
                      >
                        <Archive className="h-3.5 w-3.5 mr-1" />
                        {p.status === "ACTIVE" ? "Unpublish" : "Publish"}
                      </Button>
                    </div>
                  </div>
                )
              })}
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

      {/* Product Detail Dossier Modal */}
      {detailProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 space-y-4 relative animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-gas-50 rounded-md border border-gas-200">
                  <Package className="h-5 w-5 text-gas-600" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-foreground">Product Specification</h2>
                  <p className="text-[11px] text-muted-foreground font-mono">ID: {detailProduct.id}</p>
                </div>
              </div>
              <button onClick={() => setDetailProduct(null)} className="text-gray-400 hover:text-gray-600 p-1">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-foreground">{detailProduct.name}</h3>
                  <p className="text-[11px] text-muted-foreground font-mono">Category: {detailProduct.category}</p>
                </div>
                <div className="text-right">
                  <div className="text-base font-extrabold text-gas-900">₹{Number(detailProduct.price).toFixed(2)}</div>
                  <Badge className="text-[10px] mt-0.5">{detailProduct.status}</Badge>
                </div>
              </div>

              <div className="p-3 bg-muted/20 border rounded-md">
                <div className="text-[10px] uppercase text-muted-foreground font-semibold">Description</div>
                <p className="text-xs text-foreground mt-1 whitespace-pre-wrap">{detailProduct.description}</p>
              </div>

              {/* Commission Details */}
              <div className="p-3 bg-gas-50/50 border border-gas-200 rounded-md space-y-1.5">
                <div className="text-[10px] uppercase text-gas-800 font-bold flex items-center gap-1.5">
                  <Percent className="h-3.5 w-3.5 text-gas-700" /> Affiliate Commission Configuration
                </div>
                {detailProduct.commissionRules && detailProduct.commissionRules.length > 0 ? (
                  <div className="space-y-1">
                    {detailProduct.commissionRules.map((r) => (
                      <div key={r.id} className="flex items-center justify-between text-xs">
                        <span className="font-medium text-gas-900">Type: {r.type}</span>
                        <span className="font-bold text-gas-800">
                          {r.type === "PERCENTAGE" ? `${r.value}% of Sale` : `₹${r.value} Fixed`}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">Standard default commission rates apply.</p>
                )}
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3 text-[11px] text-muted-foreground">
                <div className="p-2 border rounded bg-muted/10">
                  <span className="font-semibold text-foreground">Start Date:</span>{" "}
                  {detailProduct.startDate ? new Date(detailProduct.startDate).toLocaleDateString("en-IN") : "Immediate"}
                </div>
                <div className="p-2 border rounded bg-muted/10">
                  <span className="font-semibold text-foreground">End Date:</span>{" "}
                  {detailProduct.endDate ? new Date(detailProduct.endDate).toLocaleDateString("en-IN") : "Permanent"}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t">
              <Button size="sm" variant="outline" onClick={() => setDetailProduct(null)} className="text-xs">
                Close Dossier
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal / Form Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto">
          <Card className="w-full max-w-xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="border-b">
              <CardTitle className="text-lg">
                {editingId ? "Edit Product" : "Create New Product"}
              </CardTitle>
              <CardDescription className="text-xs">
                Configure offering, price, dates, and evolutionary affiliate commission rates.
              </CardDescription>
            </CardHeader>

            <form onSubmit={handleSave}>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-1">
                  <Label htmlFor="prodName" className="text-xs">Product Name</Label>
                  <Input
                    id="prodName"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. GAS Master Accelerator Package"
                    required
                    className="text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="category" className="text-xs">Category</Label>
                    <Input
                      id="category"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      placeholder="e.g. Education, Software"
                      required
                      className="text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="price" className="text-xs">Price (INR)</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="2499.00"
                      required
                      className="text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="desc" className="text-xs">Description</Label>
                  <textarea
                    id="desc"
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide full description of this offer..."
                    required
                    className="w-full p-2.5 rounded-md border text-xs bg-background focus:ring-1 focus:ring-gas-500"
                  />
                </div>

                {/* Image Upload */}
                <div className="space-y-2 border p-3 rounded-md bg-muted/20">
                  <Label className="text-xs font-semibold">Product Image</Label>
                  <div className="flex items-center gap-3">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      disabled={uploading}
                      className="text-xs file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-gas-100 file:text-gas-700"
                    />
                    {uploading && <Loader2 className="h-4 w-4 animate-spin text-gas-600" />}
                  </div>
                  {imageUrl && (
                    <div className="text-[11px] text-gas-700 truncate font-mono">
                      Image URL: {imageUrl}
                    </div>
                  )}
                </div>

                {/* Commission Structure */}
                <div className="p-4 border rounded-md bg-gas-50/50 space-y-3">
                  <div className="font-semibold text-xs text-gas-900">
                    Affiliate Commission Configuration (Configurable, Not Hardcoded)
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="text-xs">Commission Type</Label>
                      <select
                        value={commissionType}
                        onChange={(e) => setCommissionType(e.target.value as "PERCENTAGE" | "FIXED")}
                        className="w-full h-9 p-2 rounded-md border text-xs bg-background"
                      >
                        <option value="PERCENTAGE">PERCENTAGE (%)</option>
                        <option value="FIXED">FIXED_AMOUNT (₹)</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">
                        {commissionType === "PERCENTAGE" ? "Percentage Value (%)" : "Fixed Amount (₹)"}
                      </Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={commissionValue}
                        onChange={(e) => setCommissionValue(e.target.value)}
                        required
                        className="text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Lifecycle & Dates */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Status</Label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as "DRAFT" | "ACTIVE" | "INACTIVE" | "EXPIRED")}
                      className="w-full h-9 p-2 rounded-md border text-xs bg-background"
                    >
                      <option value="ACTIVE">ACTIVE (Published)</option>
                      <option value="DRAFT">DRAFT (Hidden)</option>
                      <option value="INACTIVE">INACTIVE (Archived)</option>
                      <option value="EXPIRED">EXPIRED</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Start Date</Label>
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">End Date</Label>
                    <Input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="text-xs"
                    />
                  </div>
                </div>
              </CardContent>

              <div className="p-4 border-t flex justify-end gap-2 bg-muted/10">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={saving} className="bg-gas-600 hover:bg-gas-700 text-white font-semibold">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                  {editingId ? "Save Changes" : "Create Product"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  )
}