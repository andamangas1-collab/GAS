import { requireAdmin } from "@/lib/auth-guard"
import { prisma } from "@/lib/prisma"
import { ok, created, handleApiError, paginated } from "@/lib/api-response"
import { createProductSchema } from "@/lib/validations/product"
import { generateSlug } from "@/lib/utils"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""
    const category = searchParams.get("category") || ""
    const status = searchParams.get("status") || "ACTIVE"
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)))
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}
    if (status !== "ALL") {
      where.status = status
    }
    if (category) {
      where.category = category
    }
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
      ]
    }

    const [total, products] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        include: {
          commissionRules: { where: { isActive: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
    ])

    return paginated(products, total, page, limit)
  } catch (error) {
    return handleApiError(error, "GET /api/products")
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireAdmin()
    const body = await request.json()
    const validated = createProductSchema.parse(body)

    let slug = generateSlug(validated.name)
    let exists = await prisma.product.findUnique({ where: { slug } })
    let count = 1
    while (exists) {
      slug = `${generateSlug(validated.name)}-${count}`
      exists = await prisma.product.findUnique({ where: { slug } })
      count++
    }

    const product = await prisma.$transaction(async (tx) => {
      const p = await tx.product.create({
        data: {
          name: validated.name,
          slug,
          description: validated.description,
          category: validated.category,
          price: validated.price,
          imageUrl: validated.imageUrl || null,
          status: validated.status,
          startDate: validated.startDate || null,
          endDate: validated.endDate || null,
        },
      })

      // Create linked commission rule
      await tx.commissionRule.create({
        data: {
          name: `Commission for ${p.name}`,
          productId: p.id,
          type: validated.commissionType,
          value: validated.commissionValue,
          isActive: true,
        },
      })

      // Audit Log
      await tx.auditLog.create({
        data: {
          userId: session.user.id,
          action: "CREATE_PRODUCT",
          resource: "products",
          resourceId: p.id,
          newValues: {
            name: p.name,
            price: p.price,
            status: p.status,
            commissionType: validated.commissionType,
            commissionValue: validated.commissionValue,
          },
        },
      })

      return p
    })

    return created(product)
  } catch (error) {
    return handleApiError(error, "POST /api/products")
  }
}
