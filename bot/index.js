const { NeynarAPIClient } = require("@neynar/nodejs-sdk");
const cron = require('node-cron');
const axios = require('axios');
require('dotenv').config();

// Initialize Neynar client
const client = new NeynarAPIClient(process.env.NEYNAR_API_KEY);

// Bot configuration
const BOT_FID = process.env.BOT_FID || 5543; // Replace with actual @solaracosmos FID
const SIGNER_UUID = process.env.SIGNER_UUID;
const SOLARA_API_BASE = process.env.SOLARA_API_BASE || 'https://www.solara.fyi';

// Content templates for different post types
const CONTENT_TEMPLATES = {
  journal_affirmation: [
    {
      text: "🌞 Daily reflection prompt:\n\n\"How did this Sol day shape me?\"\n\nTake a moment to reflect on your cosmic journey and capture your thoughts.\n\nReflect with Solara: https://www.solara.fyi",
      embeds: ["https://www.solara.fyi"]
    },
    {
      text: "✨ Cosmic introspection time:\n\n\"What patterns am I noticing in my journey around the sun?\"\n\nYour reflections matter. Document your thoughts as you orbit through time.\n\nhttps://www.solara.fyi",
      embeds: ["https://www.solara.fyi"]
    },
    {
      text: "🌌 Today's reflection:\n\n\"What wisdom emerged from today's orbit?\"\n\nEvery rotation brings new insights. Capture yours.\n\nJournal your journey: https://www.solara.fyi",
      embeds: ["https://www.solara.fyi"]
    }
  ],
  
  sol_age_prompt: [
    {
      text: "☀️ Forget birthdays—how many rotations around the sun have you completed?\n\nYour Sol Age reveals the cosmic truth of your journey through space.\n\nDiscover your Sol Age: https://www.solara.fyi",
      embeds: ["https://www.solara.fyi"]
    },
    {
      text: "🌍 While Earth completes another orbit, how many have you experienced?\n\nYour Sol Age is more than a number—it's your cosmic odometer.\n\nCalculate yours: https://www.solara.fyi",
      embeds: ["https://www.solara.fyi"]
    },
    {
      text: "🪐 Time isn't linear—it's orbital. How many times have you circled our star?\n\nYour Sol Age tells the real story of your cosmic journey.\n\nhttps://www.solara.fyi",
      embeds: ["https://www.solara.fyi"]
    }
  ],
  
  pledge_encouragement: [
    {
      text: "✨ The cosmos calls for your commitment.\n\nWhat vow will you inscribe into eternity? Make a pledge that aligns with your cosmic purpose.\n\nJoin the convergence: https://www.solara.fyi",
      embeds: ["https://www.solara.fyi"]
    },
    {
      text: "🌟 Solar vows carry the weight of celestial intention.\n\nWhat promise will you make to your future self as you continue your orbit?\n\nMake your vow: https://www.solara.fyi",
      embeds: ["https://www.solara.fyi"]
    },
    {
      text: "🔥 Channel the sun's energy into commitment.\n\nYour pledge becomes part of the cosmic record. What will you vow?\n\nhttps://www.solara.fyi",
      embeds: ["https://www.solara.fyi"]
    }
  ]
};

// Track which content was used to avoid immediate repeats
let usedContent = {
  journal_affirmation: [],
  sol_age_prompt: [],
  pledge_encouragement: []
};

// Get random content that hasn't been used recently
function getRandomContent(type) {
  const templates = CONTENT_TEMPLATES[type];
  const available = templates.filter((_, index) => !usedContent[type].includes(index));
  
  // If all content has been used, reset
  if (available.length === 0) {
    usedContent[type] = [];
    return templates[Math.floor(Math.random() * templates.length)];
  }
  
  const selected = available[Math.floor(Math.random() * available.length)];
  const selectedIndex = templates.indexOf(selected);
  usedContent[type].push(selectedIndex);
  
  // Keep only last 2 used items to allow cycling
  if (usedContent[type].length > 2) {
    usedContent[type].shift();
  }
  
  return selected;
}

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
    
    const content = getRandomContent(postType);
    
    // Publish cast using Neynar
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
        console.log(`🎯 Bot post ready for flywheel referencing!`);
      }
      
      return cast;
    } else {
      console.error('❌ Failed to publish cast - no hash returned');
      return null;
    }
  } catch (error) {
    console.error(`❌ Error publishing ${postType} cast:`, error);
    return null;
  }
}

// Posting schedule - optimized for engagement
function setupSchedule() {
  console.log('🕒 Setting up posting schedule...');
  
  // Journal affirmations: Daily at 8 AM ET (good for morning reflection)
  cron.schedule('0 8 * * *', () => {
    console.log('⏰ Scheduled journal affirmation post');
    publishCast('journal_affirmation');
  }, {
    timezone: "America/New_York"
  });
  
  // Sol Age prompts: Every 3 days at 2 PM ET (afternoon discovery)
  cron.schedule('0 14 */3 * *', () => {
    console.log('⏰ Scheduled sol age prompt post');
    publishCast('sol_age_prompt');
  }, {
    timezone: "America/New_York"
  });
  
  // Pledge encouragement: Twice weekly (Tuesday 6 PM, Friday 10 AM ET)
  cron.schedule('0 18 * * 2', () => {
    console.log('⏰ Scheduled pledge encouragement post');
    publishCast('pledge_encouragement');
  }, {
    timezone: "America/New_York"
  });
  
  cron.schedule('0 10 * * 5', () => {
    console.log('⏰ Scheduled pledge encouragement post');
    publishCast('pledge_encouragement');
  }, {
    timezone: "America/New_York"
  });
  
  console.log('✅ All schedules configured!');
  console.log('📅 Journal affirmations: Daily at 8 AM ET');
  console.log('📅 Sol Age prompts: Every 3 days at 2 PM ET');
  console.log('📅 Pledge encouragement: Tue 6 PM & Fri 10 AM ET');
}

// Health check endpoint (if needed)
function healthCheck() {
  console.log('💓 Bot health check - all systems operational');
  console.log('🤖 Bot FID:', BOT_FID);
  console.log('🔑 Signer configured:', !!SIGNER_UUID);
  console.log('🌐 API base:', SOLARA_API_BASE);
}

// Initialize bot
async function initializeBot() {
  console.log('🌞 Initializing @solaracosmos bot...');
  
  // Validate configuration
  if (!process.env.NEYNAR_API_KEY) {
    console.error('❌ NEYNAR_API_KEY not found in environment variables');
    process.exit(1);
  }
  
  if (!SIGNER_UUID) {
    console.error('❌ SIGNER_UUID not found in environment variables');
    process.exit(1);
  }
  
  console.log('✅ Configuration validated');
  
  // Setup posting schedule
  setupSchedule();
  
  // Run health check
  healthCheck();
  
  // Optional: Post immediately for testing (comment out in production)
  if (process.env.NODE_ENV === 'development') {
    console.log('🧪 Development mode - posting test content...');
    setTimeout(() => publishCast('journal_affirmation'), 5000);
  }
  
  console.log('🚀 @solaracosmos bot is now running!');
  console.log('📊 Bot will create anchor posts for the Solara flywheel system');
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('👋 Shutting down @solaracosmos bot...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('👋 Shutting down @solaracosmos bot...');
  process.exit(0);
});

// Start the bot
initializeBot();