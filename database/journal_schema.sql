-- Journal entries table
CREATE TABLE IF NOT EXISTS journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_fid INTEGER NOT NULL,
  sol_day INTEGER NOT NULL,
  content TEXT NOT NULL,
  preservation_status TEXT DEFAULT 'local',
  preservation_tx_hash TEXT,
  word_count INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  preserved_at TIMESTAMP
);

-- Wisdom extracts table
CREATE TABLE IF NOT EXISTS wisdom_extracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  journal_entry_id UUID REFERENCES journal_entries(id),
  user_fid INTEGER NOT NULL,
  sol_day INTEGER NOT NULL,
  wisdom_text TEXT NOT NULL,
  extraction_method TEXT NOT NULL,
  ai_confidence DECIMAL,
  preservation_status TEXT DEFAULT 'local',
  share_status TEXT DEFAULT 'private',
  preservation_tx_hash TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  preserved_at TIMESTAMP,
  shared_at TIMESTAMP
);

-- User wisdom progress table
CREATE TABLE IF NOT EXISTS user_wisdom_progress (
  user_fid INTEGER PRIMARY KEY,
  current_phase INTEGER DEFAULT 1,
  total_extractions INTEGER DEFAULT 0,
  successful_ai_matches INTEGER DEFAULT 0,
  wisdom_streak INTEGER DEFAULT 0,
  last_extraction_date DATE,
  phase_updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_journal_entries_user_fid ON journal_entries(user_fid);
CREATE INDEX IF NOT EXISTS idx_journal_entries_sol_day ON journal_entries(sol_day);
CREATE INDEX IF NOT EXISTS idx_journal_entries_created_at ON journal_entries(created_at);
CREATE INDEX IF NOT EXISTS idx_wisdom_extracts_user_fid ON wisdom_extracts(user_fid);
CREATE INDEX IF NOT EXISTS idx_wisdom_extracts_journal_entry_id ON wisdom_extracts(journal_entry_id);
CREATE INDEX IF NOT EXISTS idx_wisdom_extracts_sol_day ON wisdom_extracts(sol_day);

-- Add RLS (Row Level Security) policies
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE wisdom_extracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_wisdom_progress ENABLE ROW LEVEL SECURITY;

-- Journal entries policies
CREATE POLICY "Users can view their own journal entries" ON journal_entries
  FOR SELECT USING (user_fid = auth.jwt() ->> 'sub'::integer);

CREATE POLICY "Users can insert their own journal entries" ON journal_entries
  FOR INSERT WITH CHECK (user_fid = auth.jwt() ->> 'sub'::integer);

CREATE POLICY "Users can update their own journal entries" ON journal_entries
  FOR UPDATE USING (user_fid = auth.jwt() ->> 'sub'::integer);

CREATE POLICY "Users can delete their own journal entries" ON journal_entries
  FOR DELETE USING (user_fid = auth.jwt() ->> 'sub'::integer);

-- Wisdom extracts policies
CREATE POLICY "Users can view their own wisdom extracts" ON wisdom_extracts
  FOR SELECT USING (user_fid = auth.jwt() ->> 'sub'::integer);

CREATE POLICY "Users can insert their own wisdom extracts" ON wisdom_extracts
  FOR INSERT WITH CHECK (user_fid = auth.jwt() ->> 'sub'::integer);

CREATE POLICY "Users can update their own wisdom extracts" ON wisdom_extracts
  FOR UPDATE USING (user_fid = auth.jwt() ->> 'sub'::integer);

CREATE POLICY "Users can delete their own wisdom extracts" ON wisdom_extracts
  FOR DELETE USING (user_fid = auth.jwt() ->> 'sub'::integer);

-- User wisdom progress policies
CREATE POLICY "Users can view their own wisdom progress" ON user_wisdom_progress
  FOR SELECT USING (user_fid = auth.jwt() ->> 'sub'::integer);

CREATE POLICY "Users can insert their own wisdom progress" ON user_wisdom_progress
  FOR INSERT WITH CHECK (user_fid = auth.jwt() ->> 'sub'::integer);

CREATE POLICY "Users can update their own wisdom progress" ON user_wisdom_progress
  FOR UPDATE USING (user_fid = auth.jwt() ->> 'sub'::integer); 