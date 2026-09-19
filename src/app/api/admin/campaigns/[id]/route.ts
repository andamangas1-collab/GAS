import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const updateCampaignSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  startDate: z.string().or(z.date()).optional(),
  endDate: z.string().or(z.date()).optional(),
  isActive: z.boolean().optional(),
  productIds: z.array(z.string()).optional(),
  adminNote: z.string().optional(),
})

// GET /api/admin/campaigns/[id] - Campaign details
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Admin authorization required" }, { status: 403 })
    }

    const campaign = await prisma.campaign.findUnique({
      where: { id: params.id },
      include: {
        products: {
          include: {
            product: true,
          },
        },
        commissionRules: true,
      },
    })

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 })
    }

    const auditLogs = await prisma.auditLog.findMany({
      where: { resource: "Campaign", resourceId: campaign.id },
      orderBy: { createdAt: "desc" },
      take: 10,
    })

    return NextResponse.json({ success: true, campaign, auditLogs })
  } catch (error) {
    console.error("[API_ADMIN_CAMPAIGN_GET_ERROR]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PATCH /api/admin/campaigns/[id] - Update campaign
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
    const validated = updateCampaignSchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validated.error.flatten() },
        { status: 400 }
      )
    }

    const currentCampaign = await prisma.campaign.findUnique({
      where: { id },
      include: { products: true },
    })

    if (!currentCampaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 })
    }

    const updated = await prisma.$transaction(async (tx) => {
      // If productIds supplied, update relations
      if (validated.data.productIds) {
        await tx.campaignProduct.deleteMany({
          where: { campaignId: id },
        })
        if (validated.data.productIds.length > 0) {
          await tx.campaignProduct.createMany({
            data: validated.data.productIds.map((pId) => ({
              campaignId: id,
              productId: pId,
            })),
          })
        }
      }

      const campaignRes = await tx.campaign.update({
        where: { id },
        data: {
          name: validated.data.name || undefined,
          description: validated.data.description !== undefined ? validated.data.description : undefined,
          startDate: validated.data.startDate ? new Date(validated.data.startDate) : undefined,
          endDate: validated.data.endDate ? new Date(validated.data.endDate) : undefined,
          isActive: validated.data.isActive !== undefined ? validated.data.isActive : undefined,
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
          action: "UPDATE_CAMPAIGN",
          resource: "Campaign",
          resourceId: currentCampaign.id,
          oldValues: {
            name: currentCampaign.name,
            isActive: currentCampaign.isActive,
          },
          newValues: {
            name: campaignRes.name,
            isActive: campaignRes.isActive,
            adminNote: validated.data.adminNote,
          },
        },
      })

      return campaignRes
    })

    return NextResponse.json({ success: true, campaign: updated })
  } catch (error) {
    console.error("[API_ADMIN_CAMPAIGN_PATCH_ERROR]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE /api/admin/campaigns/[id] - Delete campaign
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Admin authorization required" }, { status: 403 })
    }

    const { id } = params
    const campaign = await prisma.campaign.findUnique({ where: { id } })

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 })
    }

    await prisma.$transaction(async (tx) => {
      await tx.campaignProduct.deleteMany({ where: { campaignId: id } })
      await tx.campaign.delete({ where: { id } })

      await tx.auditLog.create({
        data: {
          userId: session.user.id,
          action: "DELETE_CAMPAIGN",
          resource: "Campaign",
          resourceId: id,
          oldValues: { name: campaign.name },
        },
      })
    })

    return NextResponse.json({ success: true, message: "Campaign deleted" })
  } catch (error) {
    console.error("[API_ADMIN_CAMPAIGN_DELETE_ERROR]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
