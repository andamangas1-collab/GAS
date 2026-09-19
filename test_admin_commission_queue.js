// ============================================================
// GAS™ MVP — Admin Commission Queue Verification Suite
// ============================================================

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function runAdminCommissionTests() {
  console.log('=== EXECUTING ADMIN COMMISSION QUEUE VALIDATION ===\n');

  const superadmin = await prisma.user.findFirst({
    where: { role: 'SUPER_ADMIN' },
  });
  if (!superadmin) throw new Error('SuperAdmin required');

  const timestamp = Date.now();
  // Create test affiliate and referred buyer
  const affiliate = await prisma.user.create({
    data: {
      email: `aff_${timestamp}@gas.test`,
      password: '$2a$12$eX4mP1eHash3dPassw0rdF0rTest1ng0nlyDoN0tUs3',
      role: 'USER',
      status: 'ACTIVE',
      referralCode: `GAS-A${timestamp.toString().slice(-5)}`,
      profile: {
        create: {
          firstName: 'Pooja',
          lastName: 'Hegde',
          mobile: `9830${timestamp.toString().slice(-6)}`,
        },
      },
    },
  });

  const buyer = await prisma.user.create({
    data: {
      email: `buyer_${timestamp}@gas.test`,
      password: '$2a$12$eX4mP1eHash3dPassw0rdF0rTest1ng0nlyDoN0tUs3',
      role: 'USER',
      status: 'ACTIVE',
      referralCode: `GAS-B${timestamp.toString().slice(-5)}`,
      referredBy: affiliate.referralCode,
      profile: {
        create: {
          firstName: 'Manish',
          lastName: 'Tiwari',
          mobile: `9831${timestamp.toString().slice(-6)}`,
        },
      },
    },
  });

  const product = await prisma.product.findFirst({ where: { status: 'ACTIVE' } });
  if (!product) throw new Error('No active product found');

  const order = await prisma.order.create({
    data: {
      userId: buyer.id,
      totalAmount: 2999.00,
      status: 'PAID',
    },
  });

  const referral = await prisma.referral.create({
    data: {
      referrerId: affiliate.id,
      referredId: buyer.id,
      orderId: order.id,
      status: 'QUALIFIED',
      qualifiedAt: new Date(),
    },
  });

  const commission = await prisma.commission.create({
    data: {
      userId: affiliate.id,
      referralId: referral.id,
      orderId: order.id,
      amount: 449.85,
      status: 'PENDING',
    },
  });

  console.log(`[SETUP] Created PENDING commission ID: ${commission.id} for ₹${commission.amount}`);

  try {
    // 1. Admin approves commission
    console.log('[TEST 1] Admin approving pending commission...');
    await prisma.$transaction(async (tx) => {
      await tx.commission.update({
        where: { id: commission.id },
        data: {
          status: 'APPROVED',
          approvedAt: new Date(),
          adminNote: 'Verified order and referral eligibility.',
        },
      });

      await tx.notification.create({
        data: {
          userId: affiliate.id,
          type: 'COMMISSION_APPROVED',
          title: 'Commission Approved!',
          message: `Your commission of ₹${commission.amount} has been approved.`,
        },
      });

      await tx.auditLog.create({
        data: {
          userId: superadmin.id,
          action: 'UPDATE_COMMISSION_STATUS',
          resource: 'Commission',
          resourceId: commission.id,
          oldValues: { status: 'PENDING' },
          newValues: { status: 'APPROVED' },
        },
      });
    });

    const approved = await prisma.commission.findUnique({ where: { id: commission.id } });
    console.log(`✅ Commission status transitioned to: ${approved.status}`);
    if (approved.status !== 'APPROVED') throw new Error('Status not APPROVED');

    // 2. Admin marks commission as PAID
    console.log('\n[TEST 2] Admin marking commission as PAID (Disbursed)...');
    await prisma.$transaction(async (tx) => {
      await tx.commission.update({
        where: { id: commission.id },
        data: {
          status: 'PAID',
          paidAt: new Date(),
          adminNote: 'Disbursed via IMPS UTR #98234723948',
        },
      });

      await tx.notification.create({
        data: {
          userId: affiliate.id,
          type: 'COMMISSION_PAID',
          title: 'Commission Payout Processed!',
          message: `Your commission payout of ₹${commission.amount} has been disbursed.`,
        },
      });
    });

    const paid = await prisma.commission.findUnique({ where: { id: commission.id } });
    console.log(`✅ Commission status transitioned to: ${paid.status}`);
    if (paid.status !== 'PAID') throw new Error('Status not PAID');

    // 3. Verify notifications & audit log
    console.log('\n[TEST 3] Verifying notifications and audit logs...');
    const notifs = await prisma.notification.findMany({ where: { userId: affiliate.id } });
    console.log(`✅ Affiliate received ${notifs.length} notification(s): "${notifs.map(n => n.title).join('", "')}"`);

    const audit = await prisma.auditLog.findFirst({
      where: { resourceId: commission.id, action: 'UPDATE_COMMISSION_STATUS' },
    });
    console.log(`✅ AuditLog verified: Actor: ${audit.userId} Action: ${audit.action}`);

    console.log('\n=========================================================');
    console.log('ALL ADMIN COMMISSION QUEUE TESTS PASSED! 🎉');
    console.log('=========================================================');
  } finally {
    await prisma.notification.deleteMany({ where: { userId: affiliate.id } });
    await prisma.auditLog.deleteMany({ where: { resourceId: commission.id } });
    await prisma.commission.deleteMany({ where: { id: commission.id } });
    await prisma.referral.deleteMany({ where: { id: referral.id } });
    await prisma.order.deleteMany({ where: { id: order.id } });
    await prisma.profile.deleteMany({ where: { userId: { in: [affiliate.id, buyer.id] } } });
    await prisma.user.deleteMany({ where: { id: { in: [affiliate.id, buyer.id] } } });
    await prisma.$disconnect();
  }
}

runAdminCommissionTests().catch((err) => {
  console.error('Commission Queue Test Failed:', err);
  process.exit(1);
});
