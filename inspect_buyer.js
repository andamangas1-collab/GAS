const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function inspectBuyer() {
  const buyer = await prisma.user.findUnique({
    where: { email: "buyer_test@example.com" },
    include: {
      ordersPlaced: true,
      referralsMade: true,
      referralsReceived: true,
      commissions: true,
      contributions: true,
      recognitionPoints: true,
      userBadges: true,
      notifications: true,
      activityLogs: true,
      auditLogs: true
    }
  });
  console.log("Buyer Relations:", JSON.stringify(buyer, null, 2));
}

inspectBuyer()
  .catch(console.error)
  .finally(() => prisma.$disconnect());