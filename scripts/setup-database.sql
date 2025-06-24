-- Journal shares table
CREATE TABLE IF NOT EXISTS journal_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id UUID REFERENCES journal_entries(id) ON DELETE CASCADE,
  user_fid INTEGER NOT NULL,
  share_url TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Token claims table
CREATE TABLE IF NOT EXISTS token_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_fid INTEGER NOT NULL,
  amount DECIMAL NOT NULL,
  status TEXT DEFAULT 'pending',
  transaction_hash TEXT,
  claimed_at TIMESTAMP DEFAULT NOW()
);

-- Claim notifications table
CREATE TABLE IF NOT EXISTS claim_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_fid INTEGER NOT NULL,
  notification_type TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_journal_shares_entry_id ON journal_shares(entry_id);
CREATE INDEX IF NOT EXISTS idx_journal_shares_user_fid ON journal_shares(user_fid);
CREATE INDEX IF NOT EXISTS idx_token_claims_user_fid ON token_claims(user_fid);
CREATE INDEX IF NOT EXISTS idx_claim_notifications_user_fid ON claim_notifications(user_fid);

-- Add RLS (Row Level Security) policies
ALTER TABLE journal_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE token_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE claim_notifications ENABLE ROW LEVEL SECURITY;

-- Journal shares policies
CREATE POLICY "Users can view their own journal shares" ON journal_shares
  FOR SELECT USING (user_fid = auth.jwt() ->> 'sub'::integer);

CREATE POLICY "Users can insert their own journal shares" ON journal_shares
  FOR INSERT WITH CHECK (user_fid = auth.jwt() ->> 'sub'::integer);

CREATE POLICY "Users can update their own journal shares" ON journal_shares
  FOR UPDATE USING (user_fid = auth.jwt() ->> 'sub'::integer);

CREATE POLICY "Users can delete their own journal shares" ON journal_shares
  FOR DELETE USING (user_fid = auth.jwt() ->> 'sub'::integer);

-- Token claims policies
CREATE POLICY "Users can view their own token claims" ON token_claims
  FOR SELECT USING (user_fid = auth.jwt() ->> 'sub'::integer);

CREATE POLICY "Users can insert their own token claims" ON token_claims
  FOR INSERT WITH CHECK (user_fid = auth.jwt() ->> 'sub'::integer);

CREATE POLICY "Users can update their own token claims" ON token_claims
  FOR UPDATE USING (user_fid = auth.jwt() ->> 'sub'::integer);

-- Claim notifications policies
CREATE POLICY "Users can view their own claim notifications" ON claim_notifications
  FOR SELECT USING (user_fid = auth.jwt() ->> 'sub'::integer);

CREATE POLICY "Users can insert their own claim notifications" ON claim_notifications
  FOR INSERT WITH CHECK (user_fid = auth.jwt() ->> 'sub'::integer);

CREATE POLICY "Users can update their own claim notifications" ON claim_notifications
  FOR UPDATE USING (user_fid = auth.jwt() ->> 'sub'::integer); 