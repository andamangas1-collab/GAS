import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

// GET /r/[code] - Short link referral redirection & click telemetry tracking
export async function GET(
  request: Request,
  { params }: { params: { code: string } }
) {
  const code = params.code?.trim().toUpperCase()

  if (!code) {
    return NextResponse.redirect(new URL("/register", request.url))
  }

  // Look up referrer user in database
  const referrer = await prisma.user.findUnique({
    where: { referralCode: code },
    select: { id: true, status: true, referralCode: true },
  })

  // If referrer does not exist or is inactive, redirect with error
  if (!referrer || referrer.status !== "ACTIVE") {
    return NextResponse.redirect(
      new URL("/register?error=invalid_referral", request.url)
    )
  }

  const now = new Date()
  const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "127.0.0.1"
  const userAgent = request.headers.get("user-agent") || ""

  // Track click telemetry in activity log
  try {
    await prisma.activityLog.create({
      data: {
        userId: referrer.id,
        event: "REFERRAL_LINK_CLICKED",
        entityType: "User",
        entityId: referrer.id,
        ipAddress: ip,
        userAgent: userAgent.slice(0, 500),
        metadata: {
          referralCode: referrer.referralCode,
          clickedAt: now.toISOString(),
        },
      },
    })
  } catch (err) {
    console.error("[REFERRAL_CLICK_LOG_ERROR]", err)
  }

  // Redirect to registration form with ref query param
  const redirectUrl = new URL(`/register?ref=${referrer.referralCode}`, request.url)
  const response = NextResponse.redirect(redirectUrl)

  // Set 30-day attribution cookies
  response.cookies.set("gas_ref", referrer.referralCode, {
    path: "/",
    maxAge: 30 * 24 * 60 * 60,
    httpOnly: true,
    sameSite: "lax",
  })

  response.cookies.set("gas_ref_clicked_at", now.toISOString(), {
    path: "/",
    maxAge: 30 * 24 * 60 * 60,
    httpOnly: true,
    sameSite: "lax",
  })

  return response
}
