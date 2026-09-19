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
    const platform = body.platform || "unknown"

    const post = await prisma.blogPost.findUnique({
      where: { slug },
      select: { id: true },
    })

    if (!post) {
      return NextResponse.json({ success: false, error: "Post not found" }, { status: 404 })
    }

    const session = await getServerSession(authOptions)
    const userId = session?.user?.id || null

    // Record share log & increment share count in transaction
    await prisma.$transaction([
      prisma.blogPost.update({
        where: { id: post.id },
        data: { shareCount: { increment: 1 } },
      }),
      prisma.blogShareLog.create({
        data: {
          postId: post.id,
          userId,
          platform,
        },
      }),
    ])

    return NextResponse.json({ success: true, message: "Share recorded" })
  } catch (error: any) {
    console.error("[API_BLOG_SHARE_ERROR]", error)
    return NextResponse.json({ success: false, error: "Failed to record share" }, { status: 500 })
  }
}
