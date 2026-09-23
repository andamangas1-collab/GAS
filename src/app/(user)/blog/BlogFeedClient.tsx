"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Search,
  BookOpen,
  Clock,
  Eye,
  Share2,
  Tag,
  ArrowRight,
  TrendingUp,
  Sparkles,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface BlogPostSummary {
  id: string
  title: string
  slug: string
  excerpt: string
  coverImage?: string | null
  images?: string[]
  category: string
  tags: string[]
  readTimeMinutes: number
  viewCount: number
  shareCount: number
  clapCount?: number
  publishedAt: string | Date
  author: {
    email: string
    profile?: {
      firstName: string | null
      lastName: string | null
    } | null
  }
}

interface BlogFeedClientProps {
  initialPosts: BlogPostSummary[]
  categories: string[]
}

export function BlogFeedClient({ initialPosts, categories }: BlogFeedClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All")
  const [searchQuery, setSearchQuery] = useState<string>("")

  const filteredPosts = initialPosts.filter((post) => {
    const matchesCategory =
      selectedCategory === "All" || post.category === selectedCategory
    const matchesSearch =
      searchQuery.trim() === "" ||
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))

    return matchesCategory && matchesSearch
  })

  const featuredPost = filteredPosts[0] || null
  const regularPosts = filteredPosts.slice(1)

  return (
    <div className="space-y-12">
      {/* Search & Category Filter Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-muted/30 border border-border/60">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search strategies, case studies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10 bg-background/80 border-border/80 text-sm"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? "bg-gas-600 text-white shadow-md shadow-gas-600/20"
                  : "bg-background/80 text-muted-foreground hover:text-foreground hover:bg-background border border-border/60"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Featured Hero Article (if available) */}
      {featuredPost && (
        <div className="relative group">
          <Link href={`/blog/${featuredPost.slug}`}>
            <Card className="overflow-hidden border-gas-500/20 bg-gradient-to-br from-card via-card to-gas-950/20 hover:border-gas-500/50 transition-all duration-300 shadow-xl group-hover:shadow-gas-500/5">
              <div className="grid md:grid-cols-12 gap-6 p-6 sm:p-8">
                <div className="md:col-span-8 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-gas-500/10 text-gas-500 border border-gas-500/20">
                        <Sparkles className="h-3 w-3" /> Featured Article
                      </span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground font-medium">
                        {featuredPost.category}
                      </span>
                    </div>

                    <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground group-hover:text-gas-400 transition-colors tracking-tight leading-snug">
                      {featuredPost.title}
                    </h2>

                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                      {featuredPost.excerpt}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-border/40 text-xs text-muted-foreground">
                    <div className="flex items-center gap-4">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {featuredPost.readTimeMinutes} min read
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Eye className="h-3.5 w-3.5" />
                        {featuredPost.viewCount} views
                      </span>
                      <span className="inline-flex items-center gap-1 text-gas-500">
                        <Share2 className="h-3.5 w-3.5" />
                        {featuredPost.shareCount} shares
                      </span>
                    </div>

                    <span className="inline-flex items-center gap-1 font-semibold text-gas-500 group-hover:translate-x-1 transition-transform">
                      Read Article <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>

                <div className="md:col-span-4 rounded-xl bg-gradient-to-tr from-gas-950/80 via-gas-900/40 to-muted/20 border border-gas-500/20 p-6 flex flex-col justify-center items-center text-center">
                  <BookOpen className="h-12 w-12 text-gas-400 mb-3 opacity-90" />
                  <span className="text-xs font-semibold text-gas-300">
                    Direct 1-Tier Strategy
                  </span>
                  <span className="text-[11px] text-muted-foreground mt-1">
                    Complete Masterclass
                  </span>
                </div>
              </div>
            </Card>
          </Link>
        </div>
      )}

      {/* Grid of Articles */}
      {regularPosts.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {regularPosts.map((post) => (
            <Link key={post.id} href={`/blog/${post.slug}`} className="group flex flex-col h-full">
              <Card className="flex flex-col justify-between h-full bg-card/60 hover:bg-card border-border/60 hover:border-gas-500/40 transition-all duration-300 shadow-md group-hover:shadow-lg group-hover:-translate-y-1 overflow-hidden">
                {post.coverImage && (
                  <div className="relative aspect-video w-full overflow-hidden bg-muted/30">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={post.coverImage}
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {post.images && post.images.length > 1 && (
                      <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border border-white/20">
                        <span>📷 {post.images.length}</span>
                      </div>
                    )}
                  </div>
                )}

                <CardHeader className="space-y-2.5 pb-3">
                  <div className="flex items-center justify-between text-xs">
                    <Badge variant="outline" className="text-[11px] font-medium border-gas-500/30 text-gas-500">
                      {post.category}
                    </Badge>
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {post.readTimeMinutes} min
                    </span>
                  </div>

                  <CardTitle className="text-lg font-bold text-foreground group-hover:text-gas-400 transition-colors line-clamp-2 leading-snug">
                    {post.title}
                  </CardTitle>
                </CardHeader>

                <CardContent className="flex-1 pb-4">
                  <CardDescription className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                    {post.excerpt}
                  </CardDescription>

                  {post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-4">
                      {post.tags.slice(0, 3).map((t) => (
                        <span
                          key={t}
                          className="text-[10px] px-2 py-0.5 rounded-md bg-muted/40 text-muted-foreground"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}
                </CardContent>

                <CardFooter className="pt-3 border-t border-border/40 text-xs text-muted-foreground flex items-center justify-between">
                  <div className="flex items-center gap-3 text-[11px]">
                    <span className="inline-flex items-center gap-1">
                      <Eye className="h-3 w-3" /> {post.viewCount}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      👏 {post.clapCount || 0}
                    </span>
                    <span className="inline-flex items-center gap-1 text-gas-500">
                      <Share2 className="h-3 w-3" /> {post.shareCount}
                    </span>
                  </div>

                  <span className="font-semibold text-gas-500 text-xs flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    Read <ArrowRight className="h-3 w-3" />
                  </span>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        !featuredPost && (
          <div className="text-center py-16 p-8 rounded-2xl border border-dashed border-border text-muted-foreground space-y-3">
            <BookOpen className="h-10 w-10 mx-auto text-gas-500 opacity-60" />
            <p className="text-base font-semibold text-foreground">No articles match your criteria</p>
            <p className="text-xs text-muted-foreground">Try selecting a different category or clearing your search.</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedCategory("All")
                setSearchQuery("")
              }}
              className="mt-2 text-xs"
            >
              Reset Filters
            </Button>
          </div>
        )
      )}

      {/* Affiliate Call-to-Action Banner */}
      <div className="rounded-3xl p-8 bg-gradient-to-r from-gas-950 via-gas-900 to-slate-900 border border-gas-500/30 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gas-500/10 border border-gas-500/20 text-gas-400 text-xs font-semibold">
            <TrendingUp className="h-3.5 w-3.5" /> Viral Affiliate Distribution
          </div>
          <h3 className="text-2xl font-bold text-white tracking-tight">
            Share Any Article &amp; Earn When Readers Convert
          </h3>
          <p className="text-xs text-slate-300 max-w-xl">
            Every blog post on GAS™ acts as an authentic content asset. When you share an article with your custom affiliate link, any future purchases from your readers are directly attributed to you.
          </p>
        </div>

        <Link href="/register">
          <Button size="lg" className="bg-gas-500 hover:bg-gas-600 text-white font-bold shadow-lg shadow-gas-500/25 px-6 whitespace-nowrap gap-2">
            Get Your Affiliate Code <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  )
}
