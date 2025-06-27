-- Seed data for bot posts
-- These are example posts to get the flywheel started
-- Replace with actual cast hashes once @solaracosmos makes real posts

-- Journal Affirmation Post
INSERT INTO bot_posts (cast_hash, content, post_type, mini_app_url, bot_fid, is_active) VALUES 
(
  '0x0000000000000000000000000000000000000001', -- Replace with actual cast hash
  '🌞 Daily reflection prompt:\n\n"How did this Sol day shape me?"\n\nTake a moment to reflect on your cosmic journey and capture your thoughts.\n\nReflect with Solara: https://www.solara.fyi',
  'journal_affirmation',
  'https://www.solara.fyi',
  5543, -- Replace with actual @solaracosmos FID
  true
);

-- Sol Age Prompt Post  
INSERT INTO bot_posts (cast_hash, content, post_type, mini_app_url, bot_fid, is_active) VALUES 
(
  '0x0000000000000000000000000000000000000002', -- Replace with actual cast hash
  '☀️ Forget birthdays—how many rotations around the sun have you completed?\n\nYour Sol Age reveals the cosmic truth of your journey through space.\n\nDiscover your Sol Age: https://www.solara.fyi',
  'sol_age_prompt', 
  'https://www.solara.fyi',
  5543, -- Replace with actual @solaracosmos FID
  true
);

-- Pledge Encouragement Post
INSERT INTO bot_posts (cast_hash, content, post_type, mini_app_url, bot_fid, is_active) VALUES 
(
  '0x0000000000000000000000000000000000000003', -- Replace with actual cast hash
  '✨ The cosmos calls for your commitment.\n\nWhat vow will you inscribe into eternity? Make a pledge that aligns with your cosmic purpose.\n\nJoin the convergence: https://www.solara.fyi',
  'pledge_encouragement',
  'https://www.solara.fyi', 
  5543, -- Replace with actual @solaracosmos FID
  true
);

-- Comments
COMMENT ON TABLE bot_posts IS 'Seed data includes example posts for each type. Update cast_hash and bot_fid with real values from @solaracosmos account.';