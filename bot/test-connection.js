#!/usr/bin/env node

// Test script to verify bot can connect to Solara API
const axios = require('axios');
require('dotenv').config();

const POTENTIAL_URLS = [
  'https://www.solara.fyi',
  'https://sun-age.vercel.app',
  'https://solara-app.vercel.app',
  'https://solara.vercel.app'
];

async function testConnection(baseUrl) {
  console.log(`\n🧪 Testing: ${baseUrl}`);
  
  try {
    // Test health endpoint first
    const healthResponse = await axios.get(`${baseUrl}/api/health`, {
      timeout: 10000
    });
    console.log(`  ✅ Health check: ${healthResponse.status}`);
    
    // Test bot-posts endpoint (GET)
    const botPostsResponse = await axios.get(`${baseUrl}/api/bot-posts`, {
      timeout: 10000
    });
    console.log(`  ✅ Bot posts endpoint: ${botPostsResponse.status}`);
    
    // Test bot-posts endpoint (POST) - this will fail but we want to see the error type
    try {
      await axios.post(`${baseUrl}/api/bot-posts`, {
        castHash: '0x1234567890123456789012345678901234567890',
        content: 'Test post',
        postType: 'journal_affirmation',
        botFid: 1090419
      }, {
        timeout: 10000
      });
      console.log(`  ✅ Bot posts POST: Success`);
    } catch (postError) {
      if (postError.response) {
        console.log(`  ✅ Bot posts POST: Endpoint exists (${postError.response.status})`);
        if (postError.response.status === 400) {
          console.log(`     (400 error expected - missing database)`);
        }
      } else {
        console.log(`  ❌ Bot posts POST: No response`);
      }
    }
    
    return true;
    
  } catch (error) {
    if (error.code === 'ENOTFOUND') {
      console.log(`  ❌ DNS lookup failed - URL doesn't exist`);
    } else if (error.response) {
      console.log(`  ❌ HTTP ${error.response.status}: ${error.response.statusText}`);
    } else if (error.code === 'ECONNREFUSED') {
      console.log(`  ❌ Connection refused`);
    } else if (error.code === 'ECONNRESET') {
      console.log(`  ❌ Connection reset`);
    } else if (error.code === 'ETIMEDOUT') {
      console.log(`  ❌ Request timeout`);
    } else {
      console.log(`  ❌ Error: ${error.message}`);
    }
    return false;
  }
}

async function findWorkingUrl() {
  console.log('🔍 Testing potential Solara URLs...');
  
  for (const url of POTENTIAL_URLS) {
    const works = await testConnection(url);
    if (works) {
      console.log(`\n✅ FOUND WORKING URL: ${url}`);
      console.log(`\n📝 Update your bot configuration:`);
      console.log(`   SOLARA_API_BASE=${url}`);
      return url;
    }
  }
  
  console.log(`\n❌ No working URLs found.`);
  console.log(`\n🔧 Troubleshooting steps:`);
  console.log(`1. Check your Vercel deployment status`);
  console.log(`2. Verify your domain configuration`);
  console.log(`3. Make sure the API endpoints are deployed`);
  console.log(`4. Test manually: curl https://your-url.vercel.app/api/health`);
  
  return null;
}

// Also test current configured URL
async function testCurrentConfig() {
  const currentUrl = process.env.SOLARA_API_BASE;
  if (currentUrl && !POTENTIAL_URLS.includes(currentUrl)) {
    console.log(`\n🔧 Testing current configured URL: ${currentUrl}`);
    await testConnection(currentUrl);
  }
}

async function main() {
  console.log('🌞 @solaracosmos Bot Connection Test');
  console.log('=====================================');
  
  await testCurrentConfig();
  const workingUrl = await findWorkingUrl();
  
  if (workingUrl) {
    console.log(`\n🎯 SUCCESS! Your bot can connect to Solara.`);
    console.log(`\n🚀 Next steps:`);
    console.log(`1. Update .env with: SOLARA_API_BASE=${workingUrl}`);
    console.log(`2. Deploy your database schema (see FARCASTER_FLYWHEEL_GUIDE.md)`);
    console.log(`3. Start the bot: npm start`);
  } else {
    console.log(`\n❌ Could not find a working Solara URL.`);
    console.log(`\nPlease check your Vercel deployment and try again.`);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { testConnection, findWorkingUrl };