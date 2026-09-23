import { Metadata } from "next"
import { prisma } from "@/lib/prisma"
import { BlogFeedClient } from "./BlogFeedClient"
import { BookOpen } from "lucide-react"

export const dynamic = "force-dynamic"
export const revalidate = 60

export const metadata: Metadata = {
  title: "Blog & Insights | GAS™ — Grand Affiliate System",
  description:
    "Explore direct affiliate strategies, transparent 1-tier models, value-to-value (V2V) commerce frameworks, and creator distribution playbooks.",
  openGraph: {
    title: "GAS™ Platform Insights & Direct Affiliate Strategies",
    description: "Master high-converting transparent affiliate marketing without MLM downlines.",
    url: "https://singularityingolok.blog/blog",
    siteName: "GAS™ — Grand Affiliate System",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "GAS™ Platform Insights & Direct Affiliate Strategies",
    description: "Master high-converting transparent affiliate marketing without MLM downlines.",
  },
}

export default async function BlogPage() {
  const [posts, categoriesRaw] = await Promise.all([
    prisma.blogPost.findMany({
      where: { isPublished: true },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        coverImage: true,
        images: true,
        category: true,
        tags: true,
        readTimeMinutes: true,
        viewCount: true,
        shareCount: true,
        clapCount: true,
        publishedAt: true,
        author: {
          select: {
            email: true,
            profile: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
      orderBy: { publishedAt: "desc" },
    }),
    prisma.blogPost.findMany({
      where: { isPublished: true },
      select: { category: true },
      distinct: ["category"],
    }),
  ])

  const categories = ["All", ...categoriesRaw.map((c) => c.category)]

  return (
    <div className="container mx-auto px-4 py-12 md:py-16 max-w-7xl">
      {/* Header Section */}
      <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full bg-gas-50 dark:bg-gas-950/60 px-3.5 py-1 text-xs font-semibold text-gas-600 dark:text-gas-400 border border-gas-200/80 dark:border-gas-800/80 shadow-sm">
          <BookOpen className="h-3.5 w-3.5" />
          The Knowledge &amp; Strategy Hub
        </div>

        <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-foreground">
          GAS™ Insights &amp; Playbooks
        </h1>

        <p className="text-base text-muted-foreground leading-relaxed">
          Master transparent 1-tier direct affiliate marketing, scale digital asset revenue, and discover the mechanics of the Value-to-Value (V2V) commerce engine.
        </p>
      </div>

      <BlogFeedClient initialPosts={posts} categories={categories} />
    </div>
  )
}
