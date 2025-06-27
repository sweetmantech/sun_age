# @solaracosmos Bot

Automated Farcaster bot for creating anchor posts that power the Solara flywheel system. When users share their Sol Age, journal entries, or pledges, they will quote these bot posts to create viral chains.

## Features

- **Scheduled Content**: Posts journal affirmations, Sol Age prompts, and pledge encouragement on optimized schedules
- **Flywheel Integration**: Automatically registers posts in Solara database for user references
- **Content Rotation**: Multiple templates for each post type to avoid repetition
- **Production Ready**: Uses PM2 for process management and monitoring

## Setup Instructions

### 1. Prerequisites

- Node.js (v16 or higher)
- PM2 for process management: `npm install -g pm2`
- [Neynar API key](https://dev.neynar.com)
- @solaracosmos Farcaster account with signer

### 2. Bot Account Setup

Following [Neynar's guide](https://docs.neynar.com/docs/how-to-create-a-farcaster-bot):

1. Go to [Neynar Dev Portal](https://dev.neynar.com)
2. Navigate to App → "Agents and bots" → "use existing account"
3. Sign in with the @solaracosmos Farcaster account
4. Generate and approve a signer UUID
5. Copy the signer UUID for configuration

### 3. Environment Configuration

```bash
# Copy environment template
cp .env.example .env

# Edit with your values
nano .env
```

Required environment variables:
- `NEYNAR_API_KEY`: Your Neynar API key
- `BOT_FID`: @solaracosmos Farcaster ID
- `SIGNER_UUID`: Generated signer for the bot account
- `SOLARA_API_BASE`: Your Solara API base URL

### 4. Installation

```bash
# Install dependencies
npm install

# Create logs directory
mkdir logs
```

### 5. Running the Bot

#### Development Mode
```bash
# Run once for testing
npm run dev

# This will post a test journal affirmation after 5 seconds
```

#### Production Mode
```bash
# Start with PM2
npm start

# Check status
npm run status

# View logs
npm run logs

# Stop bot
npm run stop
```

## Posting Schedule

Optimized for maximum engagement and flywheel activation:

- **Journal Affirmations**: Daily at 8 AM ET
- **Sol Age Prompts**: Every 3 days at 2 PM ET  
- **Pledge Encouragement**: Tuesday 6 PM & Friday 10 AM ET

## How the Flywheel Works

1. **Bot Posts**: @solaracosmos creates anchor posts for each content type
2. **Database Registration**: Each post is automatically registered in the Solara database
3. **User Sharing**: When users share their content, it references the latest bot post
4. **Viral Chains**: Multiple users quote the same bot post, creating trending chains

### Example Flow

```
@solaracosmos posts: "☀️ Forget birthdays—how many rotations around the sun have you completed?"
                             ↓
                User calculates Sol Age and shares: quotes the bot post + their result
                             ↓
                Multiple users do the same → bot's post trends
```

## Content Templates

### Journal Affirmations
- Morning reflection prompts
- Cosmic introspection themes
- Wisdom emergence focus

### Sol Age Prompts  
- Birthday vs. rotations framing
- Cosmic odometer concept
- Time as orbital journey

### Pledge Encouragement
- Cosmic commitment themes
- Eternal inscription messaging
- Solar vow concepts

## Monitoring

```bash
# Check bot status
pm2 status

# View real-time logs
pm2 logs solaracosmos-bot

# Monitor resource usage
pm2 monit

# Restart if needed
pm2 restart solaracosmos-bot
```

## Database Integration

The bot automatically:
1. Creates posts on Farcaster via Neynar
2. Registers each post in Solara's `bot_posts` table
3. Deactivates old posts of the same type
4. Makes new posts available for user references

## Troubleshooting

### Bot not posting
- Check PM2 status: `pm2 status`
- Verify environment variables are set
- Check logs: `pm2 logs solaracosmos-bot`
- Ensure signer is still valid in Neynar dashboard

### Posts not registering in database
- Verify `SOLARA_API_BASE` URL is correct
- Check Solara API `/api/bot-posts` endpoint is accessible
- Review logs for API error messages

### Content repetition
- Bot automatically cycles through templates
- Check `usedContent` tracking in logs
- Add more templates to `CONTENT_TEMPLATES` if needed

## Scaling

To increase posting frequency:
1. Add more content templates to avoid repetition
2. Adjust cron schedules in `setupSchedule()` function
3. Consider A/B testing different post times
4. Monitor engagement metrics to optimize timing

## Support

For issues or questions:
- Check Neynar documentation: https://docs.neynar.com
- Review PM2 docs: https://pm2.keymetrics.io
- Monitor Farcaster network status