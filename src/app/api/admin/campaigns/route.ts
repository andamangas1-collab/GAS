import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

export const dynamic = "force-dynamic"

const createCampaignSchema = z.object({
  name: z.string().min(2, "Campaign name is required"),
  description: z.string().optional(),
  startDate: z.string().or(z.date()),
  endDate: z.string().or(z.date()),
  isActive: z.boolean().default(true),
  productIds: z.array(z.string()).optional(),
})

// GET /api/admin/campaigns - List campaigns with filtering & search
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Admin authorization required" }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const search = searchParams.get("search")?.trim() || ""
    const status = searchParams.get("status") || "ALL"
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)))
    const skip = (page - 1) * limit

    const where: Record<string, any> = {}
    if (status === "ACTIVE") where.isActive = true
    if (status === "INACTIVE") where.isActive = false

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
      ]
    }

    const [total, campaigns] = await Promise.all([
      prisma.campaign.count({ where }),
      prisma.campaign.findMany({
        where,
        include: {
          products: {
            include: {
              product: {
                select: { id: true, name: true, price: true, category: true },
              },
            },
          },
          commissionRules: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
    ])

    return NextResponse.json({
      success: true,
      data: campaigns,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("[API_ADMIN_CAMPAIGNS_GET_ERROR]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST /api/admin/campaigns - Create a promotional campaign
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Admin authorization required" }, { status: 403 })
    }

    const body = await req.json()
    const validated = createCampaignSchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validated.error.flatten() },
        { status: 400 }
      )
    }

    const { name, description, startDate, endDate, isActive, productIds } = validated.data

    const campaign = await prisma.$transaction(async (tx) => {
      const created = await tx.campaign.create({
        data: {
          name,
          description,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          isActive,
          products: productIds && productIds.length > 0
            ? {
                create: productIds.map((pId) => ({
                  productId: pId,
                })),
              }
            : undefined,
        },
        include: {
          products: {
            include: { product: true },
          },
        },
      })

      // Record audit log
      await tx.auditLog.create({
        data: {
          userId: session.user.id,
          action: "CREATE_CAMPAIGN",
          resource: "Campaign",
          resourceId: created.id,
          newValues: {
            name: created.name,
            isActive: created.isActive,
            startDate: created.startDate,
            endDate: created.endDate,
            productCount: productIds?.length || 0,
          },
        },
      })

      return created
    })

    return NextResponse.json({ success: true, campaign }, { status: 201 })
  } catch (error) {
    console.error("[API_ADMIN_CAMPAIGNS_POST_ERROR]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
