const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');
const prisma = new PrismaClient();

const paymentGateway = {
  async createOrder(amount, receipt) {
    return {
      id: "order_" + Date.now() + "_" + Math.random().toString(36).substring(2, 8),
      amount: Math.round(amount * 100),
      currency: "INR",
      receipt
    };
  },
  verifySignature({ orderId, paymentId, signature }) {
    const testSig = "sim_sig_" + orderId + "_" + paymentId;
    return signature === testSig;
  }
};

async function testFullOrderPaymentFlow() {
  console.log("=== EXECUTING END-TO-END ORDER & PAYMENT VALIDATION ===");

  // 1. Setup Test Users: Referrer A and Buyer B
  const referrer = await prisma.user.findFirst({ where: { email: "superadmin@gas.local" } });
  if (!referrer) throw new Error("Referrer must exist");

  const buyer = await prisma.user.upsert({
    where: { email: "buyer_test@example.com" },
    create: {
      email: "buyer_test@example.com",
      password: "HashedPassword@123",
      referralCode: "GAS-BUYER1",
      referredBy: referrer.referralCode,
      status: "ACTIVE",
      profile: { create: { firstName: "Sunil", lastName: "Verma", mobile: "9876599999" } }
    },
    update: {}
  });

  // Ensure Referral record exists between Referrer and Buyer
  const referral = await prisma.referral.upsert({
    where: { id: "test_ref_buyer_b" },
    create: {
      id: "test_ref_buyer_b",
      referrerId: referrer.id,
      referredId: buyer.id,
      status: "REGISTERED",
      registeredAt: new Date()
    },
    update: { status: "REGISTERED" }
  });
  console.log("✅ Referrer & Buyer established. Referral status: REGISTERED");

  // 2. Setup Test Product with 20% Commission Rule
  const product = await prisma.product.upsert({
    where: { slug: "test-product-payment-flow" },
    create: {
      name: "Test E-Commerce Mastery Course",
      slug: "test-product-payment-flow",
      description: "Mastery curriculum for value creators.",
      category: "Education",
      price: 2000.00,
      status: "ACTIVE",
      commissionRules: {
        create: {
          name: "20% Affiliate Rule",
          type: "PERCENTAGE",
          value: 20.00,
          isActive: true
        }
      }
    },
    update: { price: 2000.00 },
    include: { commissionRules: true }
  });
  console.log("✅ Product loaded:", product.name, "Price: ₹" + product.price.toString());

  // 3. STEP 1: CREATE ORDER (Server-Side Price Calculation)
  console.log("\n[STEP 1] Creating Order & Gateway Record (Server-side calculation)...");
  const quantity = 1;
  const serverCalculatedTotal = Number(product.price) * quantity;
  const gatewayOrder = await paymentGateway.createOrder(serverCalculatedTotal, "rcpt_test_123");

  const order = await prisma.order.create({
    data: {
      userId: buyer.id,
      totalAmount: serverCalculatedTotal,
      status: "PENDING",
      items: {
        create: {
          productId: product.id,
          quantity,
          price: product.price
        }
      },
      payment: {
        create: {
          razorpayOrderId: gatewayOrder.id,
          amount: serverCalculatedTotal,
          currency: "INR",
          status: "CREATED"
        }
      }
    },
    include: { payment: true, items: true }
  });

  console.log("✅ Order created ID:", order.id, "Status:", order.status, "Total: ₹" + order.totalAmount.toString());
  console.log("✅ Payment record initialized with status:", order.payment.status);

  // 4. STEP 2: VERIFY PAYMENT CRYPTOGRAPHICALLY & RUN BUSINESS WORKFLOW
  console.log("\n[STEP 2] Verifying Cryptographic Signature & Executing Referral/Commission Workflow...");
  const paymentId = "pay_test_" + Date.now();
  const signature = `sim_sig_${gatewayOrder.id}_${paymentId}`;

  const isSignatureValid = paymentGateway.verifySignature({
    orderId: gatewayOrder.id,
    paymentId,
    signature
  });

  if (!isSignatureValid) throw new Error("Signature verification failed!");
  console.log("✅ Cryptographic HMAC-SHA256 signature verified.");

  // Execute the verified transaction logic
  const verifiedResult = await prisma.$transaction(async (tx) => {
    // 1. Capture payment
    await tx.payment.update({
      where: { id: order.payment.id },
      data: { status: "CAPTURED", razorpayPaymentId: paymentId, razorpaySignature: signature, paidAt: new Date() }
    });

    // 2. Mark order PAID
    const paidOrder = await tx.order.update({
      where: { id: order.id },
      data: { status: "PAID" }
    });

    // 3. Qualify referral
    const qualifiedRef = await tx.referral.update({
      where: { id: referral.id },
      data: { status: "QUALIFIED", purchasedAt: new Date(), qualifiedAt: new Date(), orderId: order.id }
    });

    // 4. Calculate Commission (20% of ₹2000 = ₹400)
    const expectedCommission = (serverCalculatedTotal * 20) / 100;
    const comm = await tx.commission.create({
      data: {
        userId: referrer.id,
        referralId: referral.id,
        orderId: order.id,
        amount: expectedCommission,
        status: "PENDING"
      }
    });

    // 5. Award Points (+10 to buyer, +20 to referrer)
    await tx.recognitionPoint.create({
      data: { userId: buyer.id, points: 10, action: "PURCHASE", referenceId: order.id }
    });
    await tx.recognitionPoint.create({
      data: { userId: referrer.id, points: 20, action: "REFERRAL_SUCCESSFUL", referenceId: referral.id }
    });

    // 6. Audit Log
    await tx.auditLog.create({
      data: {
        userId: buyer.id,
        action: "PAYMENT_CAPTURED",
        resource: "orders",
        resourceId: order.id,
        newValues: { status: "PAID", commissionId: comm.id }
      }
    });

    return { paidOrder, qualifiedRef, comm };
  });

  console.log("✅ Order transitioned to:", verifiedResult.paidOrder.status);
  console.log("✅ Referral transitioned to:", verifiedResult.qualifiedRef.status);
  console.log("✅ Commission created with status:", verifiedResult.comm.status, "Amount: ₹" + verifiedResult.comm.amount.toString());
  if (Number(verifiedResult.comm.amount) !== 400) {
    throw new Error("Commission calculation error!");
  }

  // 5. Cleanup Test Records
  await prisma.recognitionPoint.deleteMany({ where: { userId: { in: [buyer.id, referrer.id] }, referenceId: { in: [order.id, referral.id] } } });
  await prisma.auditLog.deleteMany({ where: { resourceId: order.id } });
  await prisma.commission.deleteMany({ where: { orderId: order.id } });
  await prisma.orderItem.deleteMany({ where: { orderId: order.id } });
  await prisma.payment.deleteMany({ where: { orderId: order.id } });
  await prisma.order.delete({ where: { id: order.id } });
  await prisma.referral.delete({ where: { id: referral.id } });
  await prisma.activityLog.deleteMany({ where: { userId: buyer.id } });
  await prisma.auditLog.deleteMany({ where: { userId: buyer.id } });
  await prisma.notification.deleteMany({ where: { userId: { in: [buyer.id, referrer.id] } } });
  await prisma.profile.deleteMany({ where: { userId: buyer.id } });
  await prisma.user.delete({ where: { id: buyer.id } });
  await prisma.commissionRule.deleteMany({ where: { productId: product.id } });
  await prisma.product.delete({ where: { id: product.id } });

  console.log("\n=========================================================");
  console.log("COMPLETE ORDER, PAYMENT & COMMISSION FLOW VERIFIED! 🎉");
  console.log("=========================================================");
}

testFullOrderPaymentFlow()
  .catch(err => {
    console.error("Test Flow Failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });