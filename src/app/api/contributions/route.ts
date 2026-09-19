import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

export const dynamic = "force-dynamic"

const contributionSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(100),
  description: z.string().min(20, "Description must be at least 20 characters").max(2000),
  category: z.enum([
    "IDEA",
    "FEEDBACK",
    "PRODUCT_IMPROVEMENT",
    "EDUCATIONAL_CONTENT",
    "COMMUNITY",
    "RESOURCE",
  ]),
  attachmentUrl: z.string().url("Invalid URL format").optional().or(z.literal("")).nullable(),
})

// GET /api/contributions - Retrieve current user's contributions
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const contributions = await prisma.contribution.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ success: true, contributions })
  } catch (error) {
    console.error("[API_CONTRIBUTIONS_GET_ERROR]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST /api/contributions - Submit a new value contribution
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const validated = contributionSchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validated.error.flatten() },
        { status: 400 }
      )
    }

    const contribution = await prisma.contribution.create({
      data: {
        userId: session.user.id,
        title: validated.data.title,
        description: validated.data.description,
        category: validated.data.category,
        attachmentUrl: validated.data.attachmentUrl || null,
        status: "SUBMITTED",
      },
    })

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        event: "CONTRIBUTION_SUBMITTED",
        entityType: "Contribution",
        entityId: contribution.id,
        metadata: {
          title: contribution.title,
          category: contribution.category,
        },
      },
    })

    return NextResponse.json({ success: true, contribution }, { status: 201 })
  } catch (error) {
    console.error("[API_CONTRIBUTIONS_POST_ERROR]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
