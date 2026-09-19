import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

// GET /api/admin/users - List users with search and filter
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Admin authorization required" }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const search = searchParams.get("search") || ""
    const status = searchParams.get("status") || "ALL"
    const role = searchParams.get("role") || "ALL"

    const whereClause: any = {}

    if (status !== "ALL") {
      whereClause.status = status
    }

    if (role !== "ALL") {
      whereClause.role = role
    }

    if (search.trim()) {
      whereClause.OR = [
        { email: { contains: search } },
        { referralCode: { contains: search } },
        { profile: { firstName: { contains: search } } },
        { profile: { lastName: { contains: search } } },
        { profile: { mobile: { contains: search } } },
      ]
    }

    const users = await prisma.user.findMany({
      where: whereClause,
      include: {
        profile: true,
        _count: {
          select: {
            referralsMade: true,
            ordersPlaced: true,
            commissions: true,
            contributions: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ success: true, users })
  } catch (error) {
    console.error("[API_ADMIN_USERS_GET_ERROR]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
