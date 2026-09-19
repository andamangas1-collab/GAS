"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ShoppingBag, ArrowRight, Sparkles, Tag, ShieldCheck, Percent, Layers, Loader2 } from "lucide-react"

interface ProductItem {
  id: string
  name: string
  description: string
  category: string
  price: string
  imageUrl?: string | null
  commissionRules: Array<{ type: string; value: string }>
}

export function LiveOffersPreview() {
  const [products, setProducts] = useState<ProductItem[]>([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState("ALL")

  useEffect(() => {
    const fetchFeaturedOffers = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/products?limit=50`)
        const json = await res.json()
        if (json.data && Array.isArray(json.data)) {
          setProducts(json.data)
        }
      } catch (err) {
        console.error("Failed to fetch featured offers:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchFeaturedOffers()
  }, [])

  // Dynamic categories from actual database products
  const availableCategories = Array.from(
    new Set(["ALL", ...products.map((p) => p.category).filter(Boolean)])
  )

  const displayedProducts = (category === "ALL" 
    ? products 
    : products.filter((p) => p.category === category)
  ).slice(0, 6)


  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider mb-3">
              <ShoppingBag className="h-3.5 w-3.5" />
              Verified Marketplace Catalog
            </div>
            <h2 className="text-3xl font-black tracking-tight text-foreground">
              Featured Active Offers
            </h2>
            <p className="mt-2 text-sm sm:text-base text-muted-foreground max-w-xl">
              Real high-converting products with transparent direct commission attribution. Zero inventory requirements or recruitment quotas.
            </p>
          </div>

          <Link
            href="/offers"
            className="inline-flex items-center gap-2 text-sm font-bold text-gas-600 dark:text-gas-400 hover:underline group self-start md:self-auto"
          >
            Explore Full Catalog ({products.length > 0 ? "Live" : "Browse"})
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
          {availableCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 ${
                category === cat
                  ? "bg-gas-600 text-white shadow-sm shadow-gas-600/20"
                  : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-gas-600" />
            <span className="text-xs font-medium text-muted-foreground font-mono">Loading verified offers...</span>
          </div>
        ) : displayedProducts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center">
            <ShoppingBag className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-40" />
            <h3 className="text-base font-semibold text-foreground">No active offers found in this category</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              Check back shortly or view the full catalog across all categories.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedProducts.map((product) => {
              const mainRule = product.commissionRules?.[0]
              const ruleDisplay = mainRule
                ? mainRule.type === "PERCENTAGE"
                  ? `${mainRule.value}% Commission`
                  : `₹${mainRule.value} Fixed Commission`
                : "Eligible Commission"

              return (
                <div
                  key={product.id}
                  className="rounded-2xl border border-border bg-card shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden group hover:-translate-y-1"
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-muted text-[11px] font-bold text-muted-foreground uppercase tracking-wide">
                        <Tag className="h-3 w-3" />
                        {product.category}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
                        <Percent className="h-3 w-3" />
                        {ruleDisplay}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-foreground group-hover:text-gas-600 transition-colors line-clamp-1">
                      {product.name}
                    </h3>

                    <p className="text-xs text-muted-foreground mt-2 line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>

                    <div className="mt-6 pt-4 border-t border-border flex items-baseline justify-between">
                      <span className="text-xs text-muted-foreground font-medium">Verified Price</span>
                      <span className="text-xl font-black text-foreground">
                        ₹{Number(product.price).toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 bg-muted/40 border-t border-border flex items-center gap-2">
                    <Link
                      href={`/offers/${product.id}`}
                      className="py-2 px-3 rounded-lg border border-border hover:bg-card text-foreground text-xs font-semibold transition-colors text-center"
                    >
                      Details
                    </Link>
                    <Link
                      href={`/checkout?productId=${product.id}`}
                      className="flex-1 text-center py-2 px-3 rounded-lg bg-gas-600 hover:bg-gas-700 text-white text-xs font-bold transition-colors shadow-sm flex items-center justify-center gap-1"
                    >
                      Buy Now <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}

      </div>
    </section>
  )
}
