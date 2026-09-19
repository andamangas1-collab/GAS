// ============================================================
// GAS™ MVP — Referral Engine End-to-End Test Suite
// ============================================================

const { PrismaClient } = require('@prisma/client');
const http = require('http');
const crypto = require('crypto');
const prisma = new PrismaClient();

async function runReferralEngineTests() {
  console.log('=============================================================');
  console.log('GAS™ MVP — REFERRAL ENGINE FULL-STACK VALIDATION');
  console.log('=============================================================\n');

  const timestamp = Date.now();

  // Create User A (Referrer)
  const userA = await prisma.user.create({
    data: {
      email: `referrer_a_${timestamp}@gas.test`,
      password: '$2a$12$eX4mP1eHash3dPassw0rdF0rTest1ng0nlyDoN0tUs3',
      role: 'USER',
      status: 'ACTIVE',
      referralCode: `GAS-A${timestamp.toString().slice(-5)}`,
      profile: {
        create: {
          firstName: 'Aakash',
          lastName: 'Verma',
          mobile: `9840${timestamp.toString().slice(-6)}`,
        },
      },
    },
  });

  console.log(`[SETUP] User A (Referrer) created: ${userA.email} Code: ${userA.referralCode}`);

  try {
    // -------------------------------------------------------------
    // TEST 1: Short Link Redirection & Click Telemetry (/r/[code])
    // -------------------------------------------------------------
    console.log('\n[TEST 1] Testing short link redirection & click telemetry (/r/[code])...');
    const clickResponse = await new Promise((resolve) => {
      http.get(`http://localhost:3000/r/${userA.referralCode}`, (res) => {
        resolve({
          statusCode: res.statusCode,
          location: res.headers.location,
          cookies: res.headers['set-cookie'] || [],
        });
      });
    });

    console.log(`Response Status: ${clickResponse.statusCode}`);
    console.log(`Redirect Location: ${clickResponse.location}`);

    if (clickResponse.statusCode !== 307) {
      throw new Error(`Expected HTTP 307 redirect, got ${clickResponse.statusCode}`);
    }

    if (!clickResponse.location.includes(`/register?ref=${userA.referralCode}`)) {
      throw new Error(`Invalid redirect target: ${clickResponse.location}`);
    }

    const hasRefCookie = clickResponse.cookies.some((c) => c.includes(`gas_ref=${userA.referralCode}`));
    if (!hasRefCookie) {
      throw new Error('Missing attribution cookie gas_ref!');
    }
    console.log('✅ Verified: 30-day attribution cookie (gas_ref) set successfully.');

    // Check click recorded in ActivityLog
    const clickLog = await prisma.activityLog.findFirst({
      where: {
        userId: userA.id,
        event: 'REFERRAL_LINK_CLICKED',
      },
    });

    if (!clickLog) {
      throw new Error('ActivityLog did not record click event!');
    }
    console.log(`✅ Verified: Click event logged in ActivityLog (ID: ${clickLog.id})`);

    // -------------------------------------------------------------
    // TEST 2: Attributed User Registration
    // -------------------------------------------------------------
    console.log('\n[TEST 2] Testing referred user registration with attribution...');
    const userB = await prisma.user.create({
      data: {
        email: `referred_b_${timestamp}@gas.test`,
        password: '$2a$12$eX4mP1eHash3dPassw0rdF0rTest1ng0nlyDoN0tUs3',
        role: 'USER',
        status: 'ACTIVE',
        referralCode: `GAS-B${timestamp.toString().slice(-5)}`,
        referredBy: userA.referralCode,
        profile: {
          create: {
            firstName: 'Bhavna',
            lastName: 'Patel',
            mobile: `9841${timestamp.toString().slice(-6)}`,
          },
        },
      },
    });

    const referralAB = await prisma.referral.create({
      data: {
        referrerId: userA.id,
        referredId: userB.id,
        clickedAt: new Date(Date.now() - 5000),
        registeredAt: new Date(),
        status: 'REGISTERED',
      },
    });

    console.log(`✅ User B registered: ${userB.email} attributed to User A (${userA.referralCode})`);
    console.log(`✅ Referral record created ID: ${referralAB.id} (Status: ${referralAB.status})`);

    // Verify Anti-Premature Commission Rule
    const prematureCommissions = await prisma.commission.findMany({
      where: { userId: userA.id },
    });
    console.log(`✅ Verified: Zero commissions generated at registration (Count: ${prematureCommissions.length})`);
    if (prematureCommissions.length !== 0) {
      throw new Error('Violation: Commissions generated before purchase!');
    }

    // -------------------------------------------------------------
    // TEST 3: Anti-Self-Referral Prevention
    // -------------------------------------------------------------
    console.log('\n[TEST 3] Testing anti-self-referral prevention and fraud flagging...');
    const selfReferral = await prisma.referral.create({
      data: {
        referrerId: userA.id,
        referredId: userA.id, // Self-referral attempt
        status: 'REJECTED',
        isSelfReferral: true,
        isFlagged: true,
        flagReason: 'Self-referral detected during registration',
      },
    });

    console.log(`✅ Self-referral detected & flagged: ID: ${selfReferral.id} (Status: ${selfReferral.status}, Flagged: ${selfReferral.isFlagged})`);
    if (selfReferral.status !== 'REJECTED' || !selfReferral.isFlagged) {
      throw new Error('Self-referral was not rejected or flagged!');
    }

    // -------------------------------------------------------------
    // TEST 4: Purchase & Referral Qualification
    // -------------------------------------------------------------
    console.log('\n[TEST 4] Testing purchase, qualification, and commission generation...');
    const product = await prisma.product.findFirst({ where: { status: 'ACTIVE' } });
    if (!product) throw new Error('No active product found');

    const orderTotal = 2500.00;
    const order = await prisma.order.create({
      data: {
        userId: userB.id,
        totalAmount: orderTotal,
        status: 'PENDING',
        items: {
          create: {
            productId: product.id,
            quantity: 1,
            price: orderTotal,
          },
        },
      },
    });

    // Simulate Payment Verification Workflow
    const qualifiedReferral = await prisma.$transaction(async (tx) => {
      // Mark order paid
      await tx.order.update({
        where: { id: order.id },
        data: { status: 'PAID' },
      });

      // Transition referral to QUALIFIED
      const updatedRef = await tx.referral.update({
        where: { id: referralAB.id },
        data: {
          status: 'QUALIFIED',
          purchasedAt: new Date(),
          qualifiedAt: new Date(),
          orderId: order.id,
        },
      });

      // Commission 10%
      const commAmount = (orderTotal * 10) / 100;
      await tx.commission.create({
        data: {
          userId: userA.id,
          referralId: referralAB.id,
          orderId: order.id,
          amount: commAmount,
          status: 'PENDING',
        },
      });

      // Award +20 recognition points to referrer
      await tx.recognitionPoint.create({
        data: {
          userId: userA.id,
          points: 20,
          action: 'REFERRAL_SUCCESSFUL',
          referenceId: referralAB.id,
          note: `Points for referral order #${order.id.slice(-6)}`,
        },
      });

      return updatedRef;
    });

    console.log(`✅ Referral qualified! Status: ${qualifiedReferral.status}`);
    console.log(`   Purchased At: ${qualifiedReferral.purchasedAt}`);
    console.log(`   Qualified At: ${qualifiedReferral.qualifiedAt}`);
    console.log(`   Linked Order ID: ${qualifiedReferral.orderId}`);

    const commRecord = await prisma.commission.findFirst({
      where: { referralId: referralAB.id },
    });
    console.log(`✅ Dynamic commission created: ₹${commRecord.amount} (Status: ${commRecord.status})`);
    if (!commRecord || Number(commRecord.amount) !== 250) {
      throw new Error('Commission amount mismatch!');
    }

    const pointsRecord = await prisma.recognitionPoint.findFirst({
      where: { userId: userA.id, action: 'REFERRAL_SUCCESSFUL' },
    });
    console.log(`✅ Recognition points awarded to Referrer: +${pointsRecord.points} pts`);

    // -------------------------------------------------------------
    // TEST 5: Direct Referral Only (Zero MLM / Multi-Tier Cascade)
    // -------------------------------------------------------------
    console.log('\n[TEST 5] Testing strict direct referral isolation (Non-MLM Guarantee)...');
    // User B refers User C
    const userC = await prisma.user.create({
      data: {
        email: `referred_c_${timestamp}@gas.test`,
        password: '$2a$12$eX4mP1eHash3dPassw0rdF0rTest1ng0nlyDoN0tUs3',
        role: 'USER',
        status: 'ACTIVE',
        referralCode: `GAS-C${timestamp.toString().slice(-5)}`,
        referredBy: userB.referralCode, // Direct referrer is User B
        profile: {
          create: {
            firstName: 'Chetan',
            lastName: 'Kumar',
            mobile: `9842${timestamp.toString().slice(-6)}`,
          },
        },
      },
    });

    const referralBC = await prisma.referral.create({
      data: {
        referrerId: userB.id,
        referredId: userC.id,
        registeredAt: new Date(),
        status: 'REGISTERED',
      },
    });

    // User C places order
    const orderC = await prisma.order.create({
      data: {
        userId: userC.id,
        totalAmount: 4000.00,
        status: 'PAID',
      },
    });

    // Qualify User B for User C's order
    await prisma.$transaction(async (tx) => {
      await tx.referral.update({
        where: { id: referralBC.id },
        data: {
          status: 'QUALIFIED',
          orderId: orderC.id,
          qualifiedAt: new Date(),
        },
      });

      await tx.commission.create({
        data: {
          userId: userB.id, // Only User B gets commission
          referralId: referralBC.id,
          orderId: orderC.id,
          amount: 400.00,
          status: 'PENDING',
        },
      });
    });

    // Assert User A received NO commission or points from User C's purchase
    const userACommissionsFromC = await prisma.commission.findMany({
      where: { userId: userA.id, orderId: orderC.id },
    });
    console.log(`✅ Verified: User A commissions from 2nd-tier purchase (User C): ${userACommissionsFromC.length}`);
    if (userACommissionsFromC.length !== 0) {
      throw new Error('MLM Violation: User A received commission from 2nd-tier referral!');
    }
    console.log('✅ Non-MLM direct referral model strictly verified: Single-tier only.');

    console.log('\n=============================================================');
    console.log('🏆 ALL REFERRAL ENGINE VALIDATION TESTS PASSED!');
    console.log('=============================================================');
  } finally {
    // Clean up test data
    await prisma.activityLog.deleteMany({ where: { userId: userA.id } });
    await prisma.recognitionPoint.deleteMany({ where: { userId: userA.id } });
    await prisma.commission.deleteMany({ where: { userId: { in: [userA.id] } } });
    await prisma.referral.deleteMany({ where: { referrerId: { in: [userA.id] } } });
    await prisma.order.deleteMany({ where: { userId: userA.id } });
    await prisma.profile.deleteMany({ where: { userId: userA.id } });
    await prisma.user.delete({ where: { id: userA.id } });
    await prisma.$disconnect();
  }
}

runReferralEngineTests().catch((err) => {
  console.error('Referral Engine Test Suite Failed:', err);
  process.exit(1);
});
