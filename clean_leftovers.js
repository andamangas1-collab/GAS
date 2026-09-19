const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanLeftovers() {
  const buyer = await prisma.user.findUnique({ where: { email: "buyer_test@example.com" } });
  if (buyer) {
    const orders = await prisma.order.findMany({ where: { userId: buyer.id }, select: { id: true } });
    const orderIds = orders.map(o => o.id);

    await prisma.payment.deleteMany({ where: { orderId: { in: orderIds } } });
    await prisma.orderItem.deleteMany({ where: { orderId: { in: orderIds } } });
    await prisma.commission.deleteMany({ where: { orderId: { in: orderIds } } });
    await prisma.recognitionPoint.deleteMany({ where: { userId: buyer.id } });
    await prisma.referral.deleteMany({ where: { OR: [{ referrerId: buyer.id }, { referredId: buyer.id }] } });
    await prisma.activityLog.deleteMany({ where: { userId: buyer.id } });
    await prisma.auditLog.deleteMany({ where: { userId: buyer.id } });
    await prisma.order.deleteMany({ where: { userId: buyer.id } });
    await prisma.profile.deleteMany({ where: { userId: buyer.id } });
    await prisma.user.delete({ where: { id: buyer.id } });
    console.log("Cleaned leftover buyer test user successfully.");
  }
}

cleanLeftovers()
  .catch(console.error)
  .finally(() => prisma.$disconnect());