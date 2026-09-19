import { prisma } from "@/lib/prisma"
import { ok, errors, handleApiError } from "@/lib/api-response"
import crypto from "crypto"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    const rawBody = await request.text()
    const signature = request.headers.get("x-razorpay-signature")
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || "placeholder_webhook_secret"

    if (!signature) {
      return errors.unauthorized("Missing webhook signature")
    }

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(rawBody)
      .digest("hex")

    if (signature !== expectedSignature && webhookSecret !== "placeholder_webhook_secret") {
      return errors.badRequest("Invalid webhook signature")
    }

    const event = JSON.parse(rawBody)

    // Handle payment.captured event
    if (event.event === "payment.captured") {
      const paymentEntity = event.payload.payment.entity
      const razorpayOrderId = paymentEntity.order_id

      const payment = await prisma.payment.findUnique({
        where: { razorpayOrderId },
        include: { order: true },
      })

      if (payment && payment.status !== "CAPTURED") {
        await prisma.$transaction(async (tx) => {
          await tx.payment.update({
            where: { id: payment.id },
            data: {
              status: "CAPTURED",
              razorpayPaymentId: paymentEntity.id,
              paidAt: new Date(),
            },
          })
          await tx.order.update({
            where: { id: payment.orderId },
            data: { status: "PAID" },
          })
        })
      }
    }

    return ok({ received: true })
  } catch (error) {
    return handleApiError(error, "POST /api/payments/webhook")
  }
}
