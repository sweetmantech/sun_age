# 🚀 Farcaster Flywheel Deployment Checklist

Your credentials are configured and ready! Follow these steps to deploy the complete flywheel system.

## ✅ **Phase 1: Database Setup**

### 1.1 Add Bot Posts Schema
Go to your **Supabase SQL Editor** and run:

```sql
-- Bot Posts Schema
CREATE TABLE IF NOT EXISTS bot_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cast_hash TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL,
  post_type TEXT NOT NULL CHECK (post_type IN ('journal_affirmation', 'sol_age_prompt', 'pledge_encouragement')),
  mini_app_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  bot_fid INTEGER NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_bot_posts_active_type ON bot_posts (post_type, is_active, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bot_posts_cast_hash ON bot_posts (cast_hash);
```

### 1.2 Add Database Functions
Run this in Supabase SQL Editor:

```sql
-- Function to create bot post and deactivate old ones
CREATE OR REPLACE FUNCTION create_bot_post_with_deactivation(
  p_cast_hash TEXT,
  p_content TEXT,
  p_post_type TEXT,
  p_mini_app_url TEXT DEFAULT NULL,
  p_bot_fid INTEGER
) RETURNS UUID AS $$
DECLARE
  new_post_id UUID;
BEGIN
  UPDATE bot_posts SET is_active = false WHERE post_type = p_post_type AND is_active = true;
  INSERT INTO bot_posts (cast_hash, content, post_type, mini_app_url, bot_fid, is_active)
  VALUES (p_cast_hash, p_content, p_post_type, p_mini_app_url, p_bot_fid, true)
  RETURNING id INTO new_post_id;
  RETURN new_post_id;
END;
$$ LANGUAGE plpgsql;

-- Function to activate specific bot post
CREATE OR REPLACE FUNCTION activate_bot_post(
  p_post_id UUID,
  p_post_type TEXT
) RETURNS VOID AS $$
BEGIN
  UPDATE bot_posts SET is_active = false WHERE post_type = p_post_type AND is_active = true;
  UPDATE bot_posts SET is_active = true WHERE id = p_post_id;
END;
$$ LANGUAGE plpgsql;
```

## ✅ **Phase 2: Deploy API Updates**

### 2.1 Copy New API Files
Add these new files to your Solara project:

- ✅ `src/app/api/bot-posts/route.ts`
- ✅ `src/app/api/bot-management/route.ts`
- ✅ `src/lib/botPosts.ts`
- ✅ `src/lib/sharing.ts`

### 2.2 Update Existing Files
Replace these files with updated versions:

- ✅ `src/lib/journal.ts`
- ✅ `src/components/SunCycleAge.tsx`
- ✅ `src/app/soldash/page.tsx`
- ✅ `src/app/results/page.tsx`
- ✅ `src/app/ceremony/page.tsx`

### 2.3 Deploy to Production
```bash
# In your Solara project
git add .
git commit -m "Add Farcaster flywheel system"
git push origin main

# Vercel will auto-deploy
```

## ✅ **Phase 3: Test API Connection**

### 3.1 Wait for Deployment
Wait ~2 minutes for Vercel deployment to complete.

### 3.2 Test API Endpoints
```bash
# Test health (should work already)
curl https://www.solara.fyi/api/health

# Test new bot-posts endpoint (should work after deployment)
curl https://www.solara.fyi/api/bot-posts

# Expected response: {"posts":{"journal_affirmation":null,"sol_age_prompt":null,"pledge_encouragement":null}}
```

### 3.3 Re-run Bot Connection Test
```bash
cd bot/
node test-connection.js
```

**Expected result:** ✅ FOUND WORKING URL: https://www.solara.fyi

## ✅ **Phase 4: Deploy Bot**

### 4.1 Set Up Bot Environment
```bash
cd bot/
cp .env.production .env
```

Your `.env` is already configured with:
- ✅ NEYNAR_API_KEY: `2E83FDFE-D25D-4AD1-9D9C-95021AB9B774`
- ✅ BOT_FID: `1090419`
- ✅ SIGNER_UUID: `3adabbec-5a03-48d4-b276-7c5ff913a36f`
- ✅ SOLARA_API_BASE: `https://www.solara.fyi`

### 4.2 Start Bot
```bash
# Test first
npm run dev

# If test works, start production
npm start
```

### 4.3 Verify Bot is Working
```bash
npm run logs
```

Look for:
- ✅ `Bot health check - all systems operational`
- ✅ `All schedules configured!`
- ✅ `@solaracosmos bot is now running!`

## ✅ **Phase 5: Test Complete Flywheel**

### 5.1 Bot Should Post Soon
In development mode, bot posts a test journal affirmation after 5 seconds.

### 5.2 Test User Sharing
1. Go to https://www.solara.fyi
2. Calculate your Sol Age and share it
3. **Expected:** Share should quote the bot's latest Sol Age prompt

### 5.3 Check Database
In Supabase, verify:
```sql
SELECT * FROM bot_posts ORDER BY created_at DESC;
```

## 🎯 **Success Criteria**

- ✅ Database tables created
- ✅ API endpoints return data (not 404)
- ✅ Bot connects successfully
- ✅ Bot posts appear in database
- ✅ User shares quote bot posts
- ✅ Flywheel system active!

## 🔧 **Troubleshooting**

**API 404 errors:** API endpoints not deployed yet - wait for Vercel deployment
**Bot connection fails:** Check bot `.env` configuration
**No bot posts:** Check bot logs for errors: `npm run logs`
**Shares don't quote bot:** Check `getLatestBotPost()` returns data

---

## 🚀 **Current Status**

- ✅ Bot credentials configured
- ✅ Production URLs identified  
- ⏳ **Next:** Deploy database schema and API endpoints
- ⏳ **Then:** Start bot and test flywheel

**Primary URL:** https://www.solara.fyi
**Backup URL:** https://sun-age.vercel.app