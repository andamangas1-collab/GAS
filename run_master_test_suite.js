// ============================================================
// GAS™ MVP — MASTER TEST SUITE RUNNER
// ============================================================

const { execSync } = require('child_process');

const testSuites = [
  { name: 'Auth & Integrity Suite', script: 'verify_auth_integrity.js' },
  { name: 'Product & Offer Engine CRUD', script: 'test_product_crud.js' },
  { name: 'Order, Payment & Referral Qualification', script: 'test_order_payment_flow.js' },
  { name: 'V2V™ Value Creation & Review Engine', script: 'test_v2v_flow.js' },
  { name: 'Admin User Management & Status Toggles', script: 'test_admin_user_mgmt.js' },
  { name: 'Admin Commission Review & Payout Queue', script: 'test_admin_commission_queue.js' },
  { name: 'Referral Engine & Non-MLM Isolation', script: 'test_referral_engine.js' },
  { name: 'Commission Engine Core & Edge Cases', script: 'test_commission_engine.js' },
  { name: 'GAS™ Recognition Engine & Points Ledger', script: 'test_recognition_engine.js' },
  { name: 'GAS™ User Dashboard & Privacy Isolation', script: 'test_user_dashboard.js' },
  { name: 'GAS™ Admin Dashboard & Module Governance', script: 'test_admin_dashboard.js' },
];

console.log('=================================================================');
console.log('GAS™ MVP — RUNNING FULL-STACK AUTOMATED TEST SUITE (11 SUITES)');
console.log('=================================================================\n');

let allPassed = true;

for (const suite of testSuites) {
  console.log(`>>> RUNNING: ${suite.name} (${suite.script})...`);
  try {
    const output = execSync(`node ${suite.script}`, { stdio: 'pipe' }).toString();
    console.log(output);
    console.log(`[PASS] ${suite.name}\n-----------------------------------------------------------------\n`);
  } catch (error) {
    console.error(`[FAIL] ${suite.name}`);
    if (error.stdout) console.error(error.stdout.toString());
    if (error.stderr) console.error(error.stderr.toString());
    allPassed = false;
    break;
  }
}

if (allPassed) {
  console.log('=================================================================');
  console.log('🏆 ALL 11 TEST SUITES PASSED WITH 100% SUCCESS!');
  console.log('=================================================================');
} else {
  console.error('❌ MASTER TEST SUITE FAILED.');
  process.exit(1);
}
