import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { RecognitionService } from "@/lib/services/recognition.service"
import { RecognitionAction } from "@prisma/client"
import { z } from "zod"

export const dynamic = "force-dynamic"

const awardSchema = z.object({
  userId: z.string().min(1, "Recipient user ID is required"),
  points: z.number().int().min(1).max(1000),
  action: z.nativeEnum(RecognitionAction).default("COMMUNITY_PARTICIPATION"),
  note: z.string().min(5, "Mandatory admin note required (min 5 characters)"),
})

// POST /api/admin/recognition/award - Admin manually award merit points
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Admin authorization required" }, { status: 403 })
    }

    const body = await req.json()
    const validated = awardSchema.safeParse(body)
    if (!validated.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validated.error.flatten() },
        { status: 400 }
      )
    }

    const result = await RecognitionService.awardPoints({
      userId: validated.data.userId,
      action: validated.data.action,
      points: validated.data.points,
      note: `Admin Award: ${validated.data.note}`,
      adminUserId: session.user.id,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("[API_ADMIN_AWARD_POST_ERROR]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
