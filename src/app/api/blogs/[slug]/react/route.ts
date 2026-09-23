import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params
    const body = await request.json().catch(() => ({}))
    const type = typeof body.type === "string" ? body.type.toUpperCase() : "CLAP"
    const count = Math.min(50, Math.max(1, parseInt(body.count || "1", 10)))

    const post = await prisma.blogPost.findUnique({
      where: { slug },
      select: { id: true, clapCount: true },
    })

    if (!post) {
      return NextResponse.json({ success: false, error: "Post not found" }, { status: 404 })
    }

    const session = await getServerSession(authOptions)
    const userId = session?.user?.id || null
    const ipAddress =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      null

    // Increment clap count on post and log reaction
    const [updatedPost] = await prisma.$transaction([
      prisma.blogPost.update({
        where: { id: post.id },
        data: { clapCount: { increment: count } },
        select: { clapCount: true },
      }),
      prisma.blogReaction.create({
        data: {
          postId: post.id,
          userId,
          ipAddress,
          type,
          count,
        },
      }),
    ])

    return NextResponse.json({
      success: true,
      clapCount: updatedPost.clapCount,
      message: "Reaction recorded",
    })
  } catch (error: any) {
    console.error("[API_BLOG_REACT_ERROR]", error)
    return NextResponse.json(
      { success: false, error: "Failed to record reaction" },
      { status: 500 }
    )
  }
}
