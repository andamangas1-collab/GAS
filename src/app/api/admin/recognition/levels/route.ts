import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { RecognitionService } from "@/lib/services/recognition.service"
import { z } from "zod"

export const dynamic = "force-dynamic"

const updateLevelSchema = z.object({
  id: z.string(),
  minPoints: z.number().int().min(0),
  maxPoints: z.number().int().min(1).nullable().optional(),
  description: z.string().optional().nullable(),
})

// GET /api/admin/recognition/levels - Admin view of recognition tiers
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Admin authorization required" }, { status: 403 })
    }

    const levels = await RecognitionService.getRecognitionLevels()
    return NextResponse.json({ success: true, levels })
  } catch (error) {
    console.error("[API_ADMIN_LEVELS_GET_ERROR]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PATCH /api/admin/recognition/levels - Admin configure level thresholds
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Admin authorization required" }, { status: 403 })
    }

    const body = await req.json()
    const validated = updateLevelSchema.safeParse(body)
    if (!validated.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validated.error.flatten() },
        { status: 400 }
      )
    }

    const updated = await RecognitionService.updateRecognitionLevel({
      id: validated.data.id,
      minPoints: validated.data.minPoints,
      maxPoints: validated.data.maxPoints,
      description: validated.data.description,
      adminUserId: session.user.id,
    })

    return NextResponse.json({ success: true, level: updated })
  } catch (error) {
    console.error("[API_ADMIN_LEVELS_PATCH_ERROR]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
