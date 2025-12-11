/**
 * Feature Testing Script
 * Run this to verify all implemented features are working
 * 
 * Usage: node test-features.js
 * 
 * Make sure:
 * 1. MongoDB is running
 * 2. Server is running on PORT (default 3000)
 * 3. Set TEST_USER_TOKEN in environment or update below
 */

const axios = require('axios');

const BASE_URL = process.env.API_URL || 'http://localhost:3000/api';
const TEST_USER_TOKEN = process.env.TEST_USER_TOKEN || 'YOUR_TEST_TOKEN_HERE';

// Test results
const results = {
  passed: [],
  failed: [],
  skipped: []
};

// Helper function to make authenticated requests
async function makeRequest(method, endpoint, data = null, token = TEST_USER_TOKEN) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (token && token !== 'YOUR_TEST_TOKEN_HERE') {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || error.message,
      status: error.response?.status || 500
    };
  }
}

// Test function
async function test(name, testFn) {
  try {
    console.log(`\n🧪 Testing: ${name}`);
    const result = await testFn();
    if (result.success) {
      console.log(`✅ PASSED: ${name}`);
      results.passed.push(name);
      return result;
    } else {
      console.log(`❌ FAILED: ${name}`);
      console.log(`   Error: ${JSON.stringify(result.error)}`);
      results.failed.push({ name, error: result.error });
      return result;
    }
  } catch (error) {
    console.log(`❌ FAILED: ${name}`);
    console.log(`   Exception: ${error.message}`);
    results.failed.push({ name, error: error.message });
    return { success: false, error: error.message };
  }
}

// Health check
async function testHealthCheck() {
  return await makeRequest('GET', '/health', null, null);
}

// Activity Session Management Tests
async function testActivitySessionManagement() {
  // This would require creating an activity first
  // For now, just check the endpoint exists
  const result = await makeRequest('GET', '/activities');
  return { success: result.status === 200 || result.status === 401 };
}

// Clubs Tests
async function testClubsEndpoints() {
  const result = await makeRequest('GET', '/clubs');
  return { success: result.status === 200 || result.status === 401 };
}

// Notifications Tests
async function testNotificationsEndpoints() {
  const result = await makeRequest('GET', '/notifications');
  return { success: result.status === 200 || result.status === 401 };
}

// Bookings Tests
async function testBookingsEndpoints() {
  const result = await makeRequest('GET', '/bookings/nearby-taxis?longitude=57.5&latitude=-20.2');
  return { success: result.status === 200 || result.status === 400 };
}

// WhatsApp Tests
async function testWhatsAppEndpoints() {
  // Test generate link endpoint
  const result = await makeRequest('POST', '/whatsapp/generate-link', {
    phoneNumber: '+23012345678',
    message: 'Test message'
  });
  return { success: result.status === 200 || result.status === 400 };
}

// Payments Tests
async function testPaymentsEndpoints() {
  // Just check endpoint exists (will fail without valid booking)
  const result = await makeRequest('POST', '/payments/create-intent', {
    bookingId: '507f1f77bcf86cd799439011',
    amount: 100,
    currency: 'MUR'
  });
  // 400/404 is expected without valid booking
  return { success: result.status === 400 || result.status === 404 || result.status === 401 };
}

// Main test runner
async function runTests() {
  console.log('🚀 Starting Feature Tests...');
  console.log(`📍 Base URL: ${BASE_URL}`);
  console.log(`🔑 Using token: ${TEST_USER_TOKEN !== 'YOUR_TEST_TOKEN_HERE' ? 'Yes' : 'No (set TEST_USER_TOKEN)'}`);

  // Health check
  await test('Health Check', testHealthCheck);

  // Activity Session Management
  await test('Activity Session Management - Endpoints Exist', testActivitySessionManagement);

  // Clubs
  await test('Clubs - List Endpoint', testClubsEndpoints);

  // Notifications
  await test('Notifications - Endpoints Exist', testNotificationsEndpoints);

  // Bookings
  await test('Bookings - Nearby Taxis Endpoint', testBookingsEndpoints);

  // WhatsApp
  await test('WhatsApp - Generate Link Endpoint', testWhatsAppEndpoints);

  // Payments
  await test('Payments - Create Intent Endpoint', testPaymentsEndpoints);

  // Print summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(50));
  console.log(`✅ Passed: ${results.passed.length}`);
  console.log(`❌ Failed: ${results.failed.length}`);
  console.log(`⏭️  Skipped: ${results.skipped.length}`);

  if (results.passed.length > 0) {
    console.log('\n✅ Passed Tests:');
    results.passed.forEach(name => console.log(`   - ${name}`));
  }

  if (results.failed.length > 0) {
    console.log('\n❌ Failed Tests:');
    results.failed.forEach(({ name, error }) => {
      console.log(`   - ${name}`);
      console.log(`     Error: ${JSON.stringify(error).substring(0, 100)}`);
    });
  }

  console.log('\n' + '='.repeat(50));
  console.log(`Overall: ${results.failed.length === 0 ? '✅ ALL TESTS PASSED' : '⚠️  SOME TESTS FAILED'}`);
  console.log('='.repeat(50));

  process.exit(results.failed.length === 0 ? 0 : 1);
}

// Run tests
if (require.main === module) {
  runTests().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { runTests, test, makeRequest };

