/**
 * Simple API Testing Utility for MeowPay Backend
 * This script provides basic testing functionality for the API endpoints
 */

const API_BASE_URL = process.env.API_URL || 'http://localhost:3001';

// Check if fetch is available (Node.js 18+), otherwise require node-fetch
let fetch;
if (typeof global.fetch === 'undefined') {
  try {
    fetch = require('node-fetch');
  } catch (error) {
    console.error('Please install node-fetch: npm install node-fetch');
    process.exit(1);
  }
} else {
  fetch = global.fetch;
}

// Utility function to make API requests
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

// Test functions
async function testHealthCheck() {
  console.log('\n🏥 Testing Health Check...');
  const result = await apiRequest('/health');
  console.log('Status:', result.status);
  console.log('Response:', JSON.stringify(result.data, null, 2));
  return result.status === 200;
}

async function testGetCats() {
  console.log('\n🐱 Testing Get All Cats...');
  const result = await apiRequest('/api/cats');
  console.log('Status:', result.status);
  console.log('Cats found:', result.data?.count || 0);
  return result.status === 200;
}

async function testGetTransactions() {
  console.log('\n💳 Testing Get Transactions...');
  const result = await apiRequest('/api/transactions');
  console.log('Status:', result.status);
  console.log('Transactions found:', result.data?.count || 0);
  return result.status === 200;
}

async function testTransactionStatistics() {
  console.log('\n📊 Testing Transaction Statistics...');
  const result = await apiRequest('/api/transactions/statistics');
  console.log('Status:', result.status);
  console.log('Total transactions:', result.data?.totalTransactions || 0);
  return result.status === 200;
}

async function testTransferValidation() {
  console.log('\n✅ Testing Transfer Validation...');
  const result = await apiRequest('/api/transfer/validate', {
    method: 'POST',
    body: JSON.stringify({
      senderId: 1,
      receiverId: 2,
      amount: 10
    })
  });
  console.log('Status:', result.status);
  console.log('Valid:', result.data?.valid);
  return result.status === 200;
}

async function testApiInfo() {
  console.log('\nℹ️  Testing API Info...');
  const result = await apiRequest('/api/info');
  console.log('Status:', result.status);
  console.log('API Name:', result.data?.name);
  return result.status === 200;
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting MeowPay API Tests...');
  console.log(`📍 API URL: ${API_BASE_URL}`);
  console.log('='.repeat(50));

  const tests = [
    { name: 'Health Check', fn: testHealthCheck },
    { name: 'Get Cats', fn: testGetCats },
    { name: 'Get Transactions', fn: testGetTransactions },
    { name: 'Transaction Statistics', fn: testTransactionStatistics },
    { name: 'Transfer Validation', fn: testTransferValidation },
    { name: 'API Info', fn: testApiInfo }
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      const result = await test.fn();
      if (result) {
        console.log(`✅ ${test.name} PASSED`);
        passed++;
      } else {
        console.log(`❌ ${test.name} FAILED`);
        failed++;
      }
    } catch (error) {
      console.log(`❌ ${test.name} ERROR: ${error.message}`);
      failed++;
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log(`📈 Test Results: ${passed} passed, ${failed} failed`);
  console.log('='.repeat(50));

  process.exit(failed > 0 ? 1 : 0);
}

// Run tests if this script is executed directly
if (require.main === module) {
  runAllTests().catch(error => {
    console.error('Test suite error:', error);
    process.exit(1);
  });
}

module.exports = {
  apiRequest,
  testHealthCheck,
  testGetCats,
  testGetTransactions,
  testTransactionStatistics,
  testTransferValidation,
  testApiInfo,
  runAllTests
};
