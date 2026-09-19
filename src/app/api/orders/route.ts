import { requireAuth } from "@/lib/auth-guard"
import { prisma } from "@/lib/prisma"
import { created, errors, handleApiError } from "@/lib/api-response"
import { paymentGateway } from "@/lib/payment-gateway"
import { z } from "zod"

export const dynamic = "force-dynamic"

const createOrderSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  quantity: z.coerce.number().int().positive().default(1),
  notes: z.string().max(500).optional(),
})

export async function POST(request: Request) {
  try {
    const session = await requireAuth()
    const body = await request.json()
    const validated = createOrderSchema.parse(body)

    // CRITICAL SECURITY RULE: Calculate prices STRICTLY server-side
    const product = await prisma.product.findUnique({
      where: { id: validated.productId },
      include: {
        commissionRules: { where: { isActive: true } },
      },
    })

    if (!product || product.status !== "ACTIVE") {
      return errors.badRequest("Selected product is not available for purchase")
    }

    const pricePerUnit = Number(product.price)
    const totalAmount = pricePerUnit * validated.quantity

    // Check for existing pending order for this user & product in last 10 minutes to prevent duplicate spam
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000)
    const existingPending = await prisma.order.findFirst({
      where: {
        userId: session.user.id,
        status: "PENDING",
        createdAt: { gte: tenMinutesAgo },
        items: { some: { productId: product.id } },
      },
      include: { payment: true, items: true },
    })

    if (existingPending && existingPending.payment) {
      return created({
        orderId: existingPending.id,
        totalAmount: Number(existingPending.totalAmount),
        currency: "INR",
        razorpayOrderId: existingPending.payment.razorpayOrderId,
        status: existingPending.status,
      })
    }

    // Generate gateway order
    const receipt = `rcpt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`
    const gatewayOrder = await paymentGateway.createOrder(totalAmount, receipt)

    // Create Order + OrderItem + Payment in an atomic database transaction
    const orderRecord = await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          userId: session.user.id,
          totalAmount: totalAmount,
          status: "PENDING",
          notes: validated.notes || null,
          items: {
            create: {
              productId: product.id,
              quantity: validated.quantity,
              price: pricePerUnit,
            },
          },
          payment: {
            create: {
              razorpayOrderId: gatewayOrder.id,
              amount: totalAmount,
              currency: "INR",
              status: "CREATED",
            },
          },
        },
        include: {
          payment: true,
          items: true,
        },
      })

      // Telemetry log
      await tx.activityLog.create({
        data: {
          userId: session.user.id,
          event: "ORDER_INITIATED",
          entityType: "order",
          entityId: order.id,
          metadata: { totalAmount, productId: product.id },
        },
      })

      return order
    })

    return created({
      orderId: orderRecord.id,
      totalAmount: Number(orderRecord.totalAmount),
      currency: "INR",
      razorpayOrderId: orderRecord.payment?.razorpayOrderId,
      status: orderRecord.status,
    })
  } catch (error) {
    return handleApiError(error, "POST /api/orders")
  }
}
