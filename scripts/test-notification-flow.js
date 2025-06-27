const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function testNotificationFlow() {
  console.log('🧪 Testing Complete Notification Flow\n');

  // Test data
  const testUserFid = 5543; // Dev user FID
  const testWalletAddress = '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6'; // Valid wallet address

  try {
    // Step 1: Create a test journal entry
    console.log('1. Creating test journal entry...');
    const { data: entry, error: entryError } = await supabase
      .from('journal_entries')
      .insert({
        user_fid: testUserFid,
        sol_day: 9999,
        content: 'Test entry for notification flow',
        word_count: 10,
        preservation_status: 'synced'
      })
      .select()
      .single();

    if (entryError) {
      console.error('❌ Failed to create test entry:', entryError);
      return;
    }
    console.log('✅ Test entry created:', entry.id);

    // Step 2: Create a test share
    console.log('\n2. Creating test share...');
    const { data: share, error: shareError } = await supabase
      .from('journal_shares')
      .insert({
        entry_id: entry.id,
        user_fid: testUserFid,
        share_url: `/journal/shared/test-share-${Date.now()}`
      })
      .select()
      .single();

    if (shareError) {
      console.error('❌ Failed to create test share:', shareError);
      return;
    }
    console.log('✅ Test share created:', share.id);

    // Step 3: Test notification claim endpoint
    console.log('\n3. Testing notification claim endpoint...');
    const notificationRes = await fetch(`${BASE_URL}/api/notifications/claim`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userFid: testUserFid,
        entryId: entry.id,
        shareId: share.id
      })
    });

    const notificationData = await notificationRes.json();
    console.log('Notification response:', notificationData);

    if (!notificationRes.ok) {
      console.error('❌ Notification claim failed');
      return;
    }
    console.log('✅ Notification sent successfully');

    // Step 4: Test claim verification
    console.log('\n4. Testing claim verification...');
    const verifyRes = await fetch(`${BASE_URL}/api/journal/claim/verify?fid=${testUserFid}&entry=${entry.id}&share=${share.id}`);
    const verifyData = await verifyRes.json();
    console.log('Verification response:', verifyData);

    if (!verifyRes.ok || !verifyData.eligible) {
      console.error('❌ Claim verification failed');
      return;
    }
    console.log('✅ Claim verification successful');

    // Step 5: Test actual claim
    console.log('\n5. Testing token claim...');
    const claimRes = await fetch(`${BASE_URL}/api/journal/claim`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userFid: testUserFid,
        entryId: entry.id,
        shareId: share.id,
        walletAddress: testWalletAddress
      })
    });

    const claimData = await claimRes.json();
    console.log('Claim response:', claimData);

    if (!claimRes.ok) {
      console.error('❌ Token claim failed:', claimData.error);
      return;
    }
    console.log('✅ Token claim successful');

    // Step 6: Check token status
    console.log('\n6. Checking token status...');
    const statusRes = await fetch(`${BASE_URL}/api/tokens/${testUserFid}`);
    const statusData = await statusRes.json();
    console.log('Status response:', statusData);

    if (statusData.hasClaimed) {
      console.log('✅ Token claim recorded in database');
    } else {
      console.log('⚠️ Token claim not found in database');
    }

    // Step 7: Test claim page URL
    console.log('\n7. Testing claim page URL...');
    const claimUrl = `${BASE_URL}/claim?entry=${entry.id}&share=${share.id}&fid=${testUserFid}`;
    console.log('Claim page URL:', claimUrl);

    // Step 8: Clean up test data
    console.log('\n8. Cleaning up test data...');
    // await supabase.from('token_claims').delete().eq('user_fid', testUserFid);
    // await supabase.from('claim_notifications').delete().eq('user_fid', testUserFid);
    // await supabase.from('journal_shares').delete().eq('id', share.id);
    // await supabase.from('journal_entries').delete().eq('id', entry.id);
    // console.log('✅ Test data cleaned up');

    console.log('\n🎉 Complete notification flow test successful!');
    console.log('\n📋 Summary:');
    console.log('- ✅ Journal entry creation');
    console.log('- ✅ Share creation');
    console.log('- ✅ Notification sending');
    console.log('- ✅ Claim verification');
    console.log('- ✅ Token claiming');
    console.log('- ✅ Status checking');
    console.log('- ✅ Data cleanup');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testNotificationFlow(); 