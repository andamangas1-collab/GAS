import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const reviewSchema = z.object({
  status: z.enum(["UNDER_REVIEW", "APPROVED", "REJECTED"]),
  adminNote: z.string().optional(),
  pointsAwarded: z.number().int().min(0).max(1000).optional(),
  recognitionLevel: z.string().optional(),
})

// PATCH /api/admin/contributions/[id] - Review, approve, or reject contribution
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Admin authorization required" }, { status: 403 })
    }

    const { id } = params
    const body = await req.json()
    const validated = reviewSchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validated.error.flatten() },
        { status: 400 }
      )
    }

    const contribution = await prisma.contribution.findUnique({
      where: { id },
      include: { user: true },
    })

    if (!contribution) {
      return NextResponse.json({ error: "Contribution not found" }, { status: 404 })
    }

    const { status, adminNote, pointsAwarded, recognitionLevel } = validated.data

    // Determine points to award if approving
    let finalPoints = 0
    if (status === "APPROVED") {
      if (typeof pointsAwarded === "number" && pointsAwarded >= 0) {
        finalPoints = pointsAwarded
      } else {
        const actionType = contribution.category === "IDEA" ? "IDEA_APPROVED" : "CONTRIBUTION_APPROVED"
        const defaultRule = await prisma.pointRule.findUnique({
          where: { action: actionType },
        })
        finalPoints = defaultRule?.points || (contribution.category === "IDEA" ? 50 : 25)
      }
    }

    const updated = await prisma.$transaction(async (tx) => {
      let evaluatedLevel: string | null = null

      // If approved, calculate recognition standing
      if (status === "APPROVED") {
        // 1. Calculate existing points
        const pointsAgg = await tx.recognitionPoint.aggregate({
          where: { userId: contribution.userId },
          _sum: { points: true },
        })
        const currentTotal = pointsAgg._sum.points || 0
        const newTotal = currentTotal + finalPoints

        // 2. Determine recognition level
        if (recognitionLevel && recognitionLevel.trim() !== "") {
          evaluatedLevel = recognitionLevel.trim()
        } else {
          const matchedLevel = await tx.recognitionLevel.findFirst({
            where: {
              minPoints: { lte: newTotal },
              OR: [
                { maxPoints: { gte: newTotal } },
                { maxPoints: null },
              ],
            },
            orderBy: { minPoints: "desc" },
          })
          evaluatedLevel = matchedLevel?.name || "Explorer"
        }

        // 3. Award recognition points
        if (finalPoints > 0) {
          const actionType = contribution.category === "IDEA" ? "IDEA_APPROVED" : "CONTRIBUTION_APPROVED"
          await tx.recognitionPoint.create({
            data: {
              userId: contribution.userId,
              points: finalPoints,
              action: actionType,
              referenceId: contribution.id,
              note: `Points awarded for verified contribution: ${contribution.title}`,
            },
          })
        }

        // 4. Check & award "V2V Contributor" badge if eligible
        const v2vBadge = await tx.badge.findUnique({
          where: { name: "V2V Contributor" },
        })
        if (v2vBadge) {
          const alreadyEarned = await tx.userBadge.findUnique({
            where: {
              userId_badgeId: {
                userId: contribution.userId,
                badgeId: v2vBadge.id,
              },
            },
          })
          if (!alreadyEarned) {
            await tx.userBadge.create({
              data: {
                userId: contribution.userId,
                badgeId: v2vBadge.id,
              },
            })

            await tx.notification.create({
              data: {
                userId: contribution.userId,
                type: "BADGE_EARNED",
                title: "New Badge Unlocked!",
                message: `Congratulations! You unlocked the "${v2vBadge.name}" badge for your community value contribution.`,
              },
            })
          }
        }

        // 5. Notify contributor of approval and points
        await tx.notification.create({
          data: {
            userId: contribution.userId,
            type: "CONTRIBUTION_APPROVED",
            title: "Value Contribution Approved!",
            message: `Your contribution "${contribution.title}" was approved! You earned +${finalPoints} Recognition Points. Current Level: ${evaluatedLevel}.`,
          },
        })
      } else if (status === "REJECTED") {
        await tx.notification.create({
          data: {
            userId: contribution.userId,
            type: "CONTRIBUTION_REJECTED",
            title: "Contribution Status Update",
            message: `Your contribution "${contribution.title}" was reviewed. Admin feedback: ${adminNote || "Does not meet current guidelines."}`,
          },
        })
      } else if (status === "UNDER_REVIEW") {
        await tx.notification.create({
          data: {
            userId: contribution.userId,
            type: "SYSTEM",
            title: "Contribution Under Review",
            message: `Your contribution "${contribution.title}" is now under review by the GAS™ editorial team.`,
          },
        })
      }

      // Update the contribution record
      const res = await tx.contribution.update({
        where: { id },
        data: {
          status,
          adminNote: adminNote || null,
          pointsAwarded: status === "APPROVED" ? finalPoints : null,
          recognitionLevel: evaluatedLevel,
          reviewedBy: session.user.id,
          reviewedAt: new Date(),
        },
      })

      // Record audit log
      await tx.auditLog.create({
        data: {
          userId: session.user.id,
          action: "REVIEW_CONTRIBUTION",
          resource: "Contribution",
          resourceId: contribution.id,
          oldValues: {
            status: contribution.status,
            pointsAwarded: contribution.pointsAwarded,
          },
          newValues: {
            status,
            pointsAwarded: status === "APPROVED" ? finalPoints : null,
            recognitionLevel: evaluatedLevel,
            adminNote,
          },
        },
      })

      return res
    })

    return NextResponse.json({ success: true, contribution: updated })
  } catch (error) {
    console.error("[API_ADMIN_CONTRIBUTIONS_PATCH_ERROR]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
