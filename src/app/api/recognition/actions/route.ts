import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { RecognitionService } from "@/lib/services/recognition.service"
import { z } from "zod"

export const dynamic = "force-dynamic"

const actionSchema = z.object({
  action: z.enum(["LEARNING_COMPLETE", "PROFILE_COMPLETE", "COMMUNITY_PARTICIPATION"]),
  referenceId: z.string().optional(),
  note: z.string().optional(),
})

// POST /api/recognition/actions - Claim recognition points for completed actions
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const validated = actionSchema.safeParse(body)
    if (!validated.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validated.error.flatten() },
        { status: 400 }
      )
    }

    const { action, referenceId, note } = validated.data
    const userId = session.user.id

    // Deduplication checks
    if (action === "LEARNING_COMPLETE") {
      const existing = await prisma.recognitionPoint.findFirst({
        where: {
          userId,
          action: "LEARNING_COMPLETE",
          referenceId: referenceId || "global_learning",
        },
      })
      if (existing) {
        return NextResponse.json({
          success: true,
          message: "You have already completed this learning module and claimed points.",
          alreadyClaimed: true,
        })
      }
    } else if (action === "PROFILE_COMPLETE") {
      const existing = await prisma.recognitionPoint.findFirst({
        where: {
          userId,
          action: "PROFILE_COMPLETE",
        },
      })
      if (existing) {
        return NextResponse.json({
          success: true,
          message: "Profile completion reward already claimed.",
          alreadyClaimed: true,
        })
      }

      // Verify profile is complete
      const profile = await prisma.profile.findUnique({
        where: { userId },
      })
      if (!profile || !profile.isComplete) {
        return NextResponse.json(
          { error: "Profile is not complete. Please fill all required profile fields first." },
          { status: 400 }
        )
      }
    }

    const result = await RecognitionService.awardPoints({
      userId,
      action,
      referenceId: referenceId || null,
      note: note || `Claimed for ${action.replace(/_/g, " ").toLowerCase()}`,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("[API_RECOGNITION_ACTIONS_POST_ERROR]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
