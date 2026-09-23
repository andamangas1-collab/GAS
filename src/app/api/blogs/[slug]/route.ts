import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params

    const post = await prisma.blogPost.findUnique({
      where: { slug },
      include: {
        author: {
          select: {
            id: true,
            email: true,
            role: true,
            profile: {
              select: {
                firstName: true,
                lastName: true,
                bio: true,
              },
            },
          },
        },
        featuredProduct: {
          select: {
            id: true,
            name: true,
            slug: true,
            price: true,
            category: true,
            commissionRules: {
              where: { isActive: true },
              take: 1,
            },
          },
        },
      },
    })

    if (!post || !post.isPublished) {
      return NextResponse.json(
        { success: false, error: "Article not found" },
        { status: 404 }
      )
    }

    // Increment view count asynchronously
    prisma.blogPost
      .update({
        where: { id: post.id },
        data: { viewCount: { increment: 1 } },
      })
      .catch(() => {})

    // Fetch related articles in same category
    const relatedPosts = await prisma.blogPost.findMany({
      where: {
        isPublished: true,
        category: post.category,
        id: { not: post.id },
      },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        coverImage: true,
        images: true,
        category: true,
        readTimeMinutes: true,
        clapCount: true,
        publishedAt: true,
      },
      take: 3,
      orderBy: { publishedAt: "desc" },
    })

    return NextResponse.json({
      success: true,
      data: {
        post,
        relatedPosts,
      },
    })
  } catch (error: any) {
    console.error("[API_BLOG_BY_SLUG_ERROR]", error)
    return NextResponse.json(
      { success: false, error: "Failed to load article" },
      { status: 500 }
    )
  }
}
