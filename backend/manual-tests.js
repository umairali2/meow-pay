/**
 * Manual Test Suite for MeowPay API
 * Comprehensive testing of transfer functionality and edge cases
 */

const API_BASE_URL = process.env.API_URL || 'http://localhost:3001';

// Check if fetch is available (Node.js 18+), otherwise require node-fetch
let fetch;
if (typeof global.fetch === 'undefined') {
  fetch = require('node-fetch');
} else {
  fetch = global.fetch;
}

const results = [];

async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  try {
    const response = await fetch(url, { ...defaultOptions, ...options });
    const data = await response.json();
    return { status: response.status, data };
  } catch (error) {
    return { error: error.message };
  }
}

function recordTest(name, passed, details) {
  results.push({ name, passed, details, timestamp: new Date().toISOString() });
  const status = passed ? '✅' : '❌';
  console.log(`${status} ${name}`);
  if (details) {
    console.log(`   ${details}`);
  }
}

async function getCatBalance(catId) {
  const result = await apiRequest(`/api/cats/${catId}`);
  return result.data?.data?.balance;
}

async function getTransactionCount() {
  const result = await apiRequest('/api/transactions');
  return result.data?.count || 0;
}

const sqlite3 = require('sqlite3').verbose();

// Helper function for delays
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function waitForRateLimit() {
  // Rate limit is disabled during manual tests, but we keep a small delay for stability
  await delay(200);
}

