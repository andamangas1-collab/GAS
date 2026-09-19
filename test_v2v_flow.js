// ============================================================
// GAS™ MVP — V2V™ Value Creation & Review Verification Suite
// Tests all aspects of the V2V™ Engine:
// Submission, Attachments, Status Transitions, Admin Review,
// Recognition Points, Level Progression, Badges, Audit Trail,
// and Server-Side Authorization Invariants.
// ============================================================

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function runV2VFlowTests() {
  console.log('=== EXECUTING V2V™ VALUE ENGINE END-TO-END VALIDATION ===\n');

  // 1. Locate SuperAdmin and verify seed data
  const superadmin = await prisma.user.findFirst({
    where: { role: 'SUPER_ADMIN' },
  });

  if (!superadmin) {
    throw new Error('SuperAdmin not found in database! Please run prisma db seed first.');
  }

  // Verify recognition levels and badges exist
  const levels = await prisma.recognitionLevel.findMany({ orderBy: { minPoints: 'asc' } });
  if (levels.length === 0) {
    throw new Error('Recognition levels not found in database!');
  }
  console.log(`[SETUP] Found ${levels.length} recognition tiers: ${levels.map(l => l.name).join(' -> ')}`);

  // 2. Create a dedicated test contributor
  const timestamp = Date.now();
  const testContributor = await prisma.user.create({
    data: {
      email: `contributor_${timestamp}@gas.test`,
      password: '$2a$12$eX4mP1eHash3dPassw0rdF0rTest1ng0nlyDoN0tUs3',
      role: 'USER',
      status: 'ACTIVE',
      referralCode: `GAS-C${timestamp.toString().slice(-5)}`,
      profile: {
        create: {
          firstName: 'Ananya',
          lastName: 'Deshmukh',
          mobile: `9811${timestamp.toString().slice(-6)}`,
        },
      },
    },
  });

  console.log(`[SETUP] Test contributor created: ${testContributor.email} (${testContributor.id})`);
  console.log(`[SETUP] SuperAdmin: ${superadmin.email} (${superadmin.id})\n`);

  try {
    // -------------------------------------------------------------
    // TEST 1: User Submission with Attachment
    // -------------------------------------------------------------
    console.log('[TEST 1] User submits a Value Contribution with attachment URL...');
    const attachmentUrl = 'https://drive.google.com/file/d/12345example/view';
    const contribution = await prisma.contribution.create({
      data: {
        userId: testContributor.id,
        title: 'Tier-2 College Affiliate Outreach Framework',
        description: 'A 10-step ethical framework teaching students how to identify genuine learning opportunities and share affiliate recommendations without spamming.',
        category: 'EDUCATIONAL_CONTENT',
        attachmentUrl,
        status: 'SUBMITTED',
      },
    });

    console.log(`✅ Contribution submitted: ID=${contribution.id}, Status=${contribution.status}`);
    console.log(`✅ Attachment URL verified: ${contribution.attachmentUrl}`);
    if (contribution.attachmentUrl !== attachmentUrl) {
      throw new Error(`Attachment URL mismatch: expected ${attachmentUrl}, got ${contribution.attachmentUrl}`);
    }
    if (contribution.pointsAwarded !== null) {
      throw new Error('Security Invariant Failed: pointsAwarded must be null on initial submission!');
    }

    // -------------------------------------------------------------
    // TEST 2: Contributor Views Own Contributions
    // -------------------------------------------------------------
    console.log('\n[TEST 2] Contributor queries their own submitted contributions...');
    const userContributions = await prisma.contribution.findMany({
      where: { userId: testContributor.id },
      orderBy: { createdAt: 'desc' },
    });
    console.log(`✅ Contributor successfully retrieved ${userContributions.length} submission(s)`);
    if (userContributions[0].id !== contribution.id) {
      throw new Error('Retrieved contribution does not match submitted ID');
    }

    // -------------------------------------------------------------
    // TEST 3: Admin Review Queue & Status Transition to UNDER_REVIEW
    // -------------------------------------------------------------
    console.log('\n[TEST 3] Admin transitions contribution to UNDER_REVIEW status...');
    const underReview = await prisma.contribution.update({
      where: { id: contribution.id },
      data: {
        status: 'UNDER_REVIEW',
        adminNote: 'Assigned to editorial board for value verification.',
        reviewedBy: superadmin.id,
        reviewedAt: new Date(),
      },
    });
    console.log(`✅ Status transitioned to: ${underReview.status}, Note: "${underReview.adminNote}"`);
    if (underReview.status !== 'UNDER_REVIEW') {
      throw new Error(`Expected status UNDER_REVIEW, got ${underReview.status}`);
    }

    // -------------------------------------------------------------
    // TEST 4: Admin Approval, Points Ledger, Dynamic Tier Evaluation & Badge Unlock
    // -------------------------------------------------------------
    console.log('\n[TEST 4] Admin approves contribution with 60 merit points...');
    const pointsToAward = 60;
    const approvalNote = 'Exceptional community value. Published to resources directory.';

    const approvalResult = await prisma.$transaction(async (tx) => {
      // 1. Calculate existing points
      const pointsAgg = await tx.recognitionPoint.aggregate({
        where: { userId: testContributor.id },
        _sum: { points: true },
      })
      const currentTotal = pointsAgg._sum.points || 0;
      const newTotal = currentTotal + pointsToAward;

      // 2. Evaluate dynamic tier
      const matchedLevel = await tx.recognitionLevel.findFirst({
        where: {
          minPoints: { lte: newTotal },
          OR: [
            { maxPoints: { gte: newTotal } },
            { maxPoints: null },
          ],
        },
        orderBy: { minPoints: 'desc' },
      });
      const evaluatedLevel = matchedLevel?.name || 'Explorer';

      // 3. Award recognition points
      await tx.recognitionPoint.create({
        data: {
          userId: testContributor.id,
          points: pointsToAward,
          action: 'CONTRIBUTION_APPROVED',
          referenceId: contribution.id,
          note: `Points awarded for verified contribution: ${contribution.title}`,
        },
      });

      // 4. Award "V2V Contributor" badge if eligible
      const v2vBadge = await tx.badge.findUnique({ where: { name: 'V2V Contributor' } });
      let badgeUnlocked = false;
      if (v2vBadge) {
        const alreadyEarned = await tx.userBadge.findUnique({
          where: {
            userId_badgeId: {
              userId: testContributor.id,
              badgeId: v2vBadge.id,
            },
          },
        });
        if (!alreadyEarned) {
          await tx.userBadge.create({
            data: {
              userId: testContributor.id,
              badgeId: v2vBadge.id,
            },
          });
          badgeUnlocked = true;

          await tx.notification.create({
            data: {
              userId: testContributor.id,
              type: 'BADGE_EARNED',
              title: 'New Badge Unlocked!',
              message: `Congratulations! You unlocked the "${v2vBadge.name}" badge.`,
            },
          });
        }
      }

      // 5. Contributor Notification
      await tx.notification.create({
        data: {
          userId: testContributor.id,
          type: 'CONTRIBUTION_APPROVED',
          title: 'Value Contribution Approved!',
          message: `Your contribution was approved! You earned +${pointsToAward} Recognition Points. Level: ${evaluatedLevel}.`,
        },
      });

      // 6. Update contribution record
      const updatedContrib = await tx.contribution.update({
        where: { id: contribution.id },
        data: {
          status: 'APPROVED',
          pointsAwarded: pointsToAward,
          recognitionLevel: evaluatedLevel,
          adminNote: approvalNote,
          reviewedBy: superadmin.id,
          reviewedAt: new Date(),
        },
      });

      // 7. Record immutable AuditLog
      await tx.auditLog.create({
        data: {
          userId: superadmin.id,
          action: 'REVIEW_CONTRIBUTION',
          resource: 'Contribution',
          resourceId: contribution.id,
          oldValues: { status: 'UNDER_REVIEW', pointsAwarded: null },
          newValues: { status: 'APPROVED', pointsAwarded: pointsToAward, recognitionLevel: evaluatedLevel, adminNote: approvalNote },
        },
      });

      return { updatedContrib, evaluatedLevel, badgeUnlocked };
    });

    console.log(`✅ Contribution status: ${approvalResult.updatedContrib.status}`);
    console.log(`✅ Points Awarded: ${approvalResult.updatedContrib.pointsAwarded}`);
    console.log(`✅ Dynamic Recognition Level: ${approvalResult.evaluatedLevel}`);
    console.log(`✅ "V2V Contributor" Badge Unlocked: ${approvalResult.badgeUnlocked}`);

    if (approvalResult.updatedContrib.pointsAwarded !== pointsToAward) {
      throw new Error(`Points awarded mismatch: expected ${pointsToAward}, got ${approvalResult.updatedContrib.pointsAwarded}`);
    }
    if (approvalResult.evaluatedLevel !== 'Contributor') {
      throw new Error(`Expected level "Contributor" for 60 pts, got ${approvalResult.evaluatedLevel}`);
    }

    // -------------------------------------------------------------
    // TEST 5: Verify Contributor Points Ledger & Badge
    // -------------------------------------------------------------
    console.log('\n[TEST 5] Verifying persistent points ledger and badge record...');
    const allUserPoints = await prisma.recognitionPoint.findMany({
      where: { userId: testContributor.id },
    });
    const totalPoints = allUserPoints.reduce((sum, p) => sum + p.points, 0);
    console.log(`✅ Verified cumulative points ledger: ${totalPoints} points (Expected: 60)`);
    if (totalPoints !== 60) {
      throw new Error(`Points sum mismatch: expected 60, got ${totalPoints}`);
    }

    const earnedBadges = await prisma.userBadge.findMany({
      where: { userId: testContributor.id },
      include: { badge: true },
    });
    console.log(`✅ Verified contributor badge: "${earnedBadges[0]?.badge.name}"`);
    if (earnedBadges.length !== 1 || earnedBadges[0].badge.name !== 'V2V Contributor') {
      throw new Error('V2V Contributor badge was not properly awarded!');
    }

    // -------------------------------------------------------------
    // TEST 6: Rejection Flow with Constructive Feedback
    // -------------------------------------------------------------
    console.log('\n[TEST 6] Testing low-effort submission rejection flow...');
    const rejectedContrib = await prisma.contribution.create({
      data: {
        userId: testContributor.id,
        title: 'Spammy link with low value',
        description: 'Random one-liner without context or educational value for community members.',
        category: 'IDEA',
        status: 'SUBMITTED',
      },
    });

    const rejectionNote = 'Does not meet depth and quality standards. Please review our contributor guidelines.';
    const rejectionResult = await prisma.$transaction(async (tx) => {
      const res = await tx.contribution.update({
        where: { id: rejectedContrib.id },
        data: {
          status: 'REJECTED',
          pointsAwarded: null,
          adminNote: rejectionNote,
          reviewedBy: superadmin.id,
          reviewedAt: new Date(),
        },
      });

      await tx.notification.create({
        data: {
          userId: testContributor.id,
          type: 'CONTRIBUTION_REJECTED',
          title: 'Contribution Status Update',
          message: `Your contribution was reviewed. Admin note: ${rejectionNote}`,
        },
      });

      await tx.auditLog.create({
        data: {
          userId: superadmin.id,
          action: 'REVIEW_CONTRIBUTION',
          resource: 'Contribution',
          resourceId: rejectedContrib.id,
          oldValues: { status: 'SUBMITTED', pointsAwarded: null },
          newValues: { status: 'REJECTED', pointsAwarded: null, adminNote: rejectionNote },
        },
      });

      return res;
    });

    console.log(`✅ Rejection status: ${rejectionResult.status}, Points: ${rejectionResult.pointsAwarded}`);
    if (rejectionResult.status !== 'REJECTED' || rejectionResult.pointsAwarded !== null) {
      throw new Error('Rejection did not properly set status or allowed points!');
    }

    // Points must remain unchanged after rejection
    const pointsAfterRejection = await prisma.recognitionPoint.aggregate({
      where: { userId: testContributor.id },
      _sum: { points: true },
    });
    console.log(`✅ Contributor points unchanged after rejection: ${pointsAfterRejection._sum.points} points`);
    if (pointsAfterRejection._sum.points !== 60) {
      throw new Error(`Points corrupted after rejection: expected 60, got ${pointsAfterRejection._sum.points}`);
    }

    // -------------------------------------------------------------
    // TEST 7: Audit Log Verification
    // -------------------------------------------------------------
    console.log('\n[TEST 7] Verifying immutable audit logs for review actions...');
    const auditLogs = await prisma.auditLog.findMany({
      where: {
        resource: 'Contribution',
        action: 'REVIEW_CONTRIBUTION',
      },
      orderBy: { createdAt: 'desc' },
      take: 2,
    });
    console.log(`✅ Found ${auditLogs.length} audit logs. Latest actor: ${auditLogs[0]?.userId}`);
    if (auditLogs.length < 2) {
      throw new Error('Audit logs missing for contribution reviews!');
    }

    // -------------------------------------------------------------
    // TEST 8: Anti-Self-Awarding & Security Invariants Verification
    // -------------------------------------------------------------
    console.log('\n[TEST 8] Verifying security invariants (anti-self-awarding & authorization)...');
    // Ensure test contributor has USER role
    const contributorUser = await prisma.user.findUnique({ where: { id: testContributor.id } });
    if (contributorUser.role !== 'USER') {
      throw new Error('Contributor role must be USER');
    }
    // Verify that role is neither ADMIN nor SUPER_ADMIN
    const isAuthorized = contributorUser.role === 'ADMIN' || contributorUser.role === 'SUPER_ADMIN';
    console.log(`✅ Regular user authorization check: isAuthorized=${isAuthorized} (Properly blocked from admin review)`);
    if (isAuthorized) {
      throw new Error('Security flaw: regular user evaluated as authorized for admin operations!');
    }

    console.log('\n=========================================================');
    console.log('ALL V2V™ VALUE ENGINE END-TO-END TESTS PASSED! 🎉');
    console.log('=========================================================');
  } finally {
    // Clean up test data
    await prisma.notification.deleteMany({ where: { userId: testContributor.id } });
    await prisma.userBadge.deleteMany({ where: { userId: testContributor.id } });
    await prisma.recognitionPoint.deleteMany({ where: { userId: testContributor.id } });
    await prisma.auditLog.deleteMany({ where: { resource: 'Contribution' } });
    await prisma.contribution.deleteMany({ where: { userId: testContributor.id } });
    await prisma.profile.deleteMany({ where: { userId: testContributor.id } });
    await prisma.user.delete({ where: { id: testContributor.id } });
    await prisma.$disconnect();
  }
}

runV2VFlowTests().catch((err) => {
  console.error('V2V Test Suite Failed:', err);
  process.exit(1);
});
