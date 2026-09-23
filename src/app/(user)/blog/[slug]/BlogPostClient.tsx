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
  ArrowUp,
  Info,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { SocialShareBar } from "@/components/blog/SocialShareBar"
import { TableOfContents } from "@/components/blog/TableOfContents"
import { MultiImageGallery } from "@/components/blog/MultiImageGallery"
import { ClapButton } from "@/components/blog/ClapButton"
import { SocialDiscussionBar } from "@/components/blog/SocialDiscussionBar"
import { BlogNewsletterCard } from "@/components/blog/BlogNewsletterCard"

interface BlogPostData {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  coverImage?: string | null
  images?: string[]
  category: string
  tags: string[]
  readTimeMinutes: number
  viewCount: number
  shareCount: number
  clapCount?: number
  socialLinks?: any
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
  images?: string[]
  category: string
  readTimeMinutes: number
  clapCount?: number
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

  // Combine cover image and additional images for the gallery if available
  const allVisualImages: string[] = []
  if (post.coverImage) allVisualImages.push(post.coverImage)
  if (Array.isArray(post.images)) {
    post.images.forEach((img) => {
      if (img && !allVisualImages.includes(img)) allVisualImages.push(img)
    })
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <div className="relative pb-24">
      {/* Dynamic Top Reading Progress Bar */}
      <div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-gas-600 via-emerald-500 to-teal-400 z-50 transition-all duration-75 shadow-sm shadow-gas-500/50"
        style={{ width: `${scrollProgress}%` }}
      />

      <div className="container mx-auto px-4 py-8 md:py-12 max-w-6xl">
        {/* Back Link */}
        <div className="mb-6">
          <Link href="/blog">
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-muted-foreground hover:text-foreground -ml-2 text-xs"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Articles
            </Button>
          </Link>
        </div>

        {/* Two-Column Layout: Main Content + Sticky Table of Contents */}
        <div className="flex flex-col lg:flex-row gap-10 items-start">
          {/* Main Article Container */}
          <article className="flex-1 max-w-3xl space-y-8 w-full">
            {/* Article Header & Metadata */}
            <header className="space-y-4 pb-6 border-b border-border/60">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <Badge className="bg-gas-500/10 text-gas-600 dark:text-gas-400 border border-gas-500/20 font-semibold px-3 py-0.5">
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

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-foreground leading-[1.15]">
                {post.title}
              </h1>

              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed font-normal">
                {post.excerpt}
              </p>

              <div className="flex flex-wrap items-center justify-between gap-4 pt-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gas-500/10 border border-gas-500/20 flex items-center justify-center text-gas-500 font-bold">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{authorName}</p>
                    <p className="text-[11px] text-muted-foreground">
                      Verified GAS™ Strategist
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1">
                    <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                    {post.viewCount} reads
                  </span>
                  <span>•</span>
                  <ClapButton slug={post.slug} initialCount={post.clapCount || 0} />
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

            {/* Mobile Collapsible Table of Contents */}
            <TableOfContents content={post.content} className="lg:hidden" />

            {/* Multi-Image Gallery / Exhibits (if images exist) */}
            {allVisualImages.length > 0 && (
              <MultiImageGallery
                images={allVisualImages}
                title={post.title}
                className="my-6"
              />
            )}

            {/* Article Body Content with Rich Markdown Support */}
            <div className="prose prose-slate dark:prose-invert max-w-none text-foreground/90 leading-relaxed text-base space-y-6 pt-2">
              {post.content.split("\n\n").map((paragraph, index) => {
                const trimmed = paragraph.trim()

                // Markdown Image: ![caption](url)
                const imgMatch = trimmed.match(/^!\[(.*?)\]\((.*?)\)$/)
                if (imgMatch) {
                  const caption = imgMatch[1]
                  const imgUrl = imgMatch[2]
                  return (
                    <figure key={index} className="my-6 rounded-2xl overflow-hidden border border-border/60 bg-muted/20">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imgUrl}
                        alt={caption || post.title}
                        className="w-full h-auto object-cover max-h-[500px]"
                      />
                      {caption && (
                        <figcaption className="text-center text-xs text-muted-foreground py-2 px-4 italic border-t border-border/40">
                          {caption}
                        </figcaption>
                      )}
                    </figure>
                  )
                }

                // Headings (H2)
                if (trimmed.startsWith("## ")) {
                  const rawText = trimmed.replace("## ", "").replace(/\*\*/g, "").replace(/\*/g, "")
                  const id = rawText.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
                  return (
                    <h2
                      key={index}
                      id={id}
                      className="text-2xl sm:text-3xl font-extrabold text-foreground mt-10 mb-4 tracking-tight border-b border-border/40 pb-2 scroll-mt-24"
                    >
                      {rawText}
                    </h2>
                  )
                }

                // Headings (H3)
                if (trimmed.startsWith("### ")) {
                  const rawText = trimmed.replace("### ", "").replace(/\*\*/g, "").replace(/\*/g, "")
                  const id = rawText.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
                  return (
                    <h3
                      key={index}
                      id={id}
                      className="text-xl sm:text-2xl font-bold text-foreground mt-8 mb-3 tracking-tight scroll-mt-24"
                    >
                      {rawText}
                    </h3>
                  )
                }

                // Callouts: > [!TIP] / > [!NOTE] / > [!WARNING]
                if (trimmed.startsWith("> [!TIP]")) {
                  return (
                    <div
                      key={index}
                      className="my-5 p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 text-foreground space-y-1.5"
                    >
                      <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase tracking-wide">
                        <Lightbulb className="h-4 w-4" /> Pro Tip
                      </div>
                      <p className="text-sm leading-relaxed text-foreground/90">
                        {trimmed.replace("> [!TIP]", "").trim()}
                      </p>
                    </div>
                  )
                }

                if (trimmed.startsWith("> [!NOTE]")) {
                  return (
                    <div
                      key={index}
                      className="my-5 p-4 rounded-xl border border-sky-500/30 bg-sky-500/5 text-foreground space-y-1.5"
                    >
                      <div className="flex items-center gap-1.5 text-sky-600 dark:text-sky-400 font-bold text-xs uppercase tracking-wide">
                        <Info className="h-4 w-4" /> Note
                      </div>
                      <p className="text-sm leading-relaxed text-foreground/90">
                        {trimmed.replace("> [!NOTE]", "").trim()}
                      </p>
                    </div>
                  )
                }

                if (trimmed.startsWith("> [!WARNING]") || trimmed.startsWith("> [!CAUTION]")) {
                  return (
                    <div
                      key={index}
                      className="my-5 p-4 rounded-xl border border-amber-500/30 bg-amber-500/5 text-foreground space-y-1.5"
                    >
                      <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-bold text-xs uppercase tracking-wide">
                        <AlertTriangle className="h-4 w-4" /> Warning
                      </div>
                      <p className="text-sm leading-relaxed text-foreground/90">
                        {trimmed.replace(/> \[(?:!WARNING|!CAUTION)\]/, "").trim()}
                      </p>
                    </div>
                  )
                }

                // Standard Blockquotes
                if (trimmed.startsWith("> ")) {
                  return (
                    <blockquote
                      key={index}
                      className="p-4 my-6 border-l-4 border-gas-500 bg-gas-500/5 rounded-r-xl italic text-foreground/90"
                    >
                      {trimmed.replace(/^>\s*/, "").replace(/"/g, "")}
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

                // Horizontal Rule
                if (trimmed === "---") {
                  return <hr key={index} className="my-8 border-border/60" />
                }

                // Standard Paragraph
                return (
                  <p key={index} className="leading-relaxed text-foreground/90">
                    {trimmed}
                  </p>
                )
              })}
            </div>

            {/* Embedded Featured Solution CTA */}
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
                    <Button className="bg-gas-500 hover:bg-gas-600 text-white font-bold gap-2 text-xs h-10 px-5 shadow-md shadow-gas-500/20">
                      Get Instant Access <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            )}

            {/* Live Social Discussions ("Feeding Social Media Links") */}
            <SocialDiscussionBar socialLinks={post.socialLinks} />

            {/* Bottom Engagement Bar with Claps & Shares */}
            <div className="pt-8 border-t border-border/60 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-foreground">
                  Enjoyed this read? Show some appreciation:
                </h4>
                <ClapButton slug={post.slug} initialCount={post.clapCount || 0} />
              </div>
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

            {/* Newsletter & Affiliate Lead Magnet Box */}
            <BlogNewsletterCard className="my-8" />

            {/* Related Strategic Reads */}
            {relatedPosts.length > 0 && (
              <section className="pt-8 space-y-6">
                <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-gas-500" />
                  Related Strategic Reads
                </h3>

                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {relatedPosts.map((rel) => (
                    <Link
                      key={rel.id}
                      href={`/blog/${rel.slug}`}
                      className="group block p-4 rounded-xl border border-border/60 bg-card/60 hover:bg-card hover:border-gas-500/40 transition-all shadow-sm"
                    >
                      <div className="text-[11px] text-gas-500 font-semibold mb-1">
                        {rel.category}
                      </div>
                      <h5 className="text-sm font-bold text-foreground group-hover:text-gas-500 transition-colors line-clamp-2 leading-snug mb-2">
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

          {/* Desktop Sticky Table of Contents Sidebar */}
          <TableOfContents content={post.content} className="hidden lg:block" />
        </div>
      </div>

      {/* Floating Bottom Engagement Dock */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-background/90 backdrop-blur-xl border border-border/80 rounded-full shadow-2xl px-4 py-2 flex items-center gap-3">
        <ClapButton slug={post.slug} initialCount={post.clapCount || 0} />

        <div className="h-4 w-px bg-border/80" />

        <span className="text-[11px] font-mono font-semibold text-muted-foreground">
          {Math.round(scrollProgress)}% read
        </span>

        <div className="h-4 w-px bg-border/80" />

        <button
          type="button"
          onClick={scrollToTop}
          title="Scroll to top"
          className="p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
        >
          <ArrowUp className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}
