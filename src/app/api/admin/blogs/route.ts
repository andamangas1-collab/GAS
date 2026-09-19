import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth-guard"
import { prisma } from "@/lib/prisma"
import { generateSlug } from "@/lib/utils"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    await requireAdmin()
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1", 10)
    const limit = parseInt(searchParams.get("limit") || "50", 10)
    const skip = (page - 1) * limit

    const [posts, total] = await Promise.all([
      prisma.blogPost.findMany({
        include: {
          author: {
            select: { email: true, role: true },
          },
          featuredProduct: {
            select: { name: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.blogPost.count(),
    ])

    return NextResponse.json({
      success: true,
      data: { posts, total, page, totalPages: Math.ceil(total / limit) },
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Unauthorized" },
      { status: error.status || 401 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAdmin()
    const body = await request.json()

    const {
      title,
      slug: customSlug,
      excerpt,
      content,
      coverImage,
      category,
      tags,
      readTimeMinutes,
      isPublished,
      featuredProductId,
      metaTitle,
      metaDescription,
    } = body

    if (!title || !excerpt || !content) {
      return NextResponse.json(
        { success: false, error: "Title, excerpt, and content are required." },
        { status: 400 }
      )
    }

    const slug = customSlug?.trim() ? generateSlug(customSlug) : generateSlug(title)

    // Ensure slug uniqueness
    const existing = await prisma.blogPost.findUnique({ where: { slug } })
    const finalSlug = existing ? `${slug}-${Date.now().toString().slice(-4)}` : slug

    const post = await prisma.blogPost.create({
      data: {
        title: title.trim(),
        slug: finalSlug,
        excerpt: excerpt.trim(),
        content: content.trim(),
        coverImage: coverImage || null,
        category: category || "Affiliate Marketing",
        tags: Array.isArray(tags) ? tags : [],
        readTimeMinutes: parseInt(readTimeMinutes || "5", 10),
        isPublished: isPublished !== false,
        featuredProductId: featuredProductId || null,
        authorId: session.user.id,
        metaTitle: metaTitle || title,
        metaDescription: metaDescription || excerpt,
        publishedAt: isPublished ? new Date() : new Date(),
      },
    })

    return NextResponse.json({ success: true, data: post }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create article" },
      { status: 500 }
    )
  }
}
