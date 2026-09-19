import { requireAdmin } from "@/lib/auth-guard"
import { prisma } from "@/lib/prisma"
import { ok, handleApiError, errors, noContent } from "@/lib/api-response"
import { updateProductSchema } from "@/lib/validations/product"

export const dynamic = "force-dynamic"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: {
        commissionRules: { where: { isActive: true } },
      },
    })

    if (!product) {
      return errors.notFound("Product")
    }

    return ok(product)
  } catch (error) {
    return handleApiError(error, "GET /api/products/[id]")
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await requireAdmin()
    const body = await request.json()
    const validated = updateProductSchema.parse(body)

    const existing = await prisma.product.findUnique({
      where: { id: params.id },
      include: { commissionRules: true },
    })

    if (!existing) {
      return errors.notFound("Product")
    }

    const updated = await prisma.$transaction(async (tx) => {
      const p = await tx.product.update({
        where: { id: params.id },
        data: {
          name: validated.name,
          description: validated.description,
          category: validated.category,
          price: validated.price,
          imageUrl: validated.imageUrl !== undefined ? validated.imageUrl : undefined,
          status: validated.status,
          startDate: validated.startDate !== undefined ? validated.startDate : undefined,
          endDate: validated.endDate !== undefined ? validated.endDate : undefined,
        },
      })

      // Update or create commission rule if provided
      if (validated.commissionType || validated.commissionValue !== undefined) {
        const activeRule = existing.commissionRules.find((r) => r.isActive)
        if (activeRule) {
          await tx.commissionRule.update({
            where: { id: activeRule.id },
            data: {
              type: validated.commissionType || activeRule.type,
              value: validated.commissionValue !== undefined ? validated.commissionValue : activeRule.value,
            },
          })
        } else {
          await tx.commissionRule.create({
            data: {
              name: `Commission for ${p.name}`,
              productId: p.id,
              type: validated.commissionType || "PERCENTAGE",
              value: validated.commissionValue || 10,
              isActive: true,
            },
          })
        }
      }

      // Record Audit Log
      await tx.auditLog.create({
        data: {
          userId: session.user.id,
          action: "UPDATE_PRODUCT",
          resource: "products",
          resourceId: p.id,
          oldValues: { name: existing.name, status: existing.status, price: existing.price },
          newValues: validated,
        },
      })

      return p
    })

    return ok(updated)
  } catch (error) {
    return handleApiError(error, "PUT /api/products/[id]")
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await requireAdmin()
    const existing = await prisma.product.findUnique({ where: { id: params.id } })

    if (!existing) {
      return errors.notFound("Product")
    }

    // Soft delete / archive status to maintain referential integrity
    await prisma.$transaction(async (tx) => {
      await tx.product.update({
        where: { id: params.id },
        data: { status: "INACTIVE" },
      })

      await tx.auditLog.create({
        data: {
          userId: session.user.id,
          action: "ARCHIVE_PRODUCT",
          resource: "products",
          resourceId: params.id,
          newValues: { status: "INACTIVE" },
        },
      })
    })

    return ok({ message: "Product archived successfully", id: params.id })
  } catch (error) {
    return handleApiError(error, "DELETE /api/products/[id]")
  }
}
