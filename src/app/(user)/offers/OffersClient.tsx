"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ShoppingBag, ArrowRight, Search, ShieldCheck, Tag, Percent } from "lucide-react"

export interface ProductItem {
  id: string
  name: string
  description: string
  category: string
  price: string
  imageUrl?: string | null
  commissionRules: Array<{ type: string; value: string }>
}

export function OffersClient({ initialProducts }: { initialProducts: ProductItem[] }) {
  const [products] = useState<ProductItem[]>(initialProducts)
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("ALL")

  // Dynamically extract distinct categories from database products
  const availableCategories = Array.from(
    new Set(["ALL", ...products.map((p) => p.category).filter(Boolean)])
  )

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      search.trim() === "" ||
      product.name.toLowerCase().includes(search.toLowerCase()) ||
      product.description.toLowerCase().includes(search.toLowerCase())

    const matchesCategory = category === "ALL" || product.category === category

    return matchesSearch && matchesCategory
  })

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Active Offers &amp; Catalog</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Verified packages eligible for purchase, referral sharing, and commission earnings.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs bg-gas-50 text-gas-800 border-gas-200">
            {filteredProducts.length} {filteredProducts.length === 1 ? "Offer" : "Offers"} Available
          </Badge>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search offers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 text-xs h-9"
          />
        </div>

        {/* Dynamic Category Pills */}
        <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
          {availableCategories.map((cat) => {
            const isSelected = category === cat
            return (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                  isSelected
                    ? "bg-gas-600 text-white shadow-sm"
                    : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            )
          })}
        </div>
      </div>

      {/* Product List */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-16 border rounded-xl bg-muted/20 space-y-3">
          <ShoppingBag className="h-10 w-10 text-muted-foreground mx-auto" />
          <h3 className="font-semibold text-base">No offers matching your search</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Try adjusting your search criteria or selecting a different category.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => {
            const rule = product.commissionRules?.[0]
            return (
              <Card key={product.id} className="flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <Badge variant="secondary" className="text-[10px] uppercase font-semibold">
                      {product.category}
                    </Badge>
                    {rule && (
                      <span className="text-[10px] font-bold text-gas-700 bg-gas-50 border border-gas-200 px-2 py-0.5 rounded">
                        {rule.type === "PERCENTAGE" ? `${rule.value}% Comm.` : `₹${rule.value} Comm.`}
                      </span>
                    )}
                  </div>
                  <CardTitle className="text-lg leading-snug">{product.name}</CardTitle>
                  <CardDescription className="text-xs line-clamp-2">
                    {product.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    ₹{Number(product.price).toFixed(2)}
                  </div>
                </CardContent>
                <CardFooter className="flex items-center gap-2 pt-2 border-t">
                  <Button size="sm" variant="outline" asChild className="flex-1 font-semibold text-xs">
                    <Link href={`/offers/${product.id}`}>
                      Details
                    </Link>
                  </Button>
                  <Button size="sm" asChild className="flex-1 bg-gas-600 hover:bg-gas-700 text-white font-semibold text-xs shadow-sm">
                    <Link href={`/checkout?productId=${product.id}`}>
                      Buy Now <ArrowRight className="ml-1 h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
