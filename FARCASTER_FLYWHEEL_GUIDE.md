# Farcaster Flywheel System Guide

This guide explains how to implement and deploy the viral Farcaster flywheel system for Solara, where bot posts become anchor points for user-generated content.

## 🎯 Flywheel Concept

### How It Works

1. **@solaracosmos bot posts anchor content** (daily affirmations, Sol Age prompts, pledge encouragement)
2. **Users interact with the mini app** (calculate Sol Age, write journal entries, make pledges)
3. **When users share, they quote the bot's post** (creating viral chains)
4. **Multiple users quote the same post** → **bot's post trends** → **more visibility** → **more users**

### Example Flow

```
@solaracosmos: "☀️ Forget birthdays—how many rotations around the sun have you completed?"
                                    ↓
   User A shares: quotes bot + "I've completed 8,760 rotations! 🌍"
   User B shares: quotes bot + "9,125 rotations here! What's yours?"
   User C shares: quotes bot + "8,400 rotations around our star ⭐"
                                    ↓
              Bot's original post trends from all the quotes
                                    ↓
                         More people see and try Solara
```

## 🏗️ Architecture Overview

### Database Layer
- `bot_posts` table stores anchor posts
- Only one active post per type at a time
- Automatic post rotation and deactivation

### API Layer
- `/api/bot-posts` - CRUD operations for bot posts
- `/api/bot-management` - Admin interface for post management
- Integrated with existing share endpoints

### Bot Layer
- Automated posting via Neynar SDK
- Scheduled content with optimized timing
- Automatic database registration

### Frontend Layer
- Enhanced sharing functions that fetch and reference bot posts
- Seamless integration with existing share flows
- Fallback handling for non-frame scenarios

## 📦 Deployment Steps

### 1. Database Setup

```sql
-- Run these SQL files in order:
psql -f database/bot_posts_schema.sql
psql -f database/bot_posts_functions.sql
```

### 2. Deploy API Changes

The following new files need to be deployed to your main Solara app:

```
src/app/api/bot-posts/route.ts
src/app/api/bot-management/route.ts
src/lib/botPosts.ts
src/lib/sharing.ts (updated)
src/lib/journal.ts (updated)
```

And these existing files have been updated:
```
src/components/SunCycleAge.tsx
src/app/soldash/page.tsx
src/app/results/page.tsx
src/app/ceremony/page.tsx
```

### 3. Set Up @solaracosmos Bot

