import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const updateReferralSchema = z.object({
  status: z.enum(["CLICKED", "REGISTERED", "PURCHASED", "QUALIFIED", "REJECTED"]).optional(),
  isFlagged: z.boolean().optional(),
  flagReason: z.string().optional(),
  adminNote: z.string().optional(),
})

// GET /api/admin/referrals/[id] - Detailed referral dossier
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Admin authorization required" }, { status: 403 })
    }

    const referral = await prisma.referral.findUnique({
      where: { id: params.id },
      include: {
        referrer: {
          select: {
            id: true,
            email: true,
            referralCode: true,
            status: true,
            profile: true,
          },
        },
        referred: {
          select: {
            id: true,
            email: true,
            status: true,
            createdAt: true,
            profile: true,
          },
        },
        order: {
          include: {
            payment: true,
            items: {
              include: { product: true },
            },
          },
        },
        commissions: true,
      },
    })

    if (!referral) {
      return NextResponse.json({ error: "Referral not found" }, { status: 404 })
    }

    const auditLogs = await prisma.auditLog.findMany({
      where: { resource: "Referral", resourceId: referral.id },
      orderBy: { createdAt: "desc" },
      take: 10,
    })

    return NextResponse.json({ success: true, referral, auditLogs })
  } catch (error) {
    console.error("[API_ADMIN_REFERRAL_GET_ERROR]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PATCH /api/admin/referrals/[id] - Update referral status / anti-fraud flags
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
    const validated = updateReferralSchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validated.error.flatten() },
        { status: 400 }
      )
    }

    const currentReferral = await prisma.referral.findUnique({
      where: { id },
    })

    if (!currentReferral) {
      return NextResponse.json({ error: "Referral not found" }, { status: 404 })
    }

    const updated = await prisma.$transaction(async (tx) => {
      const referralRes = await tx.referral.update({
        where: { id },
        data: {
          status: validated.data.status || undefined,
          isFlagged: validated.data.isFlagged !== undefined ? validated.data.isFlagged : undefined,
          flagReason: validated.data.flagReason !== undefined ? validated.data.flagReason : undefined,
          qualifiedAt: validated.data.status === "QUALIFIED" && !currentReferral.qualifiedAt ? new Date() : undefined,
        },
      })

      // Record audit log
      await tx.auditLog.create({
        data: {
          userId: session.user.id,
          action: "UPDATE_REFERRAL_STATUS",
          resource: "Referral",
          resourceId: currentReferral.id,
          oldValues: {
            status: currentReferral.status,
            isFlagged: currentReferral.isFlagged,
            flagReason: currentReferral.flagReason,
          },
          newValues: {
            status: validated.data.status || currentReferral.status,
            isFlagged: validated.data.isFlagged !== undefined ? validated.data.isFlagged : currentReferral.isFlagged,
            flagReason: validated.data.flagReason !== undefined ? validated.data.flagReason : currentReferral.flagReason,
            adminNote: validated.data.adminNote,
          },
        },
      })

      return referralRes
    })

    return NextResponse.json({ success: true, referral: updated })
  } catch (error) {
    console.error("[API_ADMIN_REFERRAL_PATCH_ERROR]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
