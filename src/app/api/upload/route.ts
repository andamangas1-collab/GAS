import { requireAdmin } from "@/lib/auth-guard"
import { ok, errors } from "@/lib/api-response"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    // 1. Authenticate admin user
    await requireAdmin()

    // 2. Parse multipart form data
    const formData = await request.formData()

    // Collect all files from "files" or "file" form entries
    const rawFiles: File[] = []
    const filesEntries = formData.getAll("files") as File[]
    const fileEntries = formData.getAll("file") as File[]

    rawFiles.push(...filesEntries, ...fileEntries)

    // Filter out null or non-File entries
    const validFiles = rawFiles.filter(
      (f) => f && typeof f === "object" && typeof f.size === "number" && f.size > 0
    )

    if (validFiles.length === 0) {
      return errors.badRequest("No image files received")
    }

    // Allowed image mime types
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/gif",
      "image/svg+xml",
    ]

    const uploadedResults: Array<{ url: string; filename: string; size: number }> = []

    for (const file of validFiles) {
      if (!allowedTypes.includes(file.type.toLowerCase())) {
        return errors.badRequest(
          `Invalid file type (${file.type}). Only JPEG, PNG, WEBP, GIF, and SVG are permitted.`
        )
      }

      // File size limit: 10MB per image
      if (file.size > 10 * 1024 * 1024) {
        return errors.badRequest(`File "${file.name}" exceeds the maximum 10MB limit.`)
      }

      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      // Store in PostgreSQL database for 100% serverless / Netlify persistence
      const asset = await prisma.mediaAsset.create({
        data: {
          filename: file.name || `image_${Date.now()}.jpg`,
          mimeType: file.type || "image/jpeg",
          size: file.size,
          data: buffer,
        },
      })

      const publicUrl = `/api/media/${asset.id}`
      uploadedResults.push({
        url: publicUrl,
        filename: asset.filename,
        size: asset.size,
      })
    }

    return ok({
      files: uploadedResults,
      urls: uploadedResults.map((u) => u.url),
      // Backwards-compatibility for callers expecting single { url, filename, size }
      url: uploadedResults[0]?.url,
      filename: uploadedResults[0]?.filename,
      size: uploadedResults[0]?.size,
    })
  } catch (error: any) {
    console.error("[API_UPLOAD_ERROR]", error)
    return errors.badRequest(error?.message || "Image upload failed. Please try again.")
  }
}
