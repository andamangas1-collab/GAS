// ============================================================
// GAS™ MVP — Recognition Engine Service Layer
// Enforces:
// 1. Never overwrite total points without creating a ledger entry.
// 2. Dynamic points rules & admin configuration.
// 3. Dynamic tier progression (Explorer -> Contributor -> Value Builder -> Community Builder -> GAS Champion).
// 4. Milestone badge qualification & notification.
// 5. Immutable audit logging and activity telemetry.
// ============================================================

import { prisma } from "@/lib/prisma"
import { RecognitionAction, Prisma } from "@prisma/client"

export interface AwardPointsParams {
  userId: string
  action: RecognitionAction
  referenceId?: string | null
  points?: number
  note?: string | null
  adminUserId?: string
  tx?: Prisma.TransactionClient
}

export interface RecognitionSummary {
  totalPoints: number
  currentLevel: {
    name: string
    description: string | null
    minPoints: number
    maxPoints: number | null
    badgeIcon: string | null
    order: number
  }
  nextLevel: {
    name: string
    minPoints: number
    pointsNeeded: number
  } | null
  progressPercentage: number
  pointsHistory: Array<{
    id: string
    points: number
    action: RecognitionAction
    referenceId: string | null
    note: string | null
    createdAt: Date
  }>
  badges: Array<{
    id: string
    name: string
    description: string | null
    condition: string | null
    iconUrl: string | null
    isEarned: boolean
    earnedAt: Date | null
  }>
  activityHistory: Array<{
    id: string
    event: string
    entityType: string | null
    entityId: string | null
    metadata: any
    createdAt: Date
  }>
}

export class RecognitionService {
  // Default action reward points
  public static readonly DEFAULT_POINT_RULES: Record<RecognitionAction, number> = {
    PROFILE_COMPLETE: 10,
    LEARNING_COMPLETE: 10,
    REFERRAL_SUCCESSFUL: 20,
    CONTRIBUTION_APPROVED: 25,
    IDEA_APPROVED: 50,
    COMMUNITY_PARTICIPATION: 10,
    REGISTRATION: 5,
    PURCHASE: 10,
  }

  /**
   * Award points by creating an immutable ledger transaction.
   * Total points are NEVER directly overwritten.
   */
  public static async awardPoints(params: AwardPointsParams) {
    const { userId, action, referenceId, points, note, adminUserId, tx } = params
    const db = tx || prisma

    // 1. Determine points to award from database rules or fallback
    let finalPoints = 0
    if (typeof points === "number") {
      finalPoints = points
    } else {
      const rule = await db.pointRule.findUnique({
        where: { action },
      })
      if (rule) {
        if (!rule.isActive) {
          return {
            success: false,
            pointsAwarded: 0,
            reason: `Point rule for action ${action} is currently inactive.`,
          }
        }
        finalPoints = rule.points
      } else {
        finalPoints = this.DEFAULT_POINT_RULES[action] ?? 10
      }
    }

    if (finalPoints <= 0) {
      return { success: false, pointsAwarded: 0, reason: "Points awarded must be greater than zero." }
    }

    // 2. Insert ledger transaction
    const ledgerEntry = await db.recognitionPoint.create({
      data: {
        userId,
        points: finalPoints,
        action,
        referenceId: referenceId || null,
        note: note || `Awarded for ${action.replace(/_/g, " ").toLowerCase()}`,
      },
    })

    // 3. Recalculate total points deterministically from ledger sum
    const pointsAgg = await db.recognitionPoint.aggregate({
      where: { userId },
      _sum: { points: true },
    })
    const newTotal = pointsAgg._sum.points || 0

    // 4. Determine current recognition level
    const matchedLevel = await db.recognitionLevel.findFirst({
      where: {
        minPoints: { lte: newTotal },
        OR: [{ maxPoints: { gte: newTotal } }, { maxPoints: null }],
      },
      orderBy: { minPoints: "desc" },
    })
    const currentLevelName = matchedLevel?.name || "Explorer"

    // 5. Evaluate milestone badges
    let unlockedBadgeName: string | null = null
    const eligibleBadgeNames: string[] = []

    if (action === "REGISTRATION" || newTotal >= 5) eligibleBadgeNames.push("Welcome")
    if (action === "PROFILE_COMPLETE") eligibleBadgeNames.push("Profile Pro")
    if (action === "REFERRAL_SUCCESSFUL") eligibleBadgeNames.push("First Referral")
    if (action === "PURCHASE") eligibleBadgeNames.push("First Purchase")
    if (action === "CONTRIBUTION_APPROVED" || action === "IDEA_APPROVED") eligibleBadgeNames.push("V2V Contributor")
    if (newTotal >= 700) eligibleBadgeNames.push("GAS Champion")

    for (const badgeName of eligibleBadgeNames) {
      const badge = await db.badge.findUnique({ where: { name: badgeName } })
      if (badge) {
        const existing = await db.userBadge.findUnique({
          where: { userId_badgeId: { userId, badgeId: badge.id } },
        })
        if (!existing) {
          await db.userBadge.create({
            data: { userId, badgeId: badge.id },
          })
          unlockedBadgeName = badge.name

          // Notify badge unlock
          await db.notification.create({
            data: {
              userId,
              type: "BADGE_EARNED",
              title: "New Badge Unlocked!",
              message: `Congratulations! You have unlocked the "${badge.name}" badge.`,
            },
          })
        }
      }
    }

    // 6. Send points notification
    await db.notification.create({
      data: {
        userId,
        type: "POINTS_AWARDED",
        title: "Recognition Points Awarded!",
        message: `You earned +${finalPoints} points for ${action.replace(/_/g, " ").toLowerCase()}. Total: ${newTotal} pts (${currentLevelName}).`,
      },
    })

    // 7. Telemetry & Audit Logs
    await db.activityLog.create({
      data: {
        userId,
        event: "POINTS_AWARDED",
        entityType: "RecognitionPoint",
        entityId: ledgerEntry.id,
        metadata: {
          points: finalPoints,
          action,
          newTotal,
          currentLevel: currentLevelName,
        },
      },
    })

    if (adminUserId) {
      await db.auditLog.create({
        data: {
          userId: adminUserId,
          action: "MANUAL_POINT_AWARD",
          resource: "RecognitionPoint",
          resourceId: ledgerEntry.id,
          newValues: {
            recipientUserId: userId,
            points: finalPoints,
            action,
            note,
          },
        },
      })
    }

    return {
      success: true,
      pointsAwarded: finalPoints,
      newTotalPoints: newTotal,
      currentLevel: currentLevelName,
      unlockedBadge: unlockedBadgeName,
      ledgerEntryId: ledgerEntry.id,
    }
  }

