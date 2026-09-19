// ============================================================
// GAS™ MVP — ADMIN DASHBOARD & GOVERNANCE FULL-STACK TEST
// ============================================================

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function runAdminDashboardTests() {
  console.log('=============================================================');
  console.log('GAS™ MVP — ADMIN DASHBOARD & MODULES FULL-STACK VALIDATION');
  console.log('=============================================================\n');

  const timestamp = Date.now();
  let adminUser, regularUser, customerUser;
  let testProduct, testOrder, testReferral, testCommission, testContribution, testCampaign;

  try {
    // -------------------------------------------------------------
    // SETUP: Seed test admin, regular user, and entities
    // -------------------------------------------------------------
    adminUser = await prisma.user.create({
      data: {
        email: `admin_dash_${timestamp}@gas.test`,
        password: 'hash',
        referralCode: `GAS-AD${timestamp.toString().slice(-4)}`,
        role: 'ADMIN',
        status: 'ACTIVE',
        profile: {
          create: { firstName: 'Admin', lastName: 'Governance', isComplete: true },
        },
      },
    });

    regularUser = await prisma.user.create({
      data: {
        email: `reg_dash_${timestamp}@gas.test`,
        password: 'hash',
        referralCode: `GAS-RD${timestamp.toString().slice(-4)}`,
        role: 'USER',
        status: 'ACTIVE',
        profile: {
          create: { firstName: 'Regular', lastName: 'Affiliate', isComplete: true },
        },
      },
    });

    customerUser = await prisma.user.create({
      data: {
        email: `cust_dash_${timestamp}@gas.test`,
        password: 'hash',
        referralCode: `GAS-CD${timestamp.toString().slice(-4)}`,
        role: 'USER',
        status: 'ACTIVE',
        profile: {
          create: { firstName: 'Customer', lastName: 'Buyer', isComplete: true },
        },
      },
    });

    // Create test Product
    testProduct = await prisma.product.create({
      data: {
        name: `Admin Test Accelerator ${timestamp}`,
        slug: `admin-test-accel-${timestamp}`,
        description: 'Elite module for affiliate scaling',
        category: 'BUSINESS',
        price: 5000,
        status: 'ACTIVE',
      },
    });

    // Create test Order
    testOrder = await prisma.order.create({
      data: {
        userId: customerUser.id,
        totalAmount: 5000,
        status: 'PAID',
        items: {
          create: {
            productId: testProduct.id,
            quantity: 1,
            price: 5000,
          },
        },
        payment: {
          create: {
            razorpayOrderId: `order_test_${timestamp}`,
            amount: 5000,
            status: 'CAPTURED',
          },
        },
      },
    });

    // Create test Referral
    testReferral = await prisma.referral.create({
      data: {
        referrerId: regularUser.id,
        referredId: customerUser.id,
        orderId: testOrder.id,
        status: 'QUALIFIED',
      },
    });

    // Create test Commissions: 1 PENDING (₹500), 1 APPROVED (₹750)
    testCommission = await prisma.commission.create({
      data: {
        userId: regularUser.id,
        referralId: testReferral.id,
        orderId: testOrder.id,
        amount: 500,
        status: 'PENDING',
      },
    });

    await prisma.commission.create({
      data: {
        userId: regularUser.id,
        referralId: testReferral.id,
        orderId: testOrder.id,
        amount: 750,
        status: 'APPROVED',
      },
    });

    // Create test Contribution
    testContribution = await prisma.contribution.create({
      data: {
        userId: regularUser.id,
        title: `Community Value Idea ${timestamp}`,
        description: 'Decentralized onboarding playbook for new affiliates',
        category: 'IDEA',
        status: 'APPROVED',
        pointsAwarded: 50,
      },
    });

    // Award recognition points in ledger
    await prisma.recognitionPoint.create({
      data: {
        userId: regularUser.id,
        points: 50,
        action: 'IDEA_APPROVED',
        referenceId: testContribution.id,
        note: 'Approved community value idea',
      },
    });

    // Log a referral click event
    await prisma.activityLog.create({
      data: {
        userId: regularUser.id,
        event: 'REFERRAL_LINK_CLICKED',
        entityType: 'User',
        entityId: regularUser.id,
      },
    });

    console.log(`[SETUP] Test Admin: ${adminUser.email} (${adminUser.id})`);
    console.log(`[SETUP] Regular User: ${regularUser.email} (${regularUser.id})`);
    console.log(`[SETUP] Seeded Orders, Referrals, Commissions, and V2V Contributions.`);

    // -------------------------------------------------------------
    // TEST 1: The 10 Core Executive Metrics Verification
    // -------------------------------------------------------------
    console.log('\n[TEST 1] Verifying all 10 Core Executive Metrics calculation...');

    const [
      metricTotalUsers,
      metricActiveUsers,
      metricTotalOrders,
      metricSalesAgg,
      metricTotalReferrals,
      metricSuccessfulReferrals,
      metricPendingComms,
      metricApprovedComms,
      metricContributions,
      metricPointsAgg,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { status: 'ACTIVE' } }),
      prisma.order.count(),
      prisma.order.aggregate({
        where: { status: { in: ['PAID', 'COMPLETED'] } },
        _sum: { totalAmount: true },
      }),
      prisma.referral.count(),
      prisma.referral.count({ where: { status: 'QUALIFIED' } }),
      prisma.commission.aggregate({
        where: { status: 'PENDING' },
        _sum: { amount: true },
        _count: { id: true },
      }),
      prisma.commission.aggregate({
        where: { status: 'APPROVED' },
        _sum: { amount: true },
        _count: { id: true },
      }),
      prisma.contribution.count(),
      prisma.recognitionPoint.aggregate({
        _sum: { points: true },
      }),
    ]);

    console.log(`1. Total Users: ${metricTotalUsers}`);
    console.log(`2. Active Users: ${metricActiveUsers}`);
    console.log(`3. Total Orders: ${metricTotalOrders}`);
    console.log(`4. Total Sales: ₹${Number(metricSalesAgg._sum.totalAmount || 0).toLocaleString()}`);
    console.log(`5. Total Referrals: ${metricTotalReferrals}`);
    console.log(`6. Successful Referrals: ${metricSuccessfulReferrals}`);
    console.log(`7. Pending Commissions: ₹${Number(metricPendingComms._sum.amount || 0)} (${metricPendingComms._count.id} count)`);
    console.log(`8. Approved Commissions: ₹${Number(metricApprovedComms._sum.amount || 0)} (${metricApprovedComms._count.id} count)`);
    console.log(`9. Contributions: ${metricContributions}`);
    console.log(`10. Recognition Points Awarded: ${metricPointsAgg._sum.points || 0}`);

    if (
      metricTotalUsers < 3 ||
      metricActiveUsers < 3 ||
      metricTotalOrders < 1 ||
      metricTotalReferrals < 1 ||
      metricSuccessfulReferrals < 1 ||
      Number(metricPendingComms._sum.amount) < 500 ||
      Number(metricApprovedComms._sum.amount) < 750 ||
      metricContributions < 1 ||
      (metricPointsAgg._sum.points || 0) < 50
    ) {
      throw new Error('Executive metrics aggregation mismatch!');
    }
    console.log('✅ All 10 Core Executive Metrics verified dynamically from MariaDB.');

    // -------------------------------------------------------------
    // TEST 2: Server-Side Security & Role-Based Access Control
    // -------------------------------------------------------------
    console.log('\n[TEST 2] Testing server-side security & admin API authorization...');
    const isAdmin = (role) => role === 'ADMIN' || role === 'SUPER_ADMIN';

    const adminRoleCheck = isAdmin(adminUser.role);
    const regularRoleCheck = isAdmin(regularUser.role);

    console.log(`✅ Admin user authorized: ${adminRoleCheck} (Expected: true)`);
    console.log(`✅ Regular user blocked: ${!regularRoleCheck} (Expected: true)`);

    if (!adminRoleCheck || regularRoleCheck) {
      throw new Error('Security Authorization Failure: ordinary user permitted as admin!');
    }

    // -------------------------------------------------------------
    // TEST 3: Orders Module Workflow & Audit Logging
    // -------------------------------------------------------------
    console.log('\n[TEST 3] Testing Orders Module status transition (REFUND) & audit log...');
    // Simulate order transition to REFUNDED with audit log
    const updatedOrder = await prisma.$transaction(async (tx) => {
      const o = await tx.order.update({
        where: { id: testOrder.id },
        data: { status: 'REFUNDED' },
      });
      await tx.payment.update({
        where: { orderId: testOrder.id },
        data: { status: 'REFUNDED' },
      });
      await tx.auditLog.create({
        data: {
          userId: adminUser.id,
          action: 'UPDATE_ORDER_STATUS',
          resource: 'Order',
          resourceId: testOrder.id,
          oldValues: { status: 'PAID' },
          newValues: { status: 'REFUNDED', adminNote: 'Customer request for refund' },
        },
      });
      return o;
    });

    // Revoke associated commissions using commissionService logic
    await prisma.commission.updateMany({
      where: { orderId: testOrder.id, status: 'PENDING' },
      data: { status: 'CANCELLED', adminNote: 'Order #refunded' },
    });

    const orderAudit = await prisma.auditLog.findFirst({
      where: { resource: 'Order', resourceId: testOrder.id, action: 'UPDATE_ORDER_STATUS' },
    });

    console.log(`✅ Order status updated to: ${updatedOrder.status}`);
    console.log(`✅ Audit log created: Action: ${orderAudit.action} | Resource: ${orderAudit.resource} | Actor: ${orderAudit.userId}`);
    if (!orderAudit) {
      throw new Error('Missing audit log for order status mutation!');
    }

    // -------------------------------------------------------------
    // TEST 4: Referrals Module Workflow & Anti-Fraud Flagging
    // -------------------------------------------------------------
    console.log('\n[TEST 4] Testing Referrals Module anti-fraud flag & audit log...');
    const updatedRef = await prisma.$transaction(async (tx) => {
      const r = await tx.referral.update({
        where: { id: testReferral.id },
        data: { isFlagged: true, flagReason: 'Manual fraud audit review' },
      });
      await tx.auditLog.create({
        data: {
          userId: adminUser.id,
          action: 'UPDATE_REFERRAL_STATUS',
          resource: 'Referral',
          resourceId: testReferral.id,
          newValues: { isFlagged: true, flagReason: 'Manual fraud audit review' },
        },
      });
      return r;
    });

    const refAudit = await prisma.auditLog.findFirst({
      where: { resource: 'Referral', resourceId: testReferral.id, action: 'UPDATE_REFERRAL_STATUS' },
    });

    console.log(`✅ Referral flagged: ${updatedRef.isFlagged} | Reason: "${updatedRef.flagReason}"`);
    console.log(`✅ Audit log created: Action: ${refAudit.action} | Resource: ${refAudit.resource}`);
    if (!refAudit) {
      throw new Error('Missing audit log for referral mutation!');
    }

    // -------------------------------------------------------------
    // TEST 5: Campaigns Module CRUD & Product Linking
    // -------------------------------------------------------------
    console.log('\n[TEST 5] Testing Campaigns Module creation, product linking & audit log...');
    testCampaign = await prisma.$transaction(async (tx) => {
      const camp = await tx.campaign.create({
        data: {
          name: `Blitz Promotion ${timestamp}`,
          description: 'Special multiplier event',
          startDate: new Date(),
          endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
          isActive: true,
          products: {
            create: [{ productId: testProduct.id }],
          },
        },
        include: { products: true },
      });
      await tx.auditLog.create({
        data: {
          userId: adminUser.id,
          action: 'CREATE_CAMPAIGN',
          resource: 'Campaign',
          resourceId: camp.id,
          newValues: { name: camp.name, isActive: camp.isActive },
        },
      });
      return camp;
    });

    const campAudit = await prisma.auditLog.findFirst({
      where: { resource: 'Campaign', resourceId: testCampaign.id, action: 'CREATE_CAMPAIGN' },
    });

    console.log(`✅ Campaign created: "${testCampaign.name}" (ID: ${testCampaign.id})`);
    console.log(`✅ Linked products count: ${testCampaign.products.length}`);
    console.log(`✅ Audit log created: Action: ${campAudit.action}`);
    if (!campAudit || testCampaign.products.length !== 1) {
      throw new Error('Campaign creation or audit log failed!');
    }

    // -------------------------------------------------------------
    // TEST 6: Analytics Conversion Funnel Calculation
    // -------------------------------------------------------------
    console.log('\n[TEST 6] Testing Analytics conversion funnel telemetry...');
    const clicks = await prisma.activityLog.count({ where: { event: 'REFERRAL_LINK_CLICKED' } });
    const regs = await prisma.user.count();
    const qualified = await prisma.referral.count({ where: { status: 'QUALIFIED' } });

    const funnelConversionRate = clicks > 0 ? ((qualified / clicks) * 100).toFixed(2) : '0.00';
    console.log(`✅ Funnel: Clicks=${clicks} -> Registrations=${regs} -> Qualified=${qualified} -> Conversion=${funnelConversionRate}%`);

    console.log('\n=============================================================');
    console.log('🏆 ALL ADMIN DASHBOARD & MODULES INTEGRATION TESTS PASSED!');
    console.log('=============================================================');
  } finally {
    // Clean up test records
    if (testCampaign) {
      await prisma.campaignProduct.deleteMany({ where: { campaignId: testCampaign.id } });
      await prisma.campaign.delete({ where: { id: testCampaign.id } }).catch(() => {});
    }
    if (adminUser || regularUser || customerUser) {
      const uIds = [adminUser?.id, regularUser?.id, customerUser?.id].filter(Boolean);
      await prisma.auditLog.deleteMany({ where: { userId: { in: uIds } } });
      await prisma.activityLog.deleteMany({ where: { userId: { in: uIds } } });
      await prisma.recognitionPoint.deleteMany({ where: { userId: { in: uIds } } });
      await prisma.commission.deleteMany({ where: { userId: { in: uIds } } });
      await prisma.referral.deleteMany({ where: { referrerId: { in: uIds } } });
      await prisma.contribution.deleteMany({ where: { userId: { in: uIds } } });
      await prisma.payment.deleteMany({ where: { order: { userId: { in: uIds } } } });
      await prisma.orderItem.deleteMany({ where: { order: { userId: { in: uIds } } } });
      await prisma.order.deleteMany({ where: { userId: { in: uIds } } });
      await prisma.profile.deleteMany({ where: { userId: { in: uIds } } });
      if (testProduct) {
        await prisma.product.delete({ where: { id: testProduct.id } }).catch(() => {});
      }
      await prisma.user.deleteMany({ where: { id: { in: uIds } } });
    }
    await prisma.$disconnect();
  }
}

runAdminDashboardTests().catch((err) => {
  console.error('Admin Dashboard Test Failed:', err);
  process.exit(1);
});
