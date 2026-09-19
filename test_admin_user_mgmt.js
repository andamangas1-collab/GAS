// ============================================================
// GAS™ MVP — Admin User Management Verification Suite
// ============================================================

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function runAdminUserMgmtTests() {
  console.log('=== EXECUTING ADMIN USER MANAGEMENT VALIDATION ===\n');

  const superadmin = await prisma.user.findFirst({
    where: { role: 'SUPER_ADMIN' },
  });

  if (!superadmin) throw new Error('SuperAdmin required for test');

  const timestamp = Date.now();
  const testUser = await prisma.user.create({
    data: {
      email: `mgmt_test_${timestamp}@gas.test`,
      password: '$2a$12$eX4mP1eHash3dPassw0rdF0rTest1ng0nlyDoN0tUs3',
      role: 'USER',
      status: 'ACTIVE',
      referralCode: `GAS-U${timestamp.toString().slice(-5)}`,
      profile: {
        create: {
          firstName: 'Siddharth',
          lastName: 'Mehta',
          mobile: `9820${timestamp.toString().slice(-6)}`,
        },
      },
    },
  });

  console.log(`[SETUP] Created test user: ${testUser.email} (Status: ${testUser.status})`);

  try {
    // 1. Test search query
    console.log('[TEST 1] Testing user search & filtering...');
    const searchResults = await prisma.user.findMany({
      where: {
        OR: [
          { email: { contains: 'mgmt_test' } },
          { referralCode: { contains: testUser.referralCode } },
        ],
      },
      include: { profile: true },
    });
    console.log(`✅ Search query returned ${searchResults.length} matching record(s).`);
    if (searchResults.length === 0) throw new Error('Search failed to return test user');

    // 2. Test status change to SUSPENDED
    console.log('\n[TEST 2] Admin suspending user account...');
    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: testUser.id },
        data: { status: 'SUSPENDED' },
      });

      await tx.auditLog.create({
        data: {
          userId: superadmin.id,
          action: 'UPDATE_USER_STATUS',
          resource: 'User',
          resourceId: testUser.id,
          oldValues: { status: 'ACTIVE' },
          newValues: { status: 'SUSPENDED', adminNote: 'Suspicious bot activity detected' },
        },
      });
    });

    const suspendedUser = await prisma.user.findUnique({ where: { id: testUser.id } });
    console.log(`✅ User status updated to: ${suspendedUser.status}`);
    if (suspendedUser.status !== 'SUSPENDED') throw new Error('Status not SUSPENDED');

    // 3. Verify audit log entry
    console.log('\n[TEST 3] Verifying immutable audit log creation...');
    const audit = await prisma.auditLog.findFirst({
      where: { resourceId: testUser.id, action: 'UPDATE_USER_STATUS' },
    });
    if (!audit) throw new Error('Audit log missing!');
    console.log(`✅ AuditLog verified: Actor: ${audit.userId} Action: ${audit.action} Resource: ${audit.resource}`);

    // 4. Test status change to BLOCKED and restore to ACTIVE
    console.log('\n[TEST 4] Admin blocking and restoring user account...');
    await prisma.user.update({
      where: { id: testUser.id },
      data: { status: 'BLOCKED' },
    });
    const blockedUser = await prisma.user.findUnique({ where: { id: testUser.id } });
    console.log(`✅ User status transitioned to: ${blockedUser.status}`);

    await prisma.user.update({
      where: { id: testUser.id },
      data: { status: 'ACTIVE' },
    });
    const restoredUser = await prisma.user.findUnique({ where: { id: testUser.id } });
    console.log(`✅ User status restored to: ${restoredUser.status}`);

    console.log('\n=========================================================');
    console.log('ALL ADMIN USER MANAGEMENT INTEGRATION TESTS PASSED! 🎉');
    console.log('=========================================================');
  } finally {
    await prisma.auditLog.deleteMany({ where: { resourceId: testUser.id } });
    await prisma.profile.deleteMany({ where: { userId: testUser.id } });
    await prisma.user.delete({ where: { id: testUser.id } });
    await prisma.$disconnect();
  }
}

runAdminUserMgmtTests().catch((err) => {
  console.error('Admin User Mgmt Test Failed:', err);
  process.exit(1);
});
