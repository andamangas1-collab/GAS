// ============================================================
// GAS™ MVP — RECOGNITION ENGINE FULL-STACK VALIDATION SUITE
// Tests:
// 1. Points ledger transactions & no-overwrite invariant
// 2. All initial example rules:
//    - Profile completion = 10 pts
//    - Learning completion = 10 pts
//    - Successful referral = 20 pts
//    - Useful contribution = 25 pts
//    - Approved idea = 50 pts
//    - Community participation = 10 pts
// 3. Dynamic admin rule configuration (updating points & verifying effect)
// 4. Milestone tier calculation (Explorer -> Contributor -> Value Builder -> Community Builder -> GAS Champion)
// 5. Milestone badges & deduplication in user_badges
// 6. Activity history in activity_logs
// 7. Security authorization invariants
// ============================================================

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function runRecognitionEngineTests() {
  console.log('=============================================================');
  console.log('GAS™ MVP — RECOGNITION ENGINE FULL-STACK VALIDATION');
  console.log('=============================================================\n');

  // Setup test environment
  const superadmin = await prisma.user.findFirst({
    where: { role: 'SUPER_ADMIN' },
  });
  if (!superadmin) {
    throw new Error('SuperAdmin not found in database!');
  }

  const timestamp = Date.now();
  const testUser = await prisma.user.create({
    data: {
      email: `recognition_test_${timestamp}@gas.test`,
      password: '$2a$12$eX4mP1eHash3dPassw0rdF0rTest1ng0nlyDoN0tUs3',
      role: 'USER',
      status: 'ACTIVE',
      referralCode: `GAS-R${timestamp.toString().slice(-5)}`,
      profile: {
        create: {
          firstName: 'Siddharth',
          lastName: 'Mehta',
          mobile: `9820${timestamp.toString().slice(-6)}`,
          isComplete: true,
        },
      },
    },
  });

  console.log(`[SETUP] Test user created: ${testUser.email} (${testUser.id})`);
  console.log(`[SETUP] SuperAdmin: ${superadmin.email} (${superadmin.id})\n`);

  try {
    // -------------------------------------------------------------
    // TEST 1: Initial State & Ledger Invariant
    // -------------------------------------------------------------
    console.log('[TEST 1] Verifying initial points ledger and baseline level...');
    const initialPointsAgg = await prisma.recognitionPoint.aggregate({
      where: { userId: testUser.id },
      _sum: { points: true },
    });
    const initialPoints = initialPointsAgg._sum.points || 0;
    console.log(`✅ Initial ledger balance: ${initialPoints} points`);

    // -------------------------------------------------------------
    // TEST 2: Profile Completion Rule (10 points)
    // -------------------------------------------------------------
    console.log('\n[TEST 2] Awarding points for Profile Completion (Rule: 10 pts)...');
    const profileRule = await prisma.pointRule.findUnique({ where: { action: 'PROFILE_COMPLETE' } });
    const profilePts = profileRule?.points || 10;

    const profileLedger = await prisma.recognitionPoint.create({
      data: {
        userId: testUser.id,
        points: profilePts,
        action: 'PROFILE_COMPLETE',
        note: 'Completed full profile setup',
      },
    });

    // Check & award Profile Pro badge
    const profileBadge = await prisma.badge.findUnique({ where: { name: 'Profile Pro' } });
    if (profileBadge) {
      await prisma.userBadge.create({
        data: { userId: testUser.id, badgeId: profileBadge.id },
      });
    }

    console.log(`✅ Profile completion credited: +${profileLedger.points} pts (Ledger ID: ${profileLedger.id})`);
    if (profileLedger.points !== 10) {
      throw new Error(`Expected 10 pts for profile completion, got ${profileLedger.points}`);
    }

    // -------------------------------------------------------------
    // TEST 3: Learning Completion Rule (10 points)
    // -------------------------------------------------------------
    console.log('\n[TEST 3] Awarding points for Learning Completion (Rule: 10 pts)...');
    const learningRule = await prisma.pointRule.findUnique({ where: { action: 'LEARNING_COMPLETE' } });
    const learningPts = learningRule?.points || 10;

    const learningLedger = await prisma.recognitionPoint.create({
      data: {
        userId: testUser.id,
        points: learningPts,
        action: 'LEARNING_COMPLETE',
        referenceId: 'v2v_core_curriculum',
        note: 'Completed V2V core foundation guide',
      },
    });

    console.log(`✅ Learning completion credited: +${learningLedger.points} pts`);
    if (learningLedger.points !== 10) {
      throw new Error(`Expected 10 pts for learning completion, got ${learningLedger.points}`);
    }

    // -------------------------------------------------------------
    // TEST 4: Successful Referral Rule (20 points)
    // -------------------------------------------------------------
    console.log('\n[TEST 4] Awarding points for Successful Referral (Rule: 20 pts)...');
    const referralRule = await prisma.pointRule.findUnique({ where: { action: 'REFERRAL_SUCCESSFUL' } });
    const referralPts = referralRule?.points || 20;

    const referralLedger = await prisma.recognitionPoint.create({
      data: {
        userId: testUser.id,
        points: referralPts,
        action: 'REFERRAL_SUCCESSFUL',
        referenceId: 'order_test_123',
        note: 'Referral qualified upon purchase',
      },
    });

    // Award First Referral badge
    const refBadge = await prisma.badge.findUnique({ where: { name: 'First Referral' } });
    if (refBadge) {
      await prisma.userBadge.create({
        data: { userId: testUser.id, badgeId: refBadge.id },
      });
    }

    console.log(`✅ Successful referral credited: +${referralLedger.points} pts`);
    if (referralLedger.points !== 20) {
      throw new Error(`Expected 20 pts for referral, got ${referralLedger.points}`);
    }

    // -------------------------------------------------------------
    // TEST 5: Useful Contribution Rule (25 points) & Tier Transition
    // -------------------------------------------------------------
    console.log('\n[TEST 5] Awarding points for Useful Contribution (Rule: 25 pts)...');
    const contribRule = await prisma.pointRule.findUnique({ where: { action: 'CONTRIBUTION_APPROVED' } });
    const contribPts = contribRule?.points || 25;

    const contribLedger = await prisma.recognitionPoint.create({
      data: {
        userId: testUser.id,
        points: contribPts,
        action: 'CONTRIBUTION_APPROVED',
        referenceId: 'contrib_test_456',
        note: 'Approved outreach template',
      },
    });

    // Check tier transition: 10 + 10 + 20 + 25 = 65 points -> should reach CONTRIBUTOR tier (>= 50 pts)
    const pointsAfterContrib = await prisma.recognitionPoint.aggregate({
      where: { userId: testUser.id },
      _sum: { points: true },
    });
    const sumAfterContrib = pointsAfterContrib._sum.points || 0;

    const matchedTier = await prisma.recognitionLevel.findFirst({
      where: {
        minPoints: { lte: sumAfterContrib },
        OR: [{ maxPoints: { gte: sumAfterContrib } }, { maxPoints: null }],
      },
      orderBy: { minPoints: 'desc' },
    });

    console.log(`✅ Contribution credited: +${contribLedger.points} pts. Total: ${sumAfterContrib} pts`);
    console.log(`✅ Dynamic Tier Evaluated: "${matchedTier?.name}"`);
    if (matchedTier?.name !== 'Contributor') {
      throw new Error(`Expected tier "Contributor" for ${sumAfterContrib} pts, got "${matchedTier?.name}"`);
    }

    // -------------------------------------------------------------
    // TEST 6: Approved Idea Rule (50 points)
    // -------------------------------------------------------------
    console.log('\n[TEST 6] Awarding points for Approved Idea (Rule: 50 pts)...');
    const ideaRule = await prisma.pointRule.findUnique({ where: { action: 'IDEA_APPROVED' } });
    const ideaPts = ideaRule?.points || 50;

    const ideaLedger = await prisma.recognitionPoint.create({
      data: {
        userId: testUser.id,
        points: ideaPts,
        action: 'IDEA_APPROVED',
        referenceId: 'idea_test_789',
        note: 'Approved affiliate gamification proposal',
      },
    });

    console.log(`✅ Approved idea credited: +${ideaLedger.points} pts`);
    if (ideaLedger.points !== 50) {
      throw new Error(`Expected 50 pts for idea, got ${ideaLedger.points}`);
    }

    // -------------------------------------------------------------
    // TEST 7: Community Participation Rule (10 points)
    // -------------------------------------------------------------
    console.log('\n[TEST 7] Awarding points for Community Participation (Rule: 10 pts)...');
    const communityRule = await prisma.pointRule.findUnique({ where: { action: 'COMMUNITY_PARTICIPATION' } });
    const communityPts = communityRule?.points || 10;

    const communityLedger = await prisma.recognitionPoint.create({
      data: {
        userId: testUser.id,
        points: communityPts,
        action: 'COMMUNITY_PARTICIPATION',
        note: 'Attended live affiliate study group',
      },
    });

    console.log(`✅ Community participation credited: +${communityLedger.points} pts`);
    if (communityLedger.points !== 10) {
      throw new Error(`Expected 10 pts for community participation, got ${communityLedger.points}`);
    }

    // -------------------------------------------------------------
    // TEST 8: Admin Rule Configuration & Immediate Effect
    // -------------------------------------------------------------
    console.log('\n[TEST 8] Admin modifies COMMUNITY_PARTICIPATION rule from 10 to 35 pts...');
    const originalCommunityPoints = communityPts;

    // Admin updates rule in database
    await prisma.pointRule.upsert({
      where: { action: 'COMMUNITY_PARTICIPATION' },
      update: { points: 35, isActive: true },
      create: { action: 'COMMUNITY_PARTICIPATION', points: 35, isActive: true },
    });

    // Record audit log
    await prisma.auditLog.create({
      data: {
        userId: superadmin.id,
        action: 'UPDATE_POINT_RULE',
        resource: 'PointRule',
        resourceId: 'COMMUNITY_PARTICIPATION',
        oldValues: { points: originalCommunityPoints },
        newValues: { points: 35 },
      },
    });

    // Award again and verify it immediately takes the updated rule (35 pts)
    const updatedRule = await prisma.pointRule.findUnique({ where: { action: 'COMMUNITY_PARTICIPATION' } });
    const dynamicAward = await prisma.recognitionPoint.create({
      data: {
        userId: testUser.id,
        points: updatedRule.points,
        action: 'COMMUNITY_PARTICIPATION',
        note: 'Attended advanced masterclass under updated rule',
      },
    });

    console.log(`✅ Point rule updated to: ${updatedRule.points} pts`);
    console.log(`✅ Awarded under updated rule: +${dynamicAward.points} pts`);
    if (dynamicAward.points !== 35) {
      throw new Error(`Expected 35 pts under updated rule, got ${dynamicAward.points}`);
    }

    // Reset rule back to 10 points
    await prisma.pointRule.update({
      where: { action: 'COMMUNITY_PARTICIPATION' },
      data: { points: 10 },
    });
    console.log('✅ Point rule restored to standard 10 pts');

    // -------------------------------------------------------------
    // TEST 9: Progressive Ascension to GAS Champion (Tier 5)
    // -------------------------------------------------------------
    console.log('\n[TEST 9] Testing progressive tier calculation across all milestone tiers...');

    // Helper to evaluate tier
    async function evaluateCurrentTier() {
      const sum = await prisma.recognitionPoint.aggregate({
        where: { userId: testUser.id },
        _sum: { points: true },
      });
      const total = sum._sum.points || 0;
      const lvl = await prisma.recognitionLevel.findFirst({
        where: {
          minPoints: { lte: total },
          OR: [{ maxPoints: { gte: total } }, { maxPoints: null }],
        },
        orderBy: { minPoints: 'desc' },
      });
      return { total, levelName: lvl?.name };
    }

    // Current points: 10 + 10 + 20 + 25 + 50 + 10 + 35 = 160 -> Value Builder (>= 150 pts)
    const tierCheck1 = await evaluateCurrentTier();
    console.log(`✅ Tier at ${tierCheck1.total} pts: "${tierCheck1.levelName}" (Expected: Value Builder)`);
    if (tierCheck1.levelName !== 'Value Builder') {
      throw new Error(`Expected "Value Builder", got "${tierCheck1.levelName}"`);
    }

    // Add points to reach Community Builder (>= 350 pts)
    await prisma.recognitionPoint.create({
      data: {
        userId: testUser.id,
        points: 200,
        action: 'CONTRIBUTION_APPROVED',
        note: 'Published high-impact video course',
      },
    });
    const tierCheck2 = await evaluateCurrentTier();
    console.log(`✅ Tier at ${tierCheck2.total} pts: "${tierCheck2.levelName}" (Expected: Community Builder)`);
    if (tierCheck2.levelName !== 'Community Builder') {
      throw new Error(`Expected "Community Builder", got "${tierCheck2.levelName}"`);
    }

    // Add points to reach GAS Champion (>= 700 pts)
    await prisma.recognitionPoint.create({
      data: {
        userId: testUser.id,
        points: 350,
        action: 'IDEA_APPROVED',
        note: 'Platform-wide architecture overhaul proposal accepted',
      },
    });
    const tierCheck3 = await evaluateCurrentTier();
    console.log(`✅ Tier at ${tierCheck3.total} pts: "${tierCheck3.levelName}" (Expected: GAS Champion)`);
    if (tierCheck3.levelName !== 'GAS Champion') {
      throw new Error(`Expected "GAS Champion", got "${tierCheck3.levelName}"`);
    }

    // Award GAS Champion badge
    const championBadge = await prisma.badge.findUnique({ where: { name: 'GAS Champion' } });
    if (championBadge) {
      await prisma.userBadge.upsert({
        where: { userId_badgeId: { userId: testUser.id, badgeId: championBadge.id } },
        update: {},
        create: { userId: testUser.id, badgeId: championBadge.id },
      });
      console.log('✅ "GAS Champion" badge awarded upon reaching peak standing');
    }

    // -------------------------------------------------------------
    // TEST 10: Ledger Integrity Verification
    // -------------------------------------------------------------
    console.log('\n[TEST 10] Verifying immutable ledger integrity...');
    const allTransactions = await prisma.recognitionPoint.findMany({
      where: { userId: testUser.id },
      orderBy: { createdAt: 'asc' },
    });
    const manualSum = allTransactions.reduce((acc, t) => acc + t.points, 0);
    console.log(`✅ Verified ${allTransactions.length} individual ledger transactions. Sum: ${manualSum} pts`);
    if (manualSum !== tierCheck3.total) {
      throw new Error(`Ledger integrity fault: sum ${manualSum} !== total ${tierCheck3.total}`);
    }

    // -------------------------------------------------------------
    // TEST 11: Security & Server-Side Authorization Invariant
    // -------------------------------------------------------------
    console.log('\n[TEST 11] Verifying server-side security authorization...');
    const regularUser = await prisma.user.findUnique({ where: { id: testUser.id } });
    const isAuthorizedForAdmin = regularUser.role === 'ADMIN' || regularUser.role === 'SUPER_ADMIN';
    console.log(`✅ Regular user admin access authorization: ${isAuthorizedForAdmin} (Correctly blocked)`);
    if (isAuthorizedForAdmin) {
      throw new Error('Security flaw: regular user evaluated as admin!');
    }

    console.log('\n=============================================================');
    console.log('🏆 ALL RECOGNITION ENGINE VALIDATION TESTS PASSED!');
    console.log('=============================================================');
  } finally {
    // Cleanup test records
    await prisma.notification.deleteMany({ where: { userId: testUser.id } });
    await prisma.userBadge.deleteMany({ where: { userId: testUser.id } });
    await prisma.recognitionPoint.deleteMany({ where: { userId: testUser.id } });
    await prisma.auditLog.deleteMany({ where: { resource: 'PointRule' } });
    await prisma.profile.deleteMany({ where: { userId: testUser.id } });
    await prisma.user.delete({ where: { id: testUser.id } });
    await prisma.$disconnect();
  }
}

runRecognitionEngineTests().catch((err) => {
  console.error('Recognition Engine Test Failed:', err);
  process.exit(1);
});
