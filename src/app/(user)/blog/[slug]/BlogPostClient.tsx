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
  Share2,
  Copy,
  Check,
  MessageCircle,
  Twitter,
  Linkedin,
  Image as ImageIcon,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { SocialShareBar } from "@/components/blog/SocialShareBar"
import { TableOfContents } from "@/components/blog/TableOfContents"
import { MultiImageGallery } from "@/components/blog/MultiImageGallery"
import { ClapButton } from "@/components/blog/ClapButton"
import { SocialDiscussionBar } from "@/components/blog/SocialDiscussionBar"
import { BlogNewsletterCard } from "@/components/blog/BlogNewsletterCard"
import { useToast } from "@/hooks/use-toast"
import { renderMarkdownBody } from "@/lib/format-markdown"

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
  const { toast } = useToast()
  const [scrollProgress, setScrollProgress] = useState(0)
  const [copiedLink, setCopiedLink] = useState(false)

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

  // Full article URL for sharing
  const origin =
    typeof window !== "undefined"
      ? window.location.origin
      : "https://singularityingolok.blog"
  const shareableUrl = referralCode
    ? `${origin}/blog/${post.slug}?ref=${referralCode}`
    : `${origin}/blog/${post.slug}`

  // Filter gallery images (excluding cover if already shown in hero banner)
  const galleryImages: string[] = []
  if (Array.isArray(post.images)) {
    post.images.forEach((img) => {
      if (
        img &&
        typeof img === "string" &&
        img.trim() !== "" &&
        img !== post.coverImage
      ) {
        galleryImages.push(img)
      }
    })
  }

  const handleCopyShareLink = () => {
    navigator.clipboard.writeText(shareableUrl)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
    toast({
      title: "Link Copied!",
      description: "Article link copied with your referral tag attached.",
    })
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <div className="relative pb-28">
      {/* Dynamic Top Reading Progress Bar */}
      <div
        className="fixed top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-gas-600 via-emerald-500 to-teal-400 z-50 transition-all duration-75 shadow-sm shadow-gas-500/40"
        style={{ width: `${scrollProgress}%` }}
      />

      {/* Ambient Hero Glow Effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-gas-500/10 via-gas-500/5 to-transparent blur-3xl pointer-events-none -z-10" />

      <div className="container mx-auto px-4 py-8 md:py-12 max-w-6xl">
        {/* Back Navigation Bar */}
        <div className="mb-6 flex items-center justify-between">
          <Link href="/blog">
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground -ml-2 rounded-full px-3"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Articles
            </Button>
          </Link>

          <span className="text-[11px] font-mono text-muted-foreground">
            {post.category}
          </span>
        </div>

        {/* ============================================================ */}
        {/* CINEMATIC HERO SECTION */}
        {/* ============================================================ */}
        <header className="space-y-6 pb-8 border-b border-border/60">
          {/* Metadata Badges */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <Badge className="bg-gas-500/10 text-gas-600 dark:text-gas-400 border border-gas-500/25 font-bold px-3 py-1 rounded-full shadow-sm">
              <Sparkles className="h-3 w-3 mr-1" />
              {post.category}
            </Badge>

            <span className="text-muted-foreground/60">•</span>

            <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
              <Calendar className="h-3.5 w-3.5" />
              {formattedDate}
            </span>

            <span className="text-muted-foreground/60">•</span>

            <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
              <Clock className="h-3.5 w-3.5" />
              {post.readTimeMinutes} min read
            </span>
          </div>

          {/* Article Title */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-foreground leading-[1.12]">
            {post.title}
          </h1>

          {/* Lead Excerpt */}
          <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed font-normal max-w-4xl">
            {post.excerpt}
          </p>

          {/* Author Signature & Engagement Summary Card */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-border/40 text-xs text-muted-foreground">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-full bg-gas-500/10 border-2 border-gas-500/30 flex items-center justify-center text-gas-500 font-bold shadow-sm">
                <User className="h-5 w-5" />
              </div>
              <div>
                <p className="font-bold text-foreground text-sm flex items-center gap-1.5">
                  {authorName}
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-gas-500/10 text-gas-600 dark:text-gas-400 border border-gas-500/20 font-semibold">
                    Verified
                  </span>
                </p>
                <p className="text-[11px] text-muted-foreground">
                  GAS™ Strategy Contributor
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 font-medium" title="Reads">
                <Eye className="h-4 w-4 text-muted-foreground" />
                {post.viewCount} reads
              </span>
              <span>•</span>
              <ClapButton slug={post.slug} initialCount={post.clapCount || 0} />
            </div>
          </div>

          {/* Cinematic Cover Banner (if coverImage exists) */}
          {post.coverImage && (
            <div className="relative rounded-3xl overflow-hidden border border-border/80 shadow-2xl bg-muted/20 my-8 group aspect-[16/9] max-h-[520px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={post.coverImage}
                alt={post.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
            </div>
          )}
        </header>

        {/* Top 1-Click Social Sharing Ribbon */}
        <div className="my-6">
          <SocialShareBar
            title={post.title}
            slug={post.slug}
            referralCode={referralCode}
            variant="inline"
          />
        </div>

        {/* ============================================================ */}
        {/* TWO-COLUMN EDITORIAL READING CANVAS */}
        {/* ============================================================ */}
        <div className="flex flex-col lg:flex-row gap-12 items-start mt-8">
          {/* Main Article Container */}
          <article className="flex-1 max-w-[72ch] space-y-8 w-full">
            {/* Mobile Collapsible Table of Contents */}
            <TableOfContents content={post.content} variant="mobile" />

            {/* Editorial Body Content with Rich Markdown Support & Justified Typography */}
            <div className="space-y-6 text-foreground/90 text-[17px] sm:text-[18px] leading-[1.85] font-normal">
              {renderMarkdownBody(post.content)}
            </div>

            {/* Visual Storyboard & Media Highlights Showcase (Repositioned to editorial break) */}
            {galleryImages.length > 0 && (
              <section className="my-10 p-5 sm:p-6 rounded-3xl bg-muted/20 border border-border/80 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-border/60 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-xl bg-gas-500/10 flex items-center justify-center text-gas-600 dark:text-gas-400">
                      <ImageIcon className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-foreground">
                        Visual Storyboard &amp; Media Highlights
                      </h4>
                      <p className="text-[11px] text-muted-foreground">
                        {galleryImages.length} High-Resolution Strategic Asset{galleryImages.length === 1 ? "" : "s"}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[10px] font-mono">
                    Visual Evidence
                  </Badge>
                </div>
                <MultiImageGallery
                  images={galleryImages}
                  title={post.title}
                />
              </section>
            )}

            {/* ============================================================ */}
            {/* FEATURED PRODUCT SOLUTION CTA (High-Converting Hook) */}
            {/* ============================================================ */}
            {post.featuredProduct && (
              <div className="my-12 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-card via-card to-gas-950/20 border-2 border-gas-500/30 shadow-xl space-y-5 relative overflow-hidden group">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-gas-500 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5" />
                      Featured Strategy Solution
                    </span>
                    <h4 className="text-xl sm:text-2xl font-black text-foreground">
                      {post.featuredProduct.name}
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed max-w-md">
                      Verified direct digital product. Instant access with full lifetime updates and direct affiliate commission eligibility.
                    </p>
                  </div>

                  <div className="text-left sm:text-right sm:self-center shrink-0">
                    <div className="text-3xl font-black text-foreground">
                      ₹{Number(post.featuredProduct.price).toLocaleString("en-IN")}
                    </div>
                    {post.featuredProduct.commissionRules?.[0] && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-gas-600 dark:text-gas-400 font-bold bg-gas-500/10 border border-gas-500/20 px-2 py-0.5 rounded-full mt-1">
                        <CheckCircle2 className="h-3 w-3" />
                        {post.featuredProduct.commissionRules[0].value}% Direct Commission
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border/40">
                  <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <ShieldCheck className="h-4 w-4 text-emerald-500" />
                    100% Secure Checkout via Razorpay
                  </span>

                  <Link
                    href={`/checkout?productId=${post.featuredProduct.id}${
                      referralCode ? `&ref=${referralCode}` : ""
                    }`}
                    className="w-full sm:w-auto"
                  >
                    <Button className="w-full sm:w-auto bg-gas-600 hover:bg-gas-700 text-white font-bold gap-2 text-xs h-11 px-6 shadow-lg shadow-gas-600/25 rounded-xl">
                      Get Instant Access <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            )}

            {/* Social Discussions ("Join the Discussion") */}
            <SocialDiscussionBar socialLinks={post.socialLinks} />

            {/* Bottom Appreciation & Share Bar */}
            <div className="pt-8 border-t border-border/60 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-base font-bold text-foreground">
                    Enjoyed this article?
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Show your appreciation with a clap or share with your network.
                  </p>
                </div>
                <ClapButton slug={post.slug} initialCount={post.clapCount || 0} />
              </div>

              <SocialShareBar
                title={post.title}
                slug={post.slug}
                referralCode={referralCode}
                variant="inline"
              />
            </div>

            {/* Author Showcase Card */}
            <div className="p-6 rounded-3xl bg-muted/20 border border-border/70 flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left shadow-sm">
              <div className="h-16 w-16 rounded-full bg-gas-500/10 border-2 border-gas-500/30 flex items-center justify-center text-gas-500 font-bold shrink-0 shadow-inner">
                <User className="h-8 w-8" />
              </div>
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h4 className="font-bold text-base text-foreground">
                    {authorName}
                  </h4>
                  <Badge variant="outline" className="text-[10px] font-semibold">
                    Strategy Author
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {post.author.profile?.bio ||
                    "Official contributor to the GAS™ Platform. Specializing in direct affiliate architectures, value creation pipelines, and creator monetization."}
                </p>
              </div>
            </div>

            {/* Newsletter Lead Magnet */}
            <BlogNewsletterCard className="my-8" />

            {/* ============================================================ */}
            {/* VISUAL RELATED ARTICLES GRID */}
            {/* ============================================================ */}
            {relatedPosts.length > 0 && (
              <section className="pt-10 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl sm:text-2xl font-black text-foreground flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-gas-500" />
                    Related Strategic Reads
                  </h3>
                  <Link
                    href="/blog"
                    className="text-xs font-semibold text-gas-600 hover:underline flex items-center gap-1"
                  >
                    View All <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>

                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
                  {relatedPosts.map((rel) => (
                    <Link
                      key={rel.id}
                      href={`/blog/${rel.slug}`}
                      className="group block rounded-2xl border border-border/70 bg-card overflow-hidden hover:border-gas-500/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 shadow-sm"
                    >
                      {/* Thumbnail Cover */}
                      <div className="aspect-[16/10] w-full overflow-hidden bg-muted/40 relative">
                        {rel.coverImage ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={rel.coverImage}
                            alt={rel.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gas-500/5 text-gas-500">
                            <BookOpen className="h-8 w-8 opacity-40" />
                          </div>
                        )}
                        <Badge className="absolute top-2.5 left-2.5 bg-background/90 backdrop-blur-md text-foreground text-[10px] font-semibold border border-border/80">
                          {rel.category}
                        </Badge>
                      </div>

                      <div className="p-4 space-y-2">
                        <h5 className="text-sm font-bold text-foreground group-hover:text-gas-600 transition-colors line-clamp-2 leading-snug">
                          {rel.title}
                        </h5>
                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                          {rel.excerpt}
                        </p>
                        <div className="pt-2 text-[11px] text-muted-foreground flex items-center justify-between border-t border-border/40">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {rel.readTimeMinutes} min
                          </span>
                          <span className="text-gas-600 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                            Read <ArrowRight className="h-3 w-3" />
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </article>

          {/* Desktop Sticky Sidebar with TOC + Trending Articles */}
          <aside className="hidden lg:block w-80 shrink-0 space-y-6 sticky top-24">
            <TableOfContents content={post.content} variant="desktop" />

            {/* Trending Strategic Reads Mini-Card Feed */}
            {relatedPosts.length > 0 && (
              <div className="rounded-3xl border border-border/70 bg-card/60 p-5 backdrop-blur-xl shadow-lg shadow-black/5 space-y-4">
                <div className="flex items-center justify-between border-b border-border/50 pb-2.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-gas-500" />
                    Trending Reads
                  </h4>
                  <Link
                    href="/blog"
                    className="text-[10px] font-semibold text-gas-600 hover:underline flex items-center gap-0.5"
                  >
                    View All <ArrowRight className="h-2.5 w-2.5" />
                  </Link>
                </div>

                <div className="space-y-3">
                  {relatedPosts.slice(0, 3).map((rel) => (
                    <Link
                      key={rel.id}
                      href={`/blog/${rel.slug}`}
                      className="group flex items-start gap-3 rounded-xl p-2 -mx-2 hover:bg-muted/40 transition-colors"
                    >
                      {rel.coverImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={rel.coverImage}
                          alt={rel.title}
                          className="h-12 w-16 object-cover rounded-lg border border-border shrink-0 shadow-sm"
                        />
                      ) : (
                        <div className="h-12 w-16 rounded-lg bg-gas-500/10 border border-border/80 flex items-center justify-center text-gas-500 shrink-0">
                          <BookOpen className="h-4 w-4 opacity-50" />
                        </div>
                      )}
                      <div className="min-w-0 space-y-1">
                        <span className="text-[10px] font-bold text-gas-600 dark:text-gas-400 block truncate uppercase tracking-wider">
                          {rel.category}
                        </span>
                        <h5 className="text-xs font-bold text-foreground group-hover:text-gas-600 transition-colors line-clamp-2 leading-snug">
                          {rel.title}
                        </h5>
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Clock className="h-2.5 w-2.5" /> {rel.readTimeMinutes}m read
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>

      {/* ============================================================ */}
      {/* SMART FLOATING BOTTOM DOCK */}
      {/* ============================================================ */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-background/90 backdrop-blur-2xl border border-border/80 rounded-full shadow-2xl px-4 py-2 flex items-center gap-2.5">
        {/* Claps */}
        <ClapButton slug={post.slug} initialCount={post.clapCount || 0} />

        <div className="h-4 w-px bg-border/80" />

        {/* Read progress */}
        <span className="text-[11px] font-mono font-bold text-muted-foreground px-1 whitespace-nowrap">
          {Math.round(scrollProgress)}% read
        </span>

        <div className="h-4 w-px bg-border/80" />

        {/* 1-Click WhatsApp Share */}
        <a
          href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
            `Read: "${post.title}"\n${shareableUrl}`
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          title="Share via WhatsApp"
          className="p-1.5 rounded-full text-emerald-500 hover:bg-emerald-500/10 transition-colors"
        >
          <MessageCircle className="h-4 w-4" />
        </a>

        {/* 1-Click X / Twitter Share */}
        <a
          href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
            `Read: "${post.title}"`
          )}&url=${encodeURIComponent(shareableUrl)}`}
          target="_blank"
          rel="noopener noreferrer"
          title="Share on X"
          className="p-1.5 rounded-full text-sky-500 hover:bg-sky-500/10 transition-colors"
        >
          <Twitter className="h-4 w-4" />
        </a>

        {/* 1-Click Copy Link with Tooltip/State */}
        <button
          type="button"
          onClick={handleCopyShareLink}
          title="Copy Article Link with Referral Tag"
          className="p-1.5 rounded-full text-gas-600 hover:bg-gas-500/10 transition-colors"
        >
          {copiedLink ? (
            <Check className="h-4 w-4 text-emerald-500" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </button>

        <div className="h-4 w-px bg-border/80" />

        {/* Scroll To Top */}
        <button
          type="button"
          onClick={scrollToTop}
          title="Back to Top"
          className="p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
        >
          <ArrowUp className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
