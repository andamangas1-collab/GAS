import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth-guard"
import { prisma } from "@/lib/prisma"

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin()
    const { id } = params
    const body = await request.json().catch(() => ({}))
    const webhookUrls: string[] = Array.isArray(body.webhookUrls) ? body.webhookUrls : []
    const customMessage: string = body.customMessage || ""

    const post = await prisma.blogPost.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            email: true,
            profile: { select: { firstName: true, lastName: true } },
          },
        },
      },
    })

    if (!post) {
      return NextResponse.json({ success: false, error: "Post not found" }, { status: 404 })
    }

    const host =
      request.headers.get("x-forwarded-host") ||
      request.headers.get("host") ||
      "singularityingolok.blog"
    const protocol = host.includes("localhost") ? "http" : "https"
    const fullArticleUrl = `${protocol}://${host}/blog/${post.slug}`

    const broadcastPayload = {
      event: "blog.broadcast",
      timestamp: new Date().toISOString(),
      customMessage: customMessage || undefined,
      article: {
        id: post.id,
        title: post.title,
        slug: post.slug,
        url: fullArticleUrl,
        excerpt: post.excerpt,
        coverImage: post.coverImage,
        images: post.images,
        category: post.category,
        tags: post.tags,
        readTimeMinutes: post.readTimeMinutes,
        author: post.author.profile?.firstName
          ? `${post.author.profile.firstName} ${post.author.profile.lastName || ""}`.trim()
          : post.author.email,
        publishedAt: post.publishedAt,
      },
    }

    const dispatchResults = await Promise.allSettled(
      webhookUrls.map(async (url) => {
        const res = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "User-Agent": "GAS-Blog-Syndicator/1.0",
          },
          body: JSON.stringify(broadcastPayload),
        })
        return { url, status: res.status, ok: res.ok }
      })
    )

    return NextResponse.json({
      success: true,
      message: `Broadcast dispatched to ${webhookUrls.length} webhook endpoint(s)`,
      results: dispatchResults,
    })
  } catch (error: any) {
    console.error("[API_BLOG_BROADCAST_ERROR]", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to broadcast article" },
      { status: 500 }
    )
  }
}
