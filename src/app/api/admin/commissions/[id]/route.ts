import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { commissionService } from "@/lib/services/commission.service"
import { z } from "zod"

const updateCommissionSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED", "PAID", "CANCELLED"]),
  adminNote: z.string().optional(),
  rejectReason: z.string().optional(),
  payoutReference: z.string().optional(),
})

// PATCH /api/admin/commissions/[id] - Approve, reject, cancel or mark commission paid
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
    const validated = updateCommissionSchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validated.error.flatten() },
        { status: 400 }
      )
    }

    const { status, adminNote, rejectReason, payoutReference } = validated.data
    let updatedCommission = null

    if (status === "APPROVED") {
      updatedCommission = await commissionService.approveCommission({
        commissionId: id,
        adminId: session.user.id,
        adminNote,
      })
    } else if (status === "REJECTED") {
      updatedCommission = await commissionService.rejectCommission({
        commissionId: id,
        adminId: session.user.id,
        reason: rejectReason || adminNote || "Rejected by administrator",
        adminNote,
      })
    } else if (status === "PAID") {
      updatedCommission = await commissionService.markCommissionPaid({
        commissionId: id,
        adminId: session.user.id,
        payoutReference,
        adminNote,
      })
    } else if (status === "CANCELLED") {
      updatedCommission = await commissionService.cancelCommission({
        commissionId: id,
        adminId: session.user.id,
        reason: adminNote || "Cancelled by administrator",
      })
    }

    return NextResponse.json({ success: true, commission: updatedCommission })
  } catch (error: any) {
    console.error("[API_ADMIN_COMMISSION_PATCH_ERROR]", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}
