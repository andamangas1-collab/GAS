const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const prisma = new PrismaClient();

async function deepAudit() {
  console.log("=== EXECUTING DEEP CROSS-CHECK AUDIT ===");

  // 1. Table Records Check
  const counts = {
    users: await prisma.user.count(),
    profiles: await prisma.profile.count(),
    products: await prisma.product.count(),
    offers: await prisma.offer.count(),
    orders: await prisma.order.count(),
    orderItems: await prisma.orderItem.count(),
    payments: await prisma.payment.count(),
    referrals: await prisma.referral.count(),
    commissions: await prisma.commission.count(),
    commissionRules: await prisma.commissionRule.count(),
    contributions: await prisma.contribution.count(),
    recognitionPoints: await prisma.recognitionPoint.count(),
    recognitionLevels: await prisma.recognitionLevel.count(),
    pointRules: await prisma.pointRule.count(),
    badges: await prisma.badge.count(),
    userBadges: await prisma.userBadge.count(),
    notifications: await prisma.notification.count(),
    campaigns: await prisma.campaign.count(),
    activityLogs: await prisma.activityLog.count(),
    auditLogs: await prisma.auditLog.count()
  };
  console.log("Live Database State:", JSON.stringify(counts, null, 2));

  // 2. Scan for Mock / Dummy / Hardcoded patterns
  const src = 'c:/xampp/htdocs/GAS/src';
  const patterns = ['MOCK', 'MOCKED', 'DUMMY', 'FAKE', 'SIMULATED', 'TODO', 'FIXME'];
  let issues = 0;

  function walk(d) {
    const files = fs.readdirSync(d);
    for (const f of files) {
      const p = path.join(d, f);
      const stat = fs.statSync(p);
      if (stat.isDirectory()) {
        walk(p);
      } else if (f.endsWith('.ts') || f.endsWith('.tsx')) {
        const lines = fs.readFileSync(p, 'utf8').split('\n');
        lines.forEach((l, idx) => {
          patterns.forEach(pat => {
            if (l.toUpperCase().includes(pat)) {
              console.log(`[FLAG] ${path.relative(src, p)}:${idx+1} [${pat}]: ${l.trim()}`);
              issues++;
            }
          });
        });
      }
    }
  }
  walk(src);
  console.log(`Deep code scan complete. Flagged lines: ${issues}`);
}

deepAudit()
  .catch(err => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });