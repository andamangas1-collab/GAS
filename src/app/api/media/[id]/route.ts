import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    if (!id) {
      return new NextResponse("Image ID is required", { status: 400 })
    }

    const asset = await prisma.mediaAsset.findUnique({
      where: { id },
    })

    if (!asset) {
      return new NextResponse("Image not found", { status: 404 })
    }

    // Convert stored binary data to Uint8Array/Buffer
    const body = Buffer.from(asset.data)

    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": asset.mimeType || "image/jpeg",
        "Content-Length": asset.size ? asset.size.toString() : body.length.toString(),
        "Content-Disposition": `inline; filename="${asset.filename || "image.jpg"}"`,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    })
  } catch (error: any) {
    console.error("[API_MEDIA_GET_ERROR]", error)
    return new NextResponse("Failed to load image", { status: 500 })
  }
}
