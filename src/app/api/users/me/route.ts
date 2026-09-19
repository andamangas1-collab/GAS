import { requireAuth } from "@/lib/auth-guard"
import { prisma } from "@/lib/prisma"
import { ok, handleApiError, errors } from "@/lib/api-response"
import { updateProfileSchema } from "@/lib/validations/user"

export const dynamic = "force-dynamic"

// GET /api/users/me -> returns current authenticated user + profile + summary stats
export async function GET() {
  try {
    const session = await requireAuth()

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        referralCode: true,
        referredBy: true,
        createdAt: true,
        profile: {
          select: {
            firstName: true,
            lastName: true,
            mobile: true,
            bio: true,
            city: true,
            state: true,
            isComplete: true,
          },
        },
        recognitionPoints: {
          select: { points: true },
        },
        userBadges: {
          include: { badge: true },
        },
        _count: {
          select: {
            ordersPlaced: true,
            referralsMade: true,
            commissions: true,
            contributions: true,
          },
        },
      },
    })

    if (!user) {
      return errors.notFound("User")
    }

    const totalPoints = user.recognitionPoints.reduce((sum, r) => sum + r.points, 0)

    // Calculate current recognition level
    const currentLevel = await prisma.recognitionLevel.findFirst({
      where: {
        minPoints: { lte: totalPoints },
        OR: [
          { maxPoints: { gte: totalPoints } },
          { maxPoints: null },
        ],
      },
      orderBy: { order: "desc" },
    })

    return ok({
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
      referralCode: user.referralCode,
      referredBy: user.referredBy,
      createdAt: user.createdAt,
      profile: user.profile,
      totalPoints,
      level: currentLevel?.name || "Explorer",
      badges: user.userBadges.map((ub) => ({
        id: ub.badge.id,
        name: ub.badge.name,
        description: ub.badge.description,
        iconUrl: ub.badge.iconUrl,
        earnedAt: ub.earnedAt,
      })),
      counts: user._count,
    })
  } catch (error) {
    return handleApiError(error, "GET /api/users/me")
  }
}

// PUT /api/users/me -> updates current user profile
export async function PUT(request: Request) {
  try {
    const session = await requireAuth()
    const body = await request.json()
    const validated = updateProfileSchema.parse(body)

    // Check mobile conflict if updated
    if (validated.mobile) {
      const existing = await prisma.profile.findFirst({
        where: {
          mobile: validated.mobile,
          userId: { not: session.user.id },
        },
      })
      if (existing) {
        return errors.conflict("Mobile number is already registered to another user")
      }
    }

    const updatedProfile = await prisma.profile.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        firstName: validated.firstName,
        lastName: validated.lastName,
        mobile: validated.mobile || null,
        bio: validated.bio || null,
        city: validated.city || null,
        state: validated.state || null,
        isComplete: Boolean(validated.firstName && validated.lastName && validated.mobile),
      },
      update: {
        firstName: validated.firstName,
        lastName: validated.lastName,
        mobile: validated.mobile || null,
        bio: validated.bio || null,
        city: validated.city || null,
        state: validated.state || null,
        isComplete: Boolean(validated.firstName && validated.lastName && validated.mobile),
      },
    })

    return ok(updatedProfile)
  } catch (error) {
    return handleApiError(error, "PUT /api/users/me")
  }
}