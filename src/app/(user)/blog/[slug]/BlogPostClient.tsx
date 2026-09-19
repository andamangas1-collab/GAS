"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  Clock,
  Eye,
  Calendar,
  ArrowLeft,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  User,
  Sparkles,
  BookOpen,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { SocialShareBar } from "@/components/blog/SocialShareBar"

interface BlogPostData {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  coverImage?: string | null
  category: string
  tags: string[]
  readTimeMinutes: number
  viewCount: number
  shareCount: number
  publishedAt: string | Date
  author: {
    id: string
    email: string
    role: string
    profile?: {
      firstName: string | null
      lastName: string | null
      bio?: string | null
    } | null
  }
  featuredProduct?: {
    id: string
    name: string
    slug: string
    price: number | string
    category: string
    commissionRules?: Array<{
      value: number | string
      type: string
    }>
  } | null
}

interface RelatedPost {
  id: string
  title: string
  slug: string
  excerpt: string
  coverImage?: string | null
  category: string
  readTimeMinutes: number
  publishedAt: string | Date
}

interface BlogPostClientProps {
  post: BlogPostData
  relatedPosts: RelatedPost[]
  referralCode?: string | null
}

export function BlogPostClient({
  post,
  relatedPosts,
  referralCode,
}: BlogPostClientProps) {
  const [scrollProgress, setScrollProgress] = useState(0)

  // Track reading progress on scroll
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight =
        document.documentElement.scrollHeight - window.innerHeight
      if (totalHeight > 0) {
        const currentProgress = (window.scrollY / totalHeight) * 100
        setScrollProgress(Math.min(100, Math.max(0, currentProgress)))
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const authorName =
    post.author.profile?.firstName && post.author.profile?.lastName
      ? `${post.author.profile.firstName} ${post.author.profile.lastName}`
      : "GAS™ Editorial Board"

  const formattedDate = new Date(post.publishedAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })

  return (
    <div className="relative">
      {/* Dynamic Top Reading Progress Bar */}
      <div
        className="fixed top-0 left-0 right-0 h-1 bg-gas-500 z-50 transition-all duration-75 shadow-sm shadow-gas-500/50"
        style={{ width: `${scrollProgress}%` }}
      />

      <article className="container mx-auto px-4 py-8 md:py-12 max-w-4xl space-y-8">
        {/* Back Link */}
        <div>
          <Link href="/blog">
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-muted-foreground hover:text-foreground -ml-2"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Articles
            </Button>
          </Link>
        </div>

        {/* Article Header & Metadata */}
        <header className="space-y-4 pb-6 border-b border-border/60">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <Badge className="bg-gas-500/10 text-gas-500 border border-gas-500/20 font-medium">
              {post.category}
            </Badge>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {formattedDate}
            </span>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {post.readTimeMinutes} min read
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
            {post.title}
          </h1>

          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            {post.excerpt}
          </p>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-gas-500/10 border border-gas-500/20 flex items-center justify-center text-gas-500 font-bold">
                <User className="h-4 w-4" />
              </div>
              <div>
                <p className="font-semibold text-foreground">{authorName}</p>
                <p className="text-[11px] text-muted-foreground">
                  Verified GAS™ Strategist
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1">
                <Eye className="h-4 w-4 text-muted-foreground" />
                {post.viewCount} reads
              </span>
            </div>
          </div>
        </header>

        {/* Top 1-Click Social Sharing Bar */}
        <SocialShareBar
          title={post.title}
          slug={post.slug}
          referralCode={referralCode}
          variant="inline"
        />

        {/* Article Body Content */}
        <div className="prose prose-slate dark:prose-invert max-w-none text-foreground/90 leading-relaxed text-base space-y-6 pt-2">
          {post.content.split("\n\n").map((paragraph, index) => {
            const trimmed = paragraph.trim()

            // Headings
            if (trimmed.startsWith("### ")) {
              return (
                <h3
                  key={index}
                  className="text-xl sm:text-2xl font-bold text-foreground mt-8 mb-3 tracking-tight"
                >
                  {trimmed.replace("### ", "")}
                </h3>
              )
            }
            if (trimmed.startsWith("## ")) {
              return (
                <h2
                  key={index}
                  className="text-2xl sm:text-3xl font-extrabold text-foreground mt-10 mb-4 tracking-tight border-b border-border/40 pb-2"
                >
                  {trimmed.replace("## ", "")}
                </h2>
              )
            }

            // Blockquotes
            if (trimmed.startsWith("> ")) {
              return (
                <blockquote
                  key={index}
                  className="p-4 my-6 border-l-4 border-gas-500 bg-gas-500/5 rounded-r-xl italic text-foreground/90"
                >
                  {trimmed.replace("> ", "").replace(/"/g, "")}
                </blockquote>
              )
            }

            // Unordered List Items
            if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
              const items = trimmed.split("\n").map((li) => li.replace(/^[-*]\s+/, ""))
              return (
                <ul key={index} className="list-disc pl-6 space-y-2 my-4">
                  {items.map((it, i) => (
                    <li key={i} className="text-foreground/90">
                      {it}
                    </li>
                  ))}
                </ul>
              )
            }

            // Numbered List Items
            if (/^\d+\.\s/.test(trimmed)) {
              const items = trimmed.split("\n").map((li) => li.replace(/^\d+\.\s+/, ""))
              return (
                <ol key={index} className="list-decimal pl-6 space-y-2.5 my-4">
                  {items.map((it, i) => (
                    <li key={i} className="text-foreground/90">
                      {it}
                    </li>
                  ))}
                </ol>
              )
            }

            // Standard Paragraph
            return (
              <p key={index} className="leading-relaxed text-foreground/90">
                {trimmed}
              </p>
            )
          })}
        </div>

        {/* Embedded Featured Product Call-to-Action (if linked) */}
        {post.featuredProduct && (
          <div className="my-10 p-6 rounded-2xl bg-gradient-to-r from-card via-card to-gas-950/20 border border-gas-500/30 shadow-lg space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-gas-500 uppercase tracking-wider flex items-center gap-1">
                  <ShoppingBag className="h-3.5 w-3.5" /> Featured Solution in Article
                </span>
                <h4 className="text-lg font-bold text-foreground">
                  {post.featuredProduct.name}
                </h4>
                <p className="text-xs text-muted-foreground">
                  Direct verified solution with instant access and commission eligibility.
                </p>
              </div>

              <div className="text-right sm:self-center">
                <div className="text-2xl font-black text-foreground">
                  ₹{Number(post.featuredProduct.price).toLocaleString("en-IN")}
                </div>
                {post.featuredProduct.commissionRules?.[0] && (
                  <span className="text-[11px] text-gas-500 font-semibold">
                    {post.featuredProduct.commissionRules[0].value}% Direct Commission
                  </span>
                )}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Link
                href={`/checkout?productId=${post.featuredProduct.id}${
                  referralCode ? `&ref=${referralCode}` : ""
                }`}
              >
                <Button className="bg-gas-500 hover:bg-gas-600 text-white font-bold gap-2 text-xs h-10 px-5">
                  Get Instant Access <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Bottom Social Share Bar with Affiliate Telemetry */}
        <div className="pt-8 border-t border-border/60 space-y-3">
          <h4 className="text-sm font-semibold text-foreground">
            Did you find this article valuable? Share it with your network:
          </h4>
          <SocialShareBar
            title={post.title}
            slug={post.slug}
            referralCode={referralCode}
            variant="inline"
          />
        </div>

        {/* Author Bio Card */}
        <div className="p-6 rounded-2xl bg-muted/20 border border-border/60 flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
          <div className="h-14 w-14 rounded-full bg-gas-500/10 border border-gas-500/30 flex items-center justify-center text-gas-500 font-bold shrink-0">
            <User className="h-7 w-7" />
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-base text-foreground">{authorName}</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {post.author.profile?.bio ||
                "Official contributor to the GAS™ Platform. Specializing in direct affiliate architectures, value creation pipelines, and creator monetization."}
            </p>
          </div>
        </div>

        {/* Related Articles */}
        {relatedPosts.length > 0 && (
          <section className="pt-12 space-y-6">
            <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-gas-500" />
              Related Strategic Reads
            </h3>

            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {relatedPosts.map((rel) => (
                <Link
                  key={rel.id}
                  href={`/blog/${rel.slug}`}
                  className="group block p-4 rounded-xl border border-border/60 bg-card/60 hover:bg-card hover:border-gas-500/40 transition-all"
                >
                  <div className="text-[11px] text-gas-500 font-medium mb-1">
                    {rel.category}
                  </div>
                  <h5 className="text-sm font-bold text-foreground group-hover:text-gas-400 transition-colors line-clamp-2 leading-snug mb-2">
                    {rel.title}
                  </h5>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {rel.excerpt}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </article>
    </div>
  )
}
