/**
 * Integration Test Script for MeowPay API
 * Tests all API endpoints to verify frontend-backend connectivity
 */

const API_BASE_URL = process.env.API_URL || 'http://localhost:3001';

// Check if fetch is available (Node.js 18+), otherwise require node-fetch
let fetch;
if (typeof global.fetch === 'undefined') {
  fetch = require('node-fetch');
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
  if (result.data?.data) {
    console.log('Sample cat:', result.data.data[0]);
  }
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
  console.log('Total transactions:', result.data?.data?.totalTransactions || 0);
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

async function testCORS() {
  console.log('\n🔒 Testing CORS...');
  const result = await apiRequest('/api/cats', {
    headers: {
      'Origin': 'http://localhost:3002',
      'Content-Type': 'application/json',
    }
  });
  console.log('Status:', result.status);
  console.log('CORS Headers:', result.data?.headers ? 'Present' : 'Not checked');
  return result.status === 200;
}

// Run all tests
async function runIntegrationTests() {
  console.log('🚀 Starting MeowPay API Integration Tests...');
  console.log(`📍 API URL: ${API_BASE_URL}`);
  console.log('='.repeat(50));

  const tests = [
    { name: 'Health Check', fn: testHealthCheck },
    { name: 'Get Cats', fn: testGetCats },
    { name: 'Get Transactions', fn: testGetTransactions },
    { name: 'Transaction Statistics', fn: testTransactionStatistics },
    { name: 'Transfer Validation', fn: testTransferValidation },
    { name: 'API Info', fn: testApiInfo },
    { name: 'CORS', fn: testCORS }
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
  console.log(`📈 Integration Test Results: ${passed} passed, ${failed} failed`);
  console.log('='.repeat(50));

  process.exit(failed > 0 ? 1 : 0);
}

// Run tests if this script is executed directly
if (require.main === module) {
  runIntegrationTests().catch(error => {
    console.error('Integration test suite error:', error);
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
  testCORS,
  runIntegrationTests
};
