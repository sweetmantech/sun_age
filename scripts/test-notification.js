// Test script for the notification system
const fetch = require('node-fetch');

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

async function testNotificationSystem() {
  console.log('🧪 Testing notification system...\n');

  // Test data
  const testUserFid = 5543; // Dev user FID
  const testEntryId = 'test-entry-id';
  const testShareId = 'test-share-id';

  try {
    // 1. Test notification claim endpoint
    console.log('1. Testing notification claim endpoint...');
    const notificationRes = await fetch(`${BASE_URL}/api/notifications/claim`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userFid: testUserFid,
        entryId: testEntryId,
        shareId: testShareId
      })
    });

    const notificationData = await notificationRes.json();
    console.log('Notification response:', notificationData);

    // 2. Test claim verification endpoint
    console.log('\n2. Testing claim verification endpoint...');
    const verifyRes = await fetch(`${BASE_URL}/api/journal/claim/verify?fid=${testUserFid}&entry=${testEntryId}&share=${testShareId}`);
    const verifyData = await verifyRes.json();
    console.log('Verification response:', verifyData);

    // 3. Test token status endpoint
    console.log('\n3. Testing token status endpoint...');
    const statusRes = await fetch(`${BASE_URL}/api/tokens/${testUserFid}`);
    const statusData = await statusRes.json();
    console.log('Status response:', statusData);

    // 4. Test share endpoint
    console.log('\n4. Testing share endpoint...');
    const shareRes = await fetch(`${BASE_URL}/api/journal/share?userFid=${testUserFid}`);
    const shareData = await shareRes.json();
    console.log('Share response:', shareData);

    console.log('\n✅ Notification system test completed!');
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testNotificationSystem(); 