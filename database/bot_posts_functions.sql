-- Database function to create a new bot post and deactivate old ones of the same type
-- This ensures only one post per type is active at a time

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
  -- First, deactivate all existing posts of the same type
  UPDATE bot_posts 
  SET is_active = false 
  WHERE post_type = p_post_type AND is_active = true;
  
  -- Create the new post
  INSERT INTO bot_posts (cast_hash, content, post_type, mini_app_url, bot_fid, is_active)
  VALUES (p_cast_hash, p_content, p_post_type, p_mini_app_url, p_bot_fid, true)
  RETURNING id INTO new_post_id;
  
  RETURN new_post_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get the latest active post for a specific type
CREATE OR REPLACE FUNCTION get_latest_bot_post(p_post_type TEXT)
RETURNS TABLE (
  id UUID,
  cast_hash TEXT,
  content TEXT,
  post_type TEXT,
  mini_app_url TEXT,
  is_active BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE,
  bot_fid INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT bp.id, bp.cast_hash, bp.content, bp.post_type, bp.mini_app_url, bp.is_active, bp.created_at, bp.bot_fid
  FROM bot_posts bp
  WHERE bp.post_type = p_post_type 
    AND bp.is_active = true
  ORDER BY bp.created_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Function to activate a specific bot post (deactivating others of same type)
CREATE OR REPLACE FUNCTION activate_bot_post(
  p_post_id UUID,
  p_post_type TEXT
) RETURNS VOID AS $$
BEGIN
  -- First, deactivate all existing posts of the same type
  UPDATE bot_posts 
  SET is_active = false 
  WHERE post_type = p_post_type AND is_active = true;
  
  -- Then activate the specified post
  UPDATE bot_posts
  SET is_active = true
  WHERE id = p_post_id;
END;
$$ LANGUAGE plpgsql;

-- Comments for documentation
COMMENT ON FUNCTION create_bot_post_with_deactivation IS 'Creates a new bot post and deactivates old posts of the same type';
COMMENT ON FUNCTION get_latest_bot_post IS 'Retrieves the latest active bot post for a specific type';
COMMENT ON FUNCTION activate_bot_post IS 'Activates a specific bot post and deactivates others of the same type';