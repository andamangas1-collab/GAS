const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const prisma = new PrismaClient();

async function runAudit() {
  console.log("=== EXECUTING RIGOROUS REPOSITORY AUDIT ===");

  // 1. Database Inspection
  const tableCounts = {
    users: await prisma.user.count(),
    profiles: await prisma.profile.count(),
    products: await prisma.product.count(),
    offers: await prisma.offer.count(),
    orders: await prisma.order.count(),
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
  console.log("Database Records in MariaDB (gas_mvp):", JSON.stringify(tableCounts, null, 2));

  // 2. Scan for Mock / Dummy / Hardcoded patterns in src
  const srcDir = 'c:/xampp/htdocs/GAS/src';
  const patterns = ['MOCK', 'MOCKED', 'DUMMY', 'FAKE', 'SIMULATED', 'FIXME'];
  const findings = [];

  function scanDir(dir) {
    const files = fs.readdirSync(dir);
    for (const f of files) {
      const full = path.join(dir, f);
      const stat = fs.statSync(full);
      if (stat.isDirectory()) {
        scanDir(full);
      } else if (f.endsWith('.ts') || f.endsWith('.tsx')) {
        const text = fs.readFileSync(full, 'utf8');
        const lines = text.split('\n');
        lines.forEach((l, i) => {
          patterns.forEach(p => {
            if (l.toUpperCase().includes(p)) {
              findings.push({ file: path.relative(srcDir, full), line: i + 1, pattern: p, content: l.trim() });
            }
          });
        });
      }
    }
  }
  scanDir(srcDir);
  console.log(`Scan completed across src. Total suspicious mock/dummy patterns found: ${findings.length}`);
  if (findings.length > 0) {
    console.log(findings);
  } else {
    console.log("✅ Zero mock / fake data patterns in src/");
  }
}

runAudit()
  .catch(err => {
    console.error("Audit error:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });