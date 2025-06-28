require('dotenv').config();
const { NeynarAPIClient } = require("@neynar/nodejs-sdk");
const axios = require('axios');

// Initialize Neynar client with v2 API
const client = new NeynarAPIClient(process.env.NEYNAR_API_KEY);

// Bot configuration
const BOT_FID = process.env.BOT_FID || 1090419;
const SIGNER_UUID = process.env.SIGNER_UUID;
const SOLARA_API_BASE = process.env.SOLARA_API_BASE || 'https://www.solara.fyi';

// Content templates for different post types
const CONTENT_TEMPLATES = {
  journal_affirmation: [
    {
      text: "🌞 Daily reflection prompt:\n\n\"How did this Sol day shape me?\"\n\nTake a moment to reflect on your cosmic journey and capture your thoughts.\n\nReflect with Solara: https://www.solara.fyi",
      embeds: [{ url: "https://www.solara.fyi" }]
    },
    {
      text: "✨ Cosmic introspection time:\n\n\"What patterns am I noticing in my journey around the sun?\"\n\nYour reflections matter. Document your thoughts as you orbit through time.\n\nhttps://www.solara.fyi",
      embeds: [{ url: "https://www.solara.fyi" }]
    },
    {
      text: "🌌 Today's reflection:\n\n\"What wisdom emerged from today's orbit?\"\n\nEvery rotation brings new insights. Capture yours.\n\nJournal your journey: https://www.solara.fyi",
      embeds: [{ url: "https://www.solara.fyi" }]
    }
  ],
  
  sol_age_prompt: [
    {
      text: "☀️ Forget birthdays—how many rotations around the sun have you completed?\n\nYour Sol Age reveals the cosmic truth of your journey through space.\n\nDiscover your Sol Age: https://www.solara.fyi",
      embeds: [{ url: "https://www.solara.fyi" }]
    },
    {
      text: "🌍 While Earth completes another orbit, how many have you experienced?\n\nYour Sol Age is more than a number—it's your cosmic odometer.\n\nCalculate yours: https://www.solara.fyi",
      embeds: [{ url: "https://www.solara.fyi" }]
    },
    {
      text: "🪐 Time isn't linear—it's orbital. How many times have you circled our star?\n\nYour Sol Age tells the real story of your cosmic journey.\n\nhttps://www.solara.fyi",
      embeds: [{ url: "https://www.solara.fyi" }]
    }
  ],
  
  pledge_encouragement: [
    {
      text: "✨ The cosmos calls for your commitment.\n\nWhat vow will you inscribe into eternity? Make a pledge that aligns with your cosmic purpose.\n\nJoin the convergence: https://www.solara.fyi",
      embeds: [{ url: "https://www.solara.fyi" }]
    },
    {
      text: "🌟 Solar vows carry the weight of celestial intention.\n\nWhat promise will you make to your future self as you continue your orbit?\n\nMake your vow: https://www.solara.fyi",
      embeds: [{ url: "https://www.solara.fyi" }]
    },
    {
      text: "🔥 Channel the sun's energy into commitment.\n\nYour pledge becomes part of the cosmic record. What will you vow?\n\nhttps://www.solara.fyi",
      embeds: [{ url: "https://www.solara.fyi" }]
    }
  ]
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

// Main function to create and publish a cast
async function publishCast(postType) {
  try {
    console.log(`🚀 Publishing ${postType} cast...`);
    
    const templates = CONTENT_TEMPLATES[postType];
    const content = templates[Math.floor(Math.random() * templates.length)];
    
    // Publish cast using Neynar v2 API
    const cast = await client.publishCast(SIGNER_UUID, content.text, {
      embeds: content.embeds || []
    });
    
    if (cast && cast.hash) {
      console.log(`✅ Cast published successfully!`);
      console.log(`📝 Content: ${content.text.substring(0, 100)}...`);
      console.log(`🔗 Cast hash: ${cast.hash}`);
      console.log(`🌐 Cast URL: https://warpcast.com/${cast.author.username}/${cast.hash}`);
      
      // Register in database for flywheel system
      const registered = await registerBotPost(
        cast.hash,
        content.text,
        postType,
        content.embeds?.[0]
      );
      
      if (registered) {
        console.log(`🎯 ${postType} post ready for flywheel referencing!`);
      }
      
      return cast;
    } else {
      console.error('❌ Failed to publish cast - no hash returned');
      return null;
    }
  } catch (error) {
    console.error(`❌ Error publishing ${postType} cast:`, error);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    return null;
  }
}

// Trigger all three types of posts
async function triggerAllPosts() {
  console.log('🎯 Triggering all bot post types for testing...\n');
  
  // Post each type with a delay between them
  await publishCast('journal_affirmation');
  console.log('\n---\n');
  
  await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay
  await publishCast('sol_age_prompt');
  console.log('\n---\n');
  
  await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay
  await publishCast('pledge_encouragement');
  
  console.log('\n✅ All post types triggered!');
  console.log('🎯 You can now test sharing for all content types.');
}

// Run the script
triggerAllPosts().then(() => {
  console.log('✅ Script completed');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Script failed:', error);
  process.exit(1);
}); 