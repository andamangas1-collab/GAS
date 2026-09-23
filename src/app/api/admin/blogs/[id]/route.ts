import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth-guard"
import { prisma } from "@/lib/prisma"

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin()
    const { id } = params
    const body = await request.json()

    const updated = await prisma.blogPost.update({
      where: { id },
      data: {
        title: body.title,
        excerpt: body.excerpt,
        content: body.content,
        coverImage: body.coverImage,
        images: Array.isArray(body.images) ? body.images : undefined,
        socialLinks: body.socialLinks !== undefined ? body.socialLinks : undefined,
        category: body.category,
        tags: body.tags,
        readTimeMinutes: body.readTimeMinutes ? parseInt(body.readTimeMinutes, 10) : undefined,
        isPublished: body.isPublished,
        featuredProductId: body.featuredProductId || null,
        metaTitle: body.metaTitle,
        metaDescription: body.metaDescription,
        publishedAt: body.isPublished ? new Date() : undefined,
      },
    })

    return NextResponse.json({ success: true, data: updated })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update article" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin()
    const { id } = params

    await prisma.blogPost.delete({
      where: { id },
    })

    return NextResponse.json({ success: true, message: "Article deleted successfully" })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete article" },
      { status: 500 }
    )
  }
}
