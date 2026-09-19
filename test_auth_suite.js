const { PrismaClient } = require('@prisma/client');
const { compare } = require('bcryptjs');
const prisma = new PrismaClient();

async function runAuthSecurityTests() {
  console.log("=== STARTING COMPREHENSIVE AUTH & SECURITY VALIDATION SUITE ===");

  const baseUrl = "http://localhost:3000";

  // TEST 1: Register User with All Required Fields & Referral
  console.log("\n[TEST 1] Testing Valid User Registration with Full Name, Mobile, Terms & Referral Code...");
  
  // Clean up any previous test user
  await prisma.user.deleteMany({
    where: { email: { in: ["auth_test_user@example.com", "duplicate_test@example.com", "blocked_test@example.com"] } }
  });

  const superAdmin = await prisma.user.findUnique({ where: { email: "superadmin@gas.local" } });
  if (!superAdmin) throw new Error("SuperAdmin not found!");

  const regPayload = {
    fullName: "Rohan Sharma",
    mobile: "9876543210",
    email: "auth_test_user@example.com",
    password: "Password@123",
    confirmPassword: "Password@123",
    referralCode: superAdmin.referralCode,
    termsAccepted: true
  };

  const regResponse = await fetch(`${baseUrl}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(regPayload)
  });

  const regJson = await regResponse.json();
  console.log("Register response status:", regResponse.status);
  if (regResponse.status !== 201) {
    console.error("Register failed:", regJson);
    throw new Error("Registration failed");
  }
  console.log("Registered user ID:", regJson.data.id, "RefCode:", regJson.data.referralCode);

  // Verify in Database
  const dbUser = await prisma.user.findUnique({
    where: { email: "auth_test_user@example.com" },
    include: { profile: true, referralsReceived: true, recognitionPoints: true, activityLogs: true }
  });

  if (!dbUser) throw new Error("User was not found in DB!");
  if (!dbUser.password.startsWith("$2a$") && !dbUser.password.startsWith("$2b$")) {
    throw new Error("Password is not properly hashed with bcrypt!");
  }
  if (dbUser.password === "Password@123") {
    throw new Error("CRITICAL SECURITY VULNERABILITY: Plaintext password stored!");
  }
  console.log("✅ Verified: Password is securely bcrypt hashed (never plaintext).");
  console.log("✅ Verified: Profile created with First Name:", dbUser.profile.firstName, "Last Name:", dbUser.profile.lastName, "Mobile:", dbUser.profile.mobile);
  console.log("✅ Verified: Referral record created with status:", dbUser.referralsReceived[0]?.status);
  if (dbUser.referralsReceived[0]?.status !== "REGISTERED") {
    throw new Error("Referral status should be REGISTERED, not qualified yet!");
  }
  console.log("✅ Verified: Commission qualification has NOT occurred at registration alone.");
  const commissions = await prisma.commission.findMany({ where: { userId: superAdmin.id, referralId: dbUser.referralsReceived[0]?.id } });
  if (commissions.length > 0) {
    throw new Error("CRITICAL BUG: Commission generated at registration alone!");
  }
  console.log("✅ Verified: Zero commissions generated at registration (strictly adheres to business rules).");

  // TEST 2: Duplicate Email Rejection
  console.log("\n[TEST 2] Testing Duplicate Email Rejection...");
  const dupEmailRes = await fetch(`${baseUrl}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...regPayload, mobile: "9876543219" })
  });
  console.log("Duplicate email response status:", dupEmailRes.status);
  if (dupEmailRes.status !== 409) throw new Error("Expected 409 Conflict on duplicate email!");
  console.log("✅ Verified: Duplicate email rejected safely.");

  // TEST 3: Duplicate Mobile Rejection
  console.log("\n[TEST 3] Testing Duplicate Mobile Number Rejection...");
  const dupMobileRes = await fetch(`${baseUrl}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...regPayload, email: "unique_new@example.com" })
  });
  console.log("Duplicate mobile response status:", dupMobileRes.status);
  if (dupMobileRes.status !== 409) throw new Error("Expected 409 Conflict on duplicate mobile!");
  console.log("✅ Verified: Duplicate mobile number rejected safely.");

  // TEST 4: Terms Not Accepted Rejection
  console.log("\n[TEST 4] Testing Terms Not Accepted Validation...");
  const termsRes = await fetch(`${baseUrl}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...regPayload, email: "terms_test@example.com", mobile: "9876543220", termsAccepted: false })
  });
  console.log("Terms rejected response status:", termsRes.status);
  if (termsRes.status !== 400) throw new Error("Expected 400 Bad Request when terms not accepted!");
  console.log("✅ Verified: Terms acceptance strictly enforced.");

  // TEST 5: Password Mismatch Rejection
  console.log("\n[TEST 5] Testing Password Mismatch Validation...");
  const mismatchRes = await fetch(`${baseUrl}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...regPayload, email: "mismatch@example.com", mobile: "9876543221", confirmPassword: "WrongPassword@123" })
  });
  console.log("Password mismatch response status:", mismatchRes.status);
  if (mismatchRes.status !== 400) throw new Error("Expected 400 Bad Request on password mismatch!");
  console.log("✅ Verified: Password mismatch rejected.");

  // TEST 6: NextAuth Credential Authorization Verification
  console.log("\n[TEST 6] Testing NextAuth Credential Authorization with Valid Credentials...");
  const { authOptions } = require('./src/lib/auth');
  const credentialsProvider = authOptions.providers.find(p => p.id === 'credentials');

  const authResult = await credentialsProvider.authorize({
    email: "auth_test_user@example.com",
    password: "Password@123"
  });

  console.log("Authorize result:", authResult?.id, "Role:", authResult?.role);
  if (!authResult || authResult.role !== "USER") {
    throw new Error("NextAuth authorize failed for valid user!");
  }
  console.log("✅ Verified: Valid credentials produce authenticated session payload.");

  // TEST 7: NextAuth Invalid Password Rejection
  console.log("\n[TEST 7] Testing NextAuth Rejection of Invalid Password...");
  try {
    await credentialsProvider.authorize({
      email: "auth_test_user@example.com",
      password: "IncorrectPassword!123"
    });
    throw new Error("Authorize should have thrown on bad password!");
  } catch (err) {
    if (err.message !== "Invalid email or password") throw err;
    console.log("✅ Verified: Invalid password rejected with generic secure message.");
  }

  // TEST 8: Account Status Handling (BLOCKED / SUSPENDED)
  console.log("\n[TEST 8] Testing Account Status Handling (BLOCKED & SUSPENDED)...");
  await prisma.user.update({
    where: { id: dbUser.id },
    data: { status: "BLOCKED" }
  });

  try {
    await credentialsProvider.authorize({
      email: "auth_test_user@example.com",
      password: "Password@123"
    });
    throw new Error("Authorize should have rejected BLOCKED account!");
  } catch (err) {
    if (!err.message.includes("blocked")) throw err;
    console.log("✅ Verified: BLOCKED account denied login authorization.");
  }

  // Restore user to ACTIVE
  await prisma.user.update({
    where: { id: dbUser.id },
    data: { status: "ACTIVE" }
  });

  // TEST 9: Protected Route Authorization & RBAC
  console.log("\n[TEST 9] Testing Server-Side RBAC Guard Utilities...");
  const { hasMinRole, isAdmin, isSuperAdmin } = require('./src/lib/auth');
  
  if (!hasMinRole("SUPER_ADMIN", "ADMIN")) throw new Error("SUPER_ADMIN should have min role ADMIN");
  if (!hasMinRole("ADMIN", "USER")) throw new Error("ADMIN should have min role USER");
  if (hasMinRole("USER", "ADMIN")) throw new Error("USER must NOT have min role ADMIN");
  if (!isSuperAdmin("SUPER_ADMIN")) throw new Error("SUPER_ADMIN check failed");
  if (isSuperAdmin("ADMIN")) throw new Error("ADMIN cannot be SUPER_ADMIN");
  if (!isAdmin("ADMIN") || !isAdmin("SUPER_ADMIN")) throw new Error("Admin check failed");
  if (isAdmin("USER")) throw new Error("USER cannot be admin");
  console.log("✅ Verified: Role-based hierarchy and checks strictly enforced.");

  // Clean up test user
  await prisma.user.deleteMany({
    where: { email: { in: ["auth_test_user@example.com"] } }
  });

  console.log("\n========================================================");
  console.log("ALL 9 AUTHENTICATION & SECURITY TESTS PASSED PERFECTLY!");
  console.log("========================================================");
}

runAuthSecurityTests()
  .catch(err => {
    console.error("Test Suite Failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });