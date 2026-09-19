import { NextResponse } from "next/server"
import { hash } from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { registerSchema } from "@/lib/validations/auth"
import { generateReferralCode } from "@/lib/utils"
import { handleApiError, created, errors } from "@/lib/api-response"
import { logger } from "@/lib/logger"

import { cookies } from "next/headers"

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validate input
    const validated = registerSchema.parse(body)

    // Check email uniqueness
    const existingUser = await prisma.user.findUnique({
      where: { email: validated.email },
    })
    if (existingUser) {
      return errors.conflict("An account with this email already exists")
    }

    // Check mobile uniqueness
    const existingMobile = await prisma.profile.findUnique({
      where: { mobile: validated.mobile },
    })
    if (existingMobile) {
      return errors.conflict("An account with this mobile number already exists")
    }

    // Resolve referral code from body OR tracking cookie
    const cookieStore = cookies()
    const cookieRef = cookieStore.get("gas_ref")?.value
    const cookieClickedAt = cookieStore.get("gas_ref_clicked_at")?.value

    const resolvedReferralCode =
      validated.referralCode && validated.referralCode.trim() !== ""
        ? validated.referralCode.trim().toUpperCase()
        : cookieRef
        ? cookieRef.trim().toUpperCase()
        : null

    let referrer = null
    if (resolvedReferralCode) {
      referrer = await prisma.user.findUnique({
        where: { referralCode: resolvedReferralCode },
        include: { profile: true },
      })
      if (!referrer || referrer.status !== "ACTIVE") {
        return errors.badRequest("Invalid or inactive referral code")
      }
    }

    // Split Full Name into First and Last name
    const nameParts = validated.fullName.trim().split(/\s+/)
    const firstName = nameParts[0]
    const lastName = nameParts.slice(1).join(" ") || "—"

    // Generate unique referral code for the new user
    let newReferralCode: string
    let attempts = 0
    do {
      newReferralCode = generateReferralCode()
      const exists = await prisma.user.findUnique({ where: { referralCode: newReferralCode } })
      if (!exists) break
      attempts++
    } while (attempts < 10)

    // Hash password with salt rounds >= 12
    const hashedPassword = await hash(validated.password, 12)

    // Create user + profile in a transaction
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email: validated.email,
          password: hashedPassword,
          referralCode: newReferralCode,
          referredBy: referrer?.referralCode || null,
          role: "USER",
          status: "ACTIVE",
          profile: {
            create: {
              firstName,
              lastName,
              mobile: validated.mobile,
              isComplete: false,
            },
          },
        },
        include: { profile: true },
      })

      // Create referral record if referred
      if (referrer) {
        const isSelf = Boolean(
          referrer.id === newUser.id ||
          referrer.email.toLowerCase() === newUser.email.toLowerCase() ||
          (referrer.profile?.mobile && referrer.profile.mobile === validated.mobile)
        )

        await tx.referral.create({
          data: {
            referrerId: referrer.id,
            referredId: newUser.id,
            clickedAt: cookieClickedAt ? new Date(cookieClickedAt) : new Date(),
            registeredAt: new Date(),
            status: isSelf ? "REJECTED" : "REGISTERED",
            isSelfReferral: isSelf,
            isFlagged: isSelf,
            flagReason: isSelf ? "Self-referral detected during registration" : null,
          },
        })
      }

      // Award registration points
      await tx.recognitionPoint.create({
        data: {
          userId: newUser.id,
          points: 5,
          action: "REGISTRATION",
          note: "Welcome to GAS™",
        },
      })

      // Log analytics event
      await tx.activityLog.create({
        data: {
          userId: newUser.id,
          event: "REGISTRATION",
          metadata: { referredBy: referrer?.referralCode || null },
        },
      })

      return newUser
    })

    logger.info("New user registered", { userId: user.id, email: user.email })

    return created({
      id: user.id,
      email: user.email,
      referralCode: user.referralCode,
      profile: user.profile
        ? {
            firstName: user.profile.firstName,
            lastName: user.profile.lastName,
          }
        : null,
    })
  } catch (error) {
    return handleApiError(error, "POST /api/auth/register")
  }
}