Following [Neynar's guide](https://docs.neynar.com/docs/how-to-create-a-farcaster-bot):

1. **Get Neynar API Key**
   - Go to [dev.neynar.com](https://dev.neynar.com)
   - Create account and get API key

2. **Set Up Bot Account**
   - Log into @solaracosmos Farcaster account
   - Generate signer at Neynar dev portal
   - Approve signer transaction

3. **Deploy Bot**
   ```bash
   # Copy bot files to server
   scp -r bot/ user@server:/path/to/solaracosmos-bot/
   
   # Install and configure
   cd /path/to/solaracosmos-bot/
   npm install
   cp .env.example .env
   nano .env  # Add your API keys and config
   
   # Start bot
   npm start
   ```

### 4. Configure Environment Variables

#### Main App (.env)
```bash
# No new variables needed - API endpoints are public
```

#### Bot (.env)
```bash
NEYNAR_API_KEY=your_neynar_api_key
BOT_FID=your_solaracosmos_fid
SIGNER_UUID=your_generated_signer_uuid
SOLARA_API_BASE=https://www.solara.fyi
NODE_ENV=production
```

## 🕐 Posting Schedule

Optimized for maximum engagement and flywheel activation:

- **Journal Affirmations**: Daily at 8 AM ET (morning reflection time)
- **Sol Age Prompts**: Every 3 days at 2 PM ET (afternoon discovery)
- **Pledge Encouragement**: Tuesday 6 PM & Friday 10 AM ET (commitment moments)

## 📊 Content Strategy

### Journal Affirmations
- Morning reflection prompts
- Cosmic introspection themes
- Questions that inspire sharing

Example: *"🌞 Daily reflection prompt: 'How did this Sol day shape me?' Take a moment to reflect on your cosmic journey and capture your thoughts."*

### Sol Age Prompts
- Birthday vs. rotations framing
- Cosmic odometer concepts
- Age reframing themes

Example: *"☀️ Forget birthdays—how many rotations around the sun have you completed? Your Sol Age reveals the cosmic truth of your journey through space."*

### Pledge Encouragement
- Cosmic commitment themes
- Eternal inscription messaging
- Vow inspiration

Example: *"✨ The cosmos calls for your commitment. What vow will you inscribe into eternity? Make a pledge that aligns with your cosmic purpose."*

## 🔧 Management Interface

### View All Bot Posts
```bash
curl https://www.solara.fyi/api/bot-management
```

### Activate Specific Post
```bash
curl -X POST https://www.solara.fyi/api/bot-management \
  -H "Content-Type: application/json" \
  -d '{"action": "activate", "postId": "uuid-here"}'
```

### Monitor Bot Status
```bash
# On bot server
pm2 status
pm2 logs solaracosmos-bot
```

## 📈 Measuring Success

### Metrics to Track

1. **Bot Post Engagement**
   - Likes, recasts, replies on bot posts
   - Quote casts referencing bot posts

2. **User Share Rates**
   - % of users who share after interacting
   - Share completion rates

3. **Viral Coefficient**
   - New users per shared post
   - Reference chain lengths

4. **Content Performance**
   - Which post types drive most sharing
   - Optimal posting times

### Analytics Setup

Monitor these in your analytics:
- Share events with `botPostReference` parameter
- Cast hash tracking for quote relationships
- User acquisition attribution from bot posts

## 🚀 Optimization Tips

### Content Optimization
1. **A/B test different prompts** - Try variations of successful templates
2. **Monitor trending topics** - Adapt content to current conversations
3. **Seasonal content** - Solstices, equinoxes, cosmic events

### Timing Optimization
1. **Track engagement by hour** - Adjust posting schedule
2. **Test different frequencies** - Find optimal posting cadence
3. **Cross-timezone posting** - Consider global audience

### Technical Optimization
1. **Cache bot posts** - Reduce API calls on share
2. **Preload next posts** - Faster sharing experience
3. **Fallback handling** - Graceful degradation if bot post unavailable

## 🛠️ Troubleshooting

### Bot Not Posting
- Check PM2 status: `pm2 status`
- Verify Neynar signer is valid
- Check environment variables
- Review bot logs: `pm2 logs solaracosmos-bot`

### Posts Not Registering
- Verify Solara API is accessible from bot
- Check API endpoint responses
- Confirm database functions are deployed

### Users Not Referencing Bot Posts
- Check if `getLatestBotPost()` returns data
- Verify ComposeCast parent parameter
- Test sharing flow in development

### Low Engagement
- Review content templates for engagement
- Adjust posting schedule based on analytics
- Experiment with different post formats

## 🔄 Expanding the System

### Twitter Integration
Later, you can expand to Twitter using the same pattern:
1. Create Twitter bot account
2. Post similar anchor content
3. Have users quote tweet when sharing
4. Same flywheel effect on Twitter

### Additional Content Types
Easy to add new post types:
1. Add to `BotPostType` enum
2. Create content templates
3. Add to posting schedule
4. Update sharing functions

### Channel-Specific Posts
Target specific Farcaster channels:
1. Add `channelKey` to bot posts
2. Schedule channel-specific content
3. Encourage channel-based sharing

## 📞 Support

For issues with:
- **Neynar SDK**: [Neynar Docs](https://docs.neynar.com)
- **Farcaster Protocol**: [Farcaster Docs](https://docs.farcaster.xyz)
- **PM2 Process Management**: [PM2 Docs](https://pm2.keymetrics.io)

---

This flywheel system creates a sustainable viral loop where bot content amplifies user-generated content, leading to more visibility and user acquisition for Solara. The key is consistent, engaging anchor posts that users want to reference when sharing their own experiences.