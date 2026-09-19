
// ============================================================
// GAS™ MVP — Database Seed
// Populates: super admin, default point rules, recognition levels, badges
// ============================================================

import { PrismaClient, RecognitionAction } from "@prisma/client"
import { hash } from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Seeding GAS™ MVP database...")

  // ---- Super Admin User ------------------------------------
  const superAdminEmail = process.env.SUPER_ADMIN_EMAIL ?? "superadmin@gas.local"
  const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD ?? "SuperAdmin@123"

  const existingAdmin = await prisma.user.findUnique({ where: { email: superAdminEmail } })
  if (!existingAdmin) {
    const hashedPassword = await hash(superAdminPassword, 12)
    const admin = await prisma.user.create({
      data: {
        email: superAdminEmail,
        password: hashedPassword,
        role: "SUPER_ADMIN",
        status: "ACTIVE",
        referralCode: "GAS-ADMIN1",
        emailVerified: true,
        profile: {
          create: {
            firstName: "Super",
            lastName: "Admin",
            isComplete: true,
          },
        },
      },
    })
    console.log("✅ Super admin created:", admin.email)
  } else {
    console.log("⏩ Super admin already exists:", superAdminEmail)
  }

  // ---- Default Point Rules --------------------------------
  const defaultPointRules: { action: RecognitionAction; points: number }[] = [
    { action: "REGISTRATION", points: 5 },
    { action: "PROFILE_COMPLETE", points: 10 },
    { action: "PURCHASE", points: 10 },
    { action: "REFERRAL_SUCCESSFUL", points: 20 },
    { action: "CONTRIBUTION_APPROVED", points: 25 },
    { action: "IDEA_APPROVED", points: 50 },
    { action: "COMMUNITY_PARTICIPATION", points: 10 },
    { action: "LEARNING_COMPLETE", points: 10 },
  ]

  for (const rule of defaultPointRules) {
    await prisma.pointRule.upsert({
      where: { action: rule.action },
      update: { points: rule.points, isActive: true },
      create: { action: rule.action, points: rule.points, isActive: true },
    })
  }
  console.log("✅ Point rules seeded:", defaultPointRules.length, "rules")

  // ---- Recognition Levels ---------------------------------
  const defaultLevels = [
    { name: "Explorer", minPoints: 0, maxPoints: 49, order: 1, description: "Welcome to the journey!" },
    { name: "Contributor", minPoints: 50, maxPoints: 149, order: 2, description: "You\u2019re making an impact." },
    { name: "Value Builder", minPoints: 150, maxPoints: 349, order: 3, description: "A consistent creator of value." },
    { name: "Community Builder", minPoints: 350, maxPoints: 699, order: 4, description: "You help others grow." },
    { name: "GAS Champion", minPoints: 700, maxPoints: null, order: 5, description: "The pinnacle of the GAS™ community." },
  ]

  for (const level of defaultLevels) {
    await prisma.recognitionLevel.upsert({
      where: { name: level.name },
      update: level,
      create: level,
    })
  }
  console.log("✅ Recognition levels seeded:", defaultLevels.length, "levels")

  // ---- Default Badges -------------------------------------
  const defaultBadges = [
    { name: "Welcome", description: "Joined the GAS™ community", condition: "Complete registration" },
    { name: "First Purchase", description: "Made your first purchase", condition: "Complete first order" },
    { name: "First Referral", description: "Referred your first user", condition: "First successful referral" },
    { name: "V2V Contributor", description: "Submitted a value contribution", condition: "First approved contribution" },
    { name: "Profile Pro", description: "Completed your profile", condition: "Complete profile setup" },
    { name: "GAS Champion", description: "Reached GAS Champion level", condition: "Earn 700+ recognition points" },
  ]

  for (const badge of defaultBadges) {
    await prisma.badge.upsert({
      where: { name: badge.name },
      update: badge,
      create: badge,
    })
  }
  console.log("✅ Badges seeded:", defaultBadges.length, "badges")

  // ---- Default Commission Rule ----------------------------
  const existingRule = await prisma.commissionRule.findFirst({ where: { name: "Default Global Commission" } })
  if (!existingRule) {
    await prisma.commissionRule.create({
      data: {
        name: "Default Global Commission",
        type: "PERCENTAGE",
        value: 10,
        validationDays: 30,
        isActive: true,
      },
    })
    console.log("✅ Default commission rule created (10%)")
  }

  console.log("\n🎉 Seeding complete!")
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
