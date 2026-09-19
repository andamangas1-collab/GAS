import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

// GET /api/admin/commissions - List affiliate commissions with status filtering
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Admin authorization required" }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get("status") || "ALL"

    const whereClause: any = {}
    if (status !== "ALL") {
      whereClause.status = status
    }

    const commissions = await prisma.commission.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            referralCode: true,
            profile: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        order: {
          select: {
            id: true,
            totalAmount: true,
            status: true,
            createdAt: true,
            items: {
              include: {
                product: {
                  select: { name: true },
                },
              },
            },
          },
        },
        referral: {
          select: {
            id: true,
            status: true,
            referred: {
              select: { email: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ success: true, commissions })
  } catch (error) {
    console.error("[API_ADMIN_COMMISSIONS_GET_ERROR]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
