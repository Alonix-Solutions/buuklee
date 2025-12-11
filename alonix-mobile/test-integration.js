/**
 * Integration Testing Script
 * Tests backend-frontend integration
 * 
 * Run: node test-integration.js
 */

const testResults = {
  passed: [],
  failed: [],
  skipped: []
};

function test(name, testFn) {
  return new Promise(async (resolve) => {
    try {
      console.log(`\n🧪 Testing: ${name}`);
      const result = await testFn();
      if (result) {
        console.log(`✅ PASSED: ${name}`);
        testResults.passed.push(name);
      } else {
        console.log(`❌ FAILED: ${name}`);
        testResults.failed.push(name);
      }
    } catch (error) {
      console.log(`❌ FAILED: ${name}`);
      console.log(`   Error: ${error.message}`);
      testResults.failed.push({ name, error: error.message });
    }
    resolve();
  });
}

async function runTests() {
  console.log('🚀 Starting Integration Tests...\n');

  // Test 1: Check API Configuration
  await test('API Configuration', async () => {
    try {
      const apiConfig = require('./src/config/api.js');
      return apiConfig.API_BASE_URL && apiConfig.API_ENDPOINTS;
    } catch (error) {
      return false;
    }
  });

  // Test 2: Check Services Exist
  await test('ActivityService exists', async () => {
    try {
      const service = require('./src/services/activityService.js');
      return typeof service.getActivities === 'function';
    } catch (error) {
      return false;
    }
  });

  await test('ClubService exists', async () => {
    try {
      const service = require('./src/services/clubService.js');
      return typeof service.getClubs === 'function';
    } catch (error) {
      return false;
    }
  });

  await test('NotificationService exists', async () => {
    try {
      const service = require('./src/services/notificationService.js');
      return typeof service.getNotifications === 'function';
    } catch (error) {
      return false;
    }
  });

  await test('BookingService exists', async () => {
    try {
      const service = require('./src/services/bookingService.js');
      return typeof service.bookHotel === 'function';
    } catch (error) {
      return false;
    }
  });

  await test('SocketService exists', async () => {
    try {
      const service = require('./src/services/socketService.js');
      return typeof service.connect === 'function';
    } catch (error) {
      return false;
    }
  });

  await test('WhatsAppService exists', async () => {
    try {
      const service = require('./src/services/whatsappService.js');
      return typeof service.getHotelLink === 'function';
    } catch (error) {
      return false;
    }
  });

  // Test 3: Check AuthContext
  await test('AuthContext uses real API', async () => {
    try {
      const fs = require('fs');
      const authContext = fs.readFileSync('./src/context/AuthContext.js', 'utf8');
      return authContext.includes('api.post') && authContext.includes('API_ENDPOINTS');
    } catch (error) {
      return false;
    }
  });

  // Print Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(50));
  console.log(`✅ Passed: ${testResults.passed.length}`);
  console.log(`❌ Failed: ${testResults.failed.length}`);
  console.log(`⏭️  Skipped: ${testResults.skipped.length}`);

  if (testResults.passed.length > 0) {
    console.log('\n✅ Passed Tests:');
    testResults.passed.forEach(name => console.log(`   - ${name}`));
  }

  if (testResults.failed.length > 0) {
    console.log('\n❌ Failed Tests:');
    testResults.failed.forEach(({ name, error }) => {
      if (typeof name === 'string') {
        console.log(`   - ${name}`);
      } else {
        console.log(`   - ${name.name}: ${name.error}`);
      }
    });
  }

  console.log('\n' + '='.repeat(50));
  console.log(`Overall: ${testResults.failed.length === 0 ? '✅ ALL TESTS PASSED' : '⚠️  SOME TESTS FAILED'}`);
  console.log('='.repeat(50));

  process.exit(testResults.failed.length === 0 ? 0 : 1);
}

if (require.main === module) {
  runTests().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { runTests, test };

