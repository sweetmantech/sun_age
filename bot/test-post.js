require('dotenv').config();
const { NeynarAPIClient } = require("@neynar/nodejs-sdk");
const axios = require('axios');

// Initialize Neynar client with v2 API
const client = new NeynarAPIClient(process.env.NEYNAR_API_KEY);

// Bot configuration
const BOT_FID = process.env.BOT_FID || 1090419;
const SIGNER_UUID = process.env.SIGNER_UUID;
const SOLARA_API_BASE = process.env.SOLARA_API_BASE || 'https://www.solara.fyi';

// Test content
const testContent = {
  text: "🧪 Test post from @solaracosmos bot!\n\nThis is a manual test to verify the bot is working correctly.\n\nhttps://www.solara.fyi",
  embeds: [{ url: "https://www.solara.fyi" }]
};

// Register bot post in Solara database
async function registerBotPost(castHash, content, postType, miniAppUrl) {
  try {
    const response = await axios.post(`${SOLARA_API_BASE}/api/bot-posts`, {
      castHash,
      content,
      postType,
      miniAppUrl,
      botFid: BOT_FID
    });
    
    if (response.data.success) {
      console.log(`✅ Registered ${postType} post in database:`, castHash);
      return true;
    } else {
      console.error(`❌ Failed to register post:`, response.data.error);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error registering bot post:`, error.message);
    return false;
  }
}

// Main function to create and publish a test cast
async function publishTestCast() {
  try {
    console.log(`🚀 Publishing test cast...`);
    console.log(`🔑 Using signer: ${SIGNER_UUID ? 'Configured' : 'NOT CONFIGURED'}`);
    
    // Publish cast using Neynar v2 API
    const cast = await client.publishCast(SIGNER_UUID, testContent.text, {
      embeds: testContent.embeds || []
    });
    
    if (cast && cast.hash) {
      console.log(`✅ Cast published successfully!`);
      console.log(`📝 Content: ${testContent.text.substring(0, 100)}...`);
      console.log(`🔗 Cast hash: ${cast.hash}`);
      console.log(`🌐 Cast URL: https://warpcast.com/${cast.author.username}/${cast.hash}`);
      
      // Register in database for flywheel system
      const registered = await registerBotPost(
        cast.hash,
        testContent.text,
        'test_post',
        testContent.embeds?.[0]
      );
      
      if (registered) {
        console.log(`🎯 Test post ready for flywheel referencing!`);
      }
      
      return cast;
    } else {
      console.error('❌ Failed to publish cast - no hash returned');
      return null;
    }
  } catch (error) {
    console.error(`❌ Error publishing test cast:`, error);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    return null;
  }
}

// Run the test
publishTestCast().then(() => {
  console.log('✅ Test completed');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Test failed:', error);
  process.exit(1);
}); 