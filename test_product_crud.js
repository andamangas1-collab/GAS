const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testProductCRUD() {
  console.log("=== EXECUTING PRODUCT & OFFER ENGINE CRUD VALIDATION SUITE ===");

  const superAdmin = await prisma.user.findUnique({ where: { email: "superadmin@gas.local" } });
  if (!superAdmin) throw new Error("SuperAdmin required");

  // 1. CREATE PRODUCT
  console.log("\n[TEST 1] Testing Product Creation & Commission Rule Linking...");
  const newProduct = await prisma.$transaction(async (tx) => {
    const p = await tx.product.create({
      data: {
        name: "GAS Growth Accelerator Elite",
        slug: "gas-growth-accelerator-elite-" + Date.now(),
        description: "Comprehensive value-creation curriculum and execution toolkit.",
        category: "Education",
        price: 4999.00,
        status: "ACTIVE",
        startDate: new Date(),
        endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      }
    });

    // Commission: Configured, NOT hardcoded (15% percentage commission)
    const rule = await tx.commissionRule.create({
      data: {
        name: `Commission for ${p.name}`,
        productId: p.id,
        type: "PERCENTAGE",
        value: 15.00,
        isActive: true,
      }
    });

    // Audit log
    await tx.auditLog.create({
      data: {
        userId: superAdmin.id,
        action: "CREATE_PRODUCT",
        resource: "products",
        resourceId: p.id,
        newValues: { name: p.name, price: 4999.00, commissionValue: 15.00 }
      }
    });

    return { product: p, rule };
  });

  console.log("✅ Created Product:", newProduct.product.name, "ID:", newProduct.product.id);
  console.log("✅ Commission Rule created:", newProduct.rule.type, newProduct.rule.value.toString() + "%");

  // 2. READ & SEARCH PRODUCT
  console.log("\n[TEST 2] Testing Product Search, Filter & View...");
  const searchResults = await prisma.product.findMany({
    where: {
      status: "ACTIVE",
      category: "Education",
      name: { contains: "Growth" }
    },
    include: { commissionRules: true }
  });

  if (searchResults.length === 0) throw new Error("Product search failed!");
  console.log("✅ Search returned:", searchResults.length, "matching product(s).");
  console.log("✅ Rule loaded dynamically:", searchResults[0].commissionRules[0]?.value.toString() + "%");

  // 3. UPDATE PRODUCT & COMMISSION (Switch to FIXED_AMOUNT)
  console.log("\n[TEST 3] Testing Product & Commission Update (To FIXED_AMOUNT)...");
  const updatedProduct = await prisma.$transaction(async (tx) => {
    const p = await tx.product.update({
      where: { id: newProduct.product.id },
      data: {
        price: 5499.00,
        description: "Updated elite value-creation curriculum with personal mentorship."
      }
    });

    const rule = await tx.commissionRule.updateMany({
      where: { productId: p.id, isActive: true },
      data: {
        type: "FIXED",
        value: 750.00 // ₹750 flat commission
      }
    });

    await tx.auditLog.create({
      data: {
        userId: superAdmin.id,
        action: "UPDATE_PRODUCT",
        resource: "products",
        resourceId: p.id,
        oldValues: { price: 4999.00 },
        newValues: { price: 5499.00, commissionType: "FIXED", commissionValue: 750.00 }
      }
    });

    return p;
  });

  console.log("✅ Updated Product Price:", updatedProduct.price.toString());
  const updatedRule = await prisma.commissionRule.findFirst({ where: { productId: updatedProduct.id } });
  if (updatedRule?.type !== "FIXED" || Number(updatedRule?.value) !== 750) {
    throw new Error("Commission rule update failed!");
  }
  console.log("✅ Verified: Commission updated to FIXED ₹" + updatedRule.value.toString());

  // 4. UNPUBLISH / ARCHIVE PRODUCT
  console.log("\n[TEST 4] Testing Product Unpublish / Archive Status...");
  await prisma.product.update({
    where: { id: updatedProduct.id },
    data: { status: "INACTIVE" }
  });

  const inactiveProduct = await prisma.product.findUnique({ where: { id: updatedProduct.id } });
  if (inactiveProduct?.status !== "INACTIVE") throw new Error("Status archive failed");
  console.log("✅ Verified: Product status transitioned to INACTIVE (Archived).");

  // 5. AUDIT LOG VALIDATION
  console.log("\n[TEST 5] Verifying Audit Trail Generation...");
  const logs = await prisma.auditLog.findMany({
    where: { resourceId: newProduct.product.id }
  });
  console.log("Recorded Audit Logs:", logs.map(l => l.action));
  if (logs.length < 2) throw new Error("Audit logs missing for product mutations!");
  console.log("✅ Verified: Comprehensive audit trail recorded in database.");

  // CLEANUP
  await prisma.commissionRule.deleteMany({ where: { productId: newProduct.product.id } });
  await prisma.auditLog.deleteMany({ where: { resourceId: newProduct.product.id } });
  await prisma.product.delete({ where: { id: newProduct.product.id } });
  console.log("\n[CLEANUP] Test product records cleaned up.");

  console.log("\n=======================================================");
  console.log("ALL PRODUCT & OFFER CRUD & COMMISSION TESTS PASSED! 🎉");
  console.log("=======================================================");
}

testProductCRUD()
  .catch(err => {
    console.error("Test Suite Failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });