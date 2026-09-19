import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { commissionService } from "@/lib/services/commission.service"
import { z } from "zod"

const updateOrderSchema = z.object({
  status: z.enum(["PENDING", "PAID", "CANCELLED", "REFUNDED", "COMPLETED"]),
  adminNote: z.string().optional(),
})

// GET /api/admin/orders/[id] - Detailed order dossier
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Admin authorization required" }, { status: 403 })
    }

    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            referralCode: true,
            status: true,
            profile: true,
          },
        },
        payment: true,
        items: {
          include: {
            product: true,
          },
        },
        referrals: {
          include: {
            referrer: {
              select: {
                id: true,
                email: true,
                referralCode: true,
                profile: true,
              },
            },
          },
        },
        commissions: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                referralCode: true,
              },
            },
          },
        },
      },
    })

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Also fetch audit history for this order
    const auditLogs = await prisma.auditLog.findMany({
      where: { resource: "Order", resourceId: order.id },
      orderBy: { createdAt: "desc" },
      take: 10,
    })

    return NextResponse.json({ success: true, order, auditLogs })
  } catch (error) {
    console.error("[API_ADMIN_ORDER_GET_ERROR]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PATCH /api/admin/orders/[id] - Update order status (with audit logging and commission adjustment)
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
    const validated = updateOrderSchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validated.error.flatten() },
        { status: 400 }
      )
    }

    const currentOrder = await prisma.order.findUnique({
      where: { id },
      include: { payment: true, commissions: true },
    })

    if (!currentOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    const newStatus = validated.data.status

    const updated = await prisma.$transaction(async (tx) => {
      const orderRes = await tx.order.update({
        where: { id },
        data: {
          status: newStatus,
        },
      })

      // If refunded, update payment status if present
      if (newStatus === "REFUNDED" && currentOrder.payment) {
        await tx.payment.update({
          where: { id: currentOrder.payment.id },
          data: { status: "REFUNDED" },
        })
      }

      // Record audit log
      await tx.auditLog.create({
        data: {
          userId: session.user.id,
          action: "UPDATE_ORDER_STATUS",
          resource: "Order",
          resourceId: currentOrder.id,
          oldValues: {
            status: currentOrder.status,
          },
          newValues: {
            status: newStatus,
            adminNote: validated.data.adminNote,
          },
        },
      })

      return orderRes
    })

    // If order was cancelled or refunded, revoke associated commissions
    if (newStatus === "CANCELLED" || newStatus === "REFUNDED") {
      try {
        await commissionService.handleRefund({
          orderId: id,
          adminId: session.user.id,
          reason: `Order #${id.slice(-8)} transitioned to ${newStatus}. Note: ${validated.data.adminNote || "Administrative action"}`,
        })
      } catch (e) {
        console.error(`Failed to cancel commissions for order ${id}:`, e)
      }
    }

    return NextResponse.json({ success: true, order: updated })
  } catch (error) {
    console.error("[API_ADMIN_ORDER_PATCH_ERROR]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
