import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const search = searchParams.get("search")
    const page = parseInt(searchParams.get("page") || "1", 10)
    const limit = parseInt(searchParams.get("limit") || "9", 10)
    const skip = (page - 1) * limit

    const where: any = {
      isPublished: true,
    }

    if (category && category !== "All") {
      where.category = category
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { excerpt: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
      ]
    }

    const [posts, total, categoriesRaw] = await Promise.all([
      prisma.blogPost.findMany({
        where,
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
        skip,
        take: limit,
      }),
      prisma.blogPost.count({ where }),
      prisma.blogPost.findMany({
        where: { isPublished: true },
        select: { category: true },
        distinct: ["category"],
      }),
    ])

    const categories = ["All", ...categoriesRaw.map((c) => c.category)]

    return NextResponse.json({
      success: true,
      data: {
        posts,
        total,
        page,
        totalPages: Math.ceil(total / limit),
        categories,
      },
    })
  } catch (error: any) {
    console.error("[API_BLOGS_GET_ERROR]", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch articles" },
      { status: 500 }
    )
  }
}
