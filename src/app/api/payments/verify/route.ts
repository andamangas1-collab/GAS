import { requireAuth } from "@/lib/auth-guard"
import { prisma } from "@/lib/prisma"
import { ok, errors, handleApiError } from "@/lib/api-response"
import { paymentGateway } from "@/lib/payment-gateway"
import { commissionService } from "@/lib/services/commission.service"
import { logger } from "@/lib/logger"
import { z } from "zod"

export const dynamic = "force-dynamic"

const verifyPaymentSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
  razorpayOrderId: z.string().min(1, "Razorpay Order ID is required"),
  razorpayPaymentId: z.string().min(1, "Razorpay Payment ID is required"),
  razorpaySignature: z.string().min(1, "Razorpay Signature is required"),
})

export async function POST(request: Request) {
  try {
    const session = await requireAuth()
    const body = await request.json()
    const validated = verifyPaymentSchema.parse(body)

    // 1. Verify payment signature cryptographically
    const isValid = paymentGateway.verifySignature({
      orderId: validated.razorpayOrderId,
      paymentId: validated.razorpayPaymentId,
      signature: validated.razorpaySignature,
    })

    if (!isValid) {
      return errors.badRequest("Invalid payment signature verification failed")
    }

    // 2. Retrieve order with payment and user details
    const order = await prisma.order.findUnique({
      where: { id: validated.orderId },
      include: {
        payment: true,
        items: { include: { product: { include: { commissionRules: true } } } },
        user: true,
      },
    })

    if (!order) {
      return errors.notFound("Order")
    }

    // Ensure order belongs to current user
    if (order.userId !== session.user.id) {
      return errors.forbidden("You are not authorized to verify this order")
    }

    if (order.status === "PAID" || order.status === "COMPLETED") {
      return ok({ message: "Order already verified and confirmed", orderId: order.id, status: order.status })
    }

    // 3. Execute atomic transaction for:
    // - Payment Captured
    // - Order Marked PAID
    // - Referral Qualification Check
    // - Commission Calculation from Dynamic CommissionRule
    // - Points Awarding & Notification
    const result = await prisma.$transaction(async (tx) => {
      // Mark Payment Captured
      await tx.payment.update({
        where: { id: order.payment!.id },
        data: {
          status: "CAPTURED",
          razorpayPaymentId: validated.razorpayPaymentId,
          razorpaySignature: validated.razorpaySignature,
          paidAt: new Date(),
        },
      })

      // Mark Order Paid
      const updatedOrder = await tx.order.update({
        where: { id: order.id },
        data: { status: "PAID" },
      })

      // Check if this purchaser was referred by another user
      const referral = await tx.referral.findFirst({
        where: { referredId: order.userId },
        orderBy: { createdAt: "desc" },
      })

      let qualifiedReferral = null
      let createdCommission = null

      if (referral) {
        try {
          const primaryItem = order.items[0]
          const result = await commissionService.qualifyCommission({
            orderId: order.id,
            referralId: referral.id,
            referrerId: referral.referrerId,
            buyerId: order.userId,
            orderAmount: Number(order.totalAmount),
            productId: primaryItem?.productId,
            tx,
          })
          createdCommission = result.commission
          qualifiedReferral = await tx.referral.findUnique({ where: { id: referral.id } })
        } catch (err: any) {
          logger.warn("Commission qualification notice", { error: err.message, referralId: referral.id })
        }
      }

      // Award Purchase Points to Buyer
      await tx.recognitionPoint.create({
        data: {
          userId: order.userId,
          points: 10,
          action: "PURCHASE",
          referenceId: order.id,
          note: `Points earned for purchase order #${order.id.slice(-6)}`,
        },
      })

      // Buyer Notification
      await tx.notification.create({
        data: {
          userId: order.userId,
          type: "ORDER_CONFIRMED",
          title: "Order Confirmed!",
          message: `Thank you for your order #${order.id.slice(-6)}. Your payment of ?${Number(order.totalAmount).toFixed(2)} was received.`,
          data: { orderId: order.id },
        },
      })

      // Audit Log
      await tx.auditLog.create({
        data: {
          userId: session.user.id,
          action: "PAYMENT_CAPTURED",
          resource: "orders",
          resourceId: order.id,
          newValues: {
            status: "PAID",
            paymentId: validated.razorpayPaymentId,
            qualifiedReferralId: qualifiedReferral?.id || null,
            commissionId: createdCommission?.id || null,
          },
        },
      })

      return {
        order: updatedOrder,
        commission: createdCommission,
      }
    })

    return ok({
      message: "Payment verified successfully",
      orderId: result.order.id,
      status: result.order.status,
      commissionAllocated: Boolean(result.commission),
    })
  } catch (error) {
    return handleApiError(error, "POST /api/payments/verify")
  }
}
