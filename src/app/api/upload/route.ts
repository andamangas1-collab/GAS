import { requireAdmin } from "@/lib/auth-guard"
import { ok, errors, handleApiError } from "@/lib/api-response"
import path from "path"
import fs from "fs"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    await requireAdmin()
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
      return errors.badRequest("No file uploaded")
    }

    // Allowed image mime types
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"]
    const uploadsDir = path.join(process.cwd(), "public", "uploads")
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true })
    }

    const uploadedResults: Array<{ url: string; filename: string; size: number }> = []

    for (const file of validFiles) {
      if (!allowedTypes.includes(file.type)) {
        return errors.badRequest(
          `Invalid file type (${file.type}). Only JPEG, PNG, WEBP, GIF, and SVG are permitted.`
        )
      }

      // File size limit: 10MB per image
      if (file.size > 10 * 1024 * 1024) {
        return errors.badRequest(`File ${file.name} exceeds maximum 10MB limit.`)
      }

      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      const ext = path.extname(file.name) || ".jpg"
      const filename = `media_${Date.now()}_${Math.random().toString(36).substring(2, 8)}${ext}`
      const filepath = path.join(uploadsDir, filename)

      fs.writeFileSync(filepath, buffer)
      const publicUrl = `/uploads/${filename}`
      uploadedResults.push({ url: publicUrl, filename, size: file.size })
    }

    return ok({
      files: uploadedResults,
      urls: uploadedResults.map((u) => u.url),
      // Backwards-compatibility for callers expecting single { url, filename, size }
      url: uploadedResults[0]?.url,
      filename: uploadedResults[0]?.filename,
      size: uploadedResults[0]?.size,
    })
  } catch (error) {
    return handleApiError(error, "POST /api/upload")
  }
}
