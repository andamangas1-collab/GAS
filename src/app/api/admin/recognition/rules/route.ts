import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { RecognitionService } from "@/lib/services/recognition.service"
import { RecognitionAction } from "@prisma/client"
import { z } from "zod"

export const dynamic = "force-dynamic"

const updateRuleSchema = z.object({
  action: z.nativeEnum(RecognitionAction),
  points: z.number().int().min(0).max(500),
  isActive: z.boolean(),
})

// GET /api/admin/recognition/rules - Admin view of all point rules
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Admin authorization required" }, { status: 403 })
    }

    const rules = await RecognitionService.getPointRules()
    return NextResponse.json({ success: true, rules })
  } catch (error) {
    console.error("[API_ADMIN_RULES_GET_ERROR]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PATCH /api/admin/recognition/rules - Admin configure point rule
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Admin authorization required" }, { status: 403 })
    }

    const body = await req.json()
    const validated = updateRuleSchema.safeParse(body)
    if (!validated.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validated.error.flatten() },
        { status: 400 }
      )
    }

    const updated = await RecognitionService.updatePointRule({
      action: validated.data.action,
      points: validated.data.points,
      isActive: validated.data.isActive,
      adminUserId: session.user.id,
    })

    return NextResponse.json({ success: true, rule: updated })
  } catch (error) {
    console.error("[API_ADMIN_RULES_PATCH_ERROR]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
