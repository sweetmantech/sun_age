-- Bot Posts Schema
-- This table stores posts made by the @solaracosmos bot that users can reference when sharing

CREATE TABLE IF NOT EXISTS bot_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cast_hash TEXT NOT NULL UNIQUE, -- Farcaster cast hash (with 0x prefix)
  content TEXT NOT NULL, -- The bot's cast text content
  post_type TEXT NOT NULL CHECK (post_type IN ('journal_affirmation', 'sol_age_prompt', 'pledge_encouragement')), -- Type of bot post
  mini_app_url TEXT, -- Mini app URL embedded in the post
  is_active BOOLEAN DEFAULT true, -- Whether this post is currently active for referencing
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  bot_fid INTEGER NOT NULL -- FID of the bot account (solaracosmos)
);

-- Index for fast lookups of active posts by type
CREATE INDEX IF NOT EXISTS idx_bot_posts_active_type ON bot_posts (post_type, is_active, created_at DESC);

-- Index for cast hash lookups
CREATE INDEX IF NOT EXISTS idx_bot_posts_cast_hash ON bot_posts (cast_hash);

-- Comments for documentation
COMMENT ON TABLE bot_posts IS 'Stores bot posts that can be referenced when users share content';
COMMENT ON COLUMN bot_posts.cast_hash IS 'Farcaster cast hash that can be used to reference the post';
COMMENT ON COLUMN bot_posts.post_type IS 'Type of content: journal_affirmation, sol_age_prompt, or pledge_encouragement';
COMMENT ON COLUMN bot_posts.is_active IS 'Whether this post is currently the active one for its type';