  /**
   * Retrieve complete recognition summary for a user.
   */
  public static async getUserRecognitionSummary(userId: string): Promise<RecognitionSummary> {
    // 1. Calculate total points from ledger
    const pointsAgg = await prisma.recognitionPoint.aggregate({
      where: { userId },
      _sum: { points: true },
    })
    const totalPoints = pointsAgg._sum.points || 0

    // 2. Fetch all levels ordered
    const levels = await prisma.recognitionLevel.findMany({
      orderBy: { order: "asc" },
    })

    // 3. Find current and next level
    let currentLevel = levels[0] || {
      id: "lvl_explorer",
      name: "Explorer",
      description: "Welcome to your value creation journey.",
      minPoints: 0,
      maxPoints: 49,
      badgeIcon: "Compass",
      order: 1,
    }

    for (const lvl of levels) {
      if (totalPoints >= lvl.minPoints) {
        currentLevel = lvl
      }
    }

    const currentIndex = levels.findIndex((l) => l.name === currentLevel.name)
    const nextLevelRaw = currentIndex >= 0 && currentIndex < levels.length - 1 ? levels[currentIndex + 1] : null

    let nextLevel = null
    let progressPercentage = 100

    if (nextLevelRaw) {
      const needed = Math.max(0, nextLevelRaw.minPoints - totalPoints)
      const range = nextLevelRaw.minPoints - currentLevel.minPoints
      const currentProgress = Math.max(0, totalPoints - currentLevel.minPoints)
      progressPercentage = range > 0 ? Math.min(100, Math.round((currentProgress / range) * 100)) : 100

      nextLevel = {
        name: nextLevelRaw.name,
        minPoints: nextLevelRaw.minPoints,
        pointsNeeded: needed,
      }
    }

    // 4. Fetch points transactions ledger
    const pointsHistory = await prisma.recognitionPoint.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 100,
    })

    // 5. Fetch all badges & user earned badges
    const [allBadges, userBadges] = await Promise.all([
      prisma.badge.findMany({ orderBy: { createdAt: "asc" } }),
      prisma.userBadge.findMany({ where: { userId } }),
    ])

    const userBadgeMap = new Map<string, Date>()
    userBadges.forEach((ub) => userBadgeMap.set(ub.badgeId, ub.earnedAt))

    const badges = allBadges.map((b) => ({
      id: b.id,
      name: b.name,
      description: b.description,
      condition: b.condition,
      iconUrl: b.iconUrl,
      isEarned: userBadgeMap.has(b.id),
      earnedAt: userBadgeMap.get(b.id) || null,
    }))

    // 6. Fetch recent activity telemetry
    const activityHistory = await prisma.activityLog.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 20,
    })

    return {
      totalPoints,
      currentLevel: {
        name: currentLevel.name,
        description: currentLevel.description,
        minPoints: currentLevel.minPoints,
        maxPoints: currentLevel.maxPoints,
        badgeIcon: currentLevel.badgeIcon,
        order: currentLevel.order,
      },
      nextLevel,
      progressPercentage,
      pointsHistory,
      badges,
      activityHistory,
    }
  }

  /**
   * Get all configurable point rules.
   */
  public static async getPointRules() {
    return prisma.pointRule.findMany({
      orderBy: { action: "asc" },
    })
  }

  /**
   * Admin update for point rule.
   */
  public static async updatePointRule(params: {
    action: RecognitionAction
    points: number
    isActive: boolean
    adminUserId: string
  }) {
    const { action, points, isActive, adminUserId } = params

    const existing = await prisma.pointRule.findUnique({
      where: { action },
    })

    const updated = await prisma.pointRule.upsert({
      where: { action },
      update: { points, isActive },
      create: { action, points, isActive },
    })

    await prisma.auditLog.create({
      data: {
        userId: adminUserId,
        action: "UPDATE_POINT_RULE",
        resource: "PointRule",
        oldValues: existing ? { points: existing.points, isActive: existing.isActive } : Prisma.JsonNull,
        newValues: { points, isActive },
      },
    })

    return updated
  }

  /**
   * Get all recognition levels.
   */
  public static async getRecognitionLevels() {
    return prisma.recognitionLevel.findMany({
      orderBy: { order: "asc" },
    })
  }

  /**
   * Admin update for recognition level thresholds.
   */
  public static async updateRecognitionLevel(params: {
    id: string
    minPoints: number
    maxPoints?: number | null
    description?: string | null
    adminUserId: string
  }) {
    const { id, minPoints, maxPoints, description, adminUserId } = params

    const existing = await prisma.recognitionLevel.findUnique({
      where: { id },
    })

    const updated = await prisma.recognitionLevel.update({
      where: { id },
      data: {
        minPoints,
        maxPoints: maxPoints === undefined ? null : maxPoints,
        description: description ?? null,
      },
    })

    await prisma.auditLog.create({
      data: {
        userId: adminUserId,
        action: "UPDATE_RECOGNITION_LEVEL",
        resource: "RecognitionLevel",
        resourceId: id,
        oldValues: existing
          ? { minPoints: existing.minPoints, maxPoints: existing.maxPoints, description: existing.description }
          : Prisma.JsonNull,
        newValues: { minPoints, maxPoints, description },
      },
    })

    return updated
  }
}
