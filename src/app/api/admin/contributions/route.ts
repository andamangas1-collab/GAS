import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

// GET /api/admin/contributions - Admin listing of all user contributions
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Admin authorization required" }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get("status")

    const whereClause: any = {}
    if (status && status !== "ALL") {
      whereClause.status = status
    }

    const contributions = await prisma.contribution.findMany({
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
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ success: true, contributions })
  } catch (error) {
    console.error("[API_ADMIN_CONTRIBUTIONS_GET_ERROR]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
