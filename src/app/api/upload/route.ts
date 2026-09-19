import { requireAdmin } from "@/lib/auth-guard"
import { ok, errors, handleApiError } from "@/lib/api-response"
import path from "path"
import fs from "fs"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    await requireAdmin()
    const formData = await request.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return errors.badRequest("No file uploaded")
    }

    // Allowed image mime types
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"]
    if (!allowedTypes.includes(file.type)) {
      return errors.badRequest("Invalid file type. Only JPEG, PNG, WEBP, and GIF are permitted.")
    }

    // File size limit: 5MB
    if (file.size > 5 * 1024 * 1024) {
      return errors.badRequest("File size exceeds maximum 5MB limit.")
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const uploadsDir = path.join(process.cwd(), "public", "uploads")
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true })
    }

    const ext = path.extname(file.name) || ".jpg"
    const filename = `product_${Date.now()}_${Math.random().toString(36).substring(2, 8)}${ext}`
    const filepath = path.join(uploadsDir, filename)

    fs.writeFileSync(filepath, buffer)

    const publicUrl = `/uploads/${filename}`
    return ok({ url: publicUrl, filename, size: file.size })
  } catch (error) {
    return handleApiError(error, "POST /api/upload")
  }
}