async function resetDatabase() {
  const dbPath = process.env.DB_PATH || './meowpay.db';
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath);
    
    db.serialize(() => {
      // Clear transactions
      db.run('DELETE FROM transactions', (err) => {
        if (err) reject(err);
      });
      
      // Reset cat balances to original seed values
      const seedData = [
        [1, 100],  // Whiskers
        [2, 50],   // Mittens
        [3, 75],   // Shadow
        [4, 120],  // Luna
        [5, 30],   // Oliver
        [6, 200]   // Simba
      ];
      
      seedData.forEach(([id, balance]) => {
        db.run('UPDATE cats SET balance = ? WHERE id = ?', [balance, id], (err) => {
          if (err) reject(err);
        });
      });
    });
    
    db.close((err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

async function runManualTests() {
  console.log('🧪 Starting MeowPay Manual Tests...');
  console.log(`📍 API URL: ${API_BASE_URL}`);
  console.log('='.repeat(60));

  // Test 1: Verify initial state
  console.log('\n📋 Initial State:');
  
  // Reset the database to ensure clean state
  console.log('   🔄 Resetting database...');
  await resetDatabase();
  await delay(1000);
  
  const initialCats = await apiRequest('/api/cats');
  const initialTransactions = await getTransactionCount();
  
  if (initialCats.data?.data?.length === 6 && initialTransactions === 0) {
    recordTest('Initial state verified (6 cats, 0 transactions)', true);
  } else {
    recordTest('Initial state verified', false, `Expected 6 cats, 0 transactions, got ${initialCats.data?.data?.length} cats, ${initialTransactions} transactions`);
  }

  // Test 2: Successful transfer
  console.log('\n💸 Test 2: Successful Transfer');
  const whiskersBefore = await getCatBalance(1);
  const mittensBefore = await getCatBalance(2);
  
  const transferResult = await apiRequest('/api/transfer', {
    method: 'POST',
    body: JSON.stringify({
      senderId: 1,
      receiverId: 2,
      amount: 25
    })
  });

  const whiskersAfter = await getCatBalance(1);
  const mittensAfter = await getCatBalance(2);

  if (transferResult.status === 200 && 
      whiskersAfter === whiskersBefore - 25 && 
      mittensAfter === mittensBefore + 25) {
    recordTest('Successful transfer: Whiskers → Mittens (25 treats)', true, 
      `Whiskers: ${whiskersBefore} → ${whiskersAfter}, Mittens: ${mittensBefore} → ${mittensAfter}, Code: ${transferResult.data?.data?.confirmationCode}`);
  } else {
    recordTest('Successful transfer', false, `Status: ${transferResult.status}, Response: ${JSON.stringify(transferResult.data)}`);
  }

  await waitForRateLimit();

  // Test 3: Self-transfer
  console.log('\n🚫 Test 3: Self-Transfer Prevention');
  await waitForRateLimit();
  const selfTransfer = await apiRequest('/api/transfer', {
    method: 'POST',
    body: JSON.stringify({
      senderId: 1,
      receiverId: 1,
      amount: 10
    })
  });

  if (selfTransfer.status === 400 && 
      selfTransfer.data?.message?.includes('must be different')) {
    recordTest('Self-transfer prevented', true, `Error: ${selfTransfer.data.message}`);
  } else {
    recordTest('Self-transfer prevented', false, `Unexpected status: ${selfTransfer.status}, Response: ${JSON.stringify(selfTransfer.data)}`);
  }

  await waitForRateLimit();

  // Test 4: Insufficient balance
  console.log('\n💰 Test 4: Insufficient Balance');
  await waitForRateLimit();
  const oliverBefore = await getCatBalance(5);
  const insufficient = await apiRequest('/api/transfer', {
    method: 'POST',
    body: JSON.stringify({
      senderId: 5,
      receiverId: 1,
      amount: 100
    })
  });

  const oliverAfter = await getCatBalance(5);

  if (insufficient.status === 400 && 
      insufficient.data?.message?.includes('Insufficient balance') &&
      oliverAfter === oliverBefore) {
    recordTest('Insufficient balance handled', true, 
      `Error: ${insufficient.data.message}, Balance unchanged: ${oliverAfter}`);
  } else {
    recordTest('Insufficient balance handled', false, 
      `Status: ${insufficient.status}, Balance: ${oliverBefore} → ${oliverAfter}`);
  }

  await waitForRateLimit();

  // Test 5: Invalid amount (zero)
  console.log('\n⛔ Test 5: Invalid Amount (Zero)');
  const zeroAmount = await apiRequest('/api/transfer', {
    method: 'POST',
    body: JSON.stringify({
      senderId: 1,
      receiverId: 2,
      amount: 0
    })
  });

  if (zeroAmount.status === 400) {
    recordTest('Zero amount rejected', true, `Error: ${zeroAmount.data?.message}`);
  } else {
    recordTest('Zero amount rejected', false, `Unexpected status: ${zeroAmount.status}`);
  }

  // Test 6: Invalid amount (negative)
  console.log('\n⛔ Test 6: Invalid Amount (Negative)');
  const negativeAmount = await apiRequest('/api/transfer', {
    method: 'POST',
    body: JSON.stringify({
      senderId: 1,
      receiverId: 2,
      amount: -10
    })
  });

  if (negativeAmount.status === 400) {
    recordTest('Negative amount rejected', true, `Error: ${negativeAmount.data?.message}`);
  } else {
    recordTest('Negative amount rejected', false, `Unexpected status: ${negativeAmount.status}`);
  }

  // Test 7: Over-limit transfer
  console.log('\n⛔ Test 7: Over-Limit Transfer');
  const overLimit = await apiRequest('/api/transfer', {
    method: 'POST',
    body: JSON.stringify({
      senderId: 6,
      receiverId: 1,
      amount: 50000
    })
  });

  if (overLimit.status === 400) {
    recordTest('Over-limit transfer rejected', true, `Error: ${overLimit.data?.message}`);
  } else {
    recordTest('Over-limit transfer rejected', false, `Unexpected status: ${overLimit.status}`);
  }

  // Test 8: Multiple consecutive transfers
  console.log('\n🔁 Test 8: Multiple Consecutive Transfers');
  const simbaBefore = await getCatBalance(6);
  const lunaBefore = await getCatBalance(4);
  
  const transfer1 = await apiRequest('/api/transfer', {
    method: 'POST',
    body: JSON.stringify({
      senderId: 6,
      receiverId: 4,
      amount: 30
    })
  });

  const transfer2 = await apiRequest('/api/transfer', {
    method: 'POST',
    body: JSON.stringify({
      senderId: 6,
      receiverId: 4,
      amount: 20
    })
  });

  const simbaAfter = await getCatBalance(6);
  const lunaAfter = await getCatBalance(4);

  if (transfer1.status === 200 && transfer2.status === 200 &&
      simbaAfter === simbaBefore - 50 && lunaAfter === lunaBefore + 50) {
    recordTest('Multiple consecutive transfers successful', true, 
      `Simba: ${simbaBefore} → ${simbaAfter}, Luna: ${lunaBefore} → ${lunaAfter}`);
  } else {
    recordTest('Multiple consecutive transfers', false, 
      `T1: ${transfer1.status}, T2: ${transfer2.status}`);
  }

  // Test 9: Transfer validation endpoint
  console.log('\n✅ Test 9: Transfer Validation Endpoint');
  const validation = await apiRequest('/api/transfer/validate', {
    method: 'POST',
    body: JSON.stringify({
      senderId: 4,
      receiverId: 5,
      amount: 10
    })
  });

  if (validation.status === 200 && validation.data?.valid === true) {
    recordTest('Transfer validation preview works', true, 
      `Feasible: ${validation.data.data?.transfer?.feasible}`);
  } else {
    recordTest('Transfer validation preview works', false, 
      `Status: ${validation.status}, Response: ${JSON.stringify(validation.data)}`);
  }

  // Test 10: Invalid receiver
  console.log('\n🚫 Test 10: Invalid Receiver ID');
  const invalidReceiver = await apiRequest('/api/transfer', {
    method: 'POST',
    body: JSON.stringify({
      senderId: 1,
      receiverId: 999,
      amount: 10
    })
  });

  if (invalidReceiver.status === 404) {
    recordTest('Invalid receiver ID handled', true, `Error: ${invalidReceiver.data?.message}`);
  } else {
    recordTest('Invalid receiver ID handled', false, `Unexpected status: ${invalidReceiver.status}`);
  }

  // Test 11: Database integrity
  console.log('\n🗄️  Test 11: Database Integrity');
  const finalTransactions = await getTransactionCount();
  const finalCats = await apiRequest('/api/cats');
  const totalBalance = finalCats.data?.data?.reduce((sum, cat) => sum + cat.balance, 0);

  // Initial total: 100 + 50 + 75 + 120 + 30 + 200 = 575
  const expectedTotal = 575;
  
  if (totalBalance === expectedTotal && finalTransactions === 3) {
    recordTest('Database integrity maintained', true, 
      `Total treats conserved: ${totalBalance}, Successful transactions recorded: ${finalTransactions}`);
  } else {
    recordTest('Database integrity maintained', false, 
      `Total: ${totalBalance} (expected ${expectedTotal}), Transactions: ${finalTransactions} (expected 3)`);
  }

  // Print summary
  console.log('\n' + '='.repeat(60));
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  console.log(`📈 Manual Test Results: ${passed} passed, ${failed} failed`);
  console.log('='.repeat(60));

  if (failed > 0) {
    console.log('\n❌ Failed Tests:');
    results.filter(r => !r.passed).forEach(r => {
      console.log(`  - ${r.name}: ${r.details}`);
    });
  }

  return { results, passed, failed };
}

// Run tests if this script is executed directly
if (require.main === module) {
  runManualTests().then(({ passed, failed }) => {
    process.exit(failed > 0 ? 1 : 0);
  }).catch(error => {
    console.error('Manual test suite error:', error);
    process.exit(1);
  });
}

module.exports = { runManualTests };
