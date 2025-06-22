-- Daily prompts/affirmations table
CREATE TABLE daily_prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_type TEXT NOT NULL CHECK (prompt_type IN ('affirmation', 'daily_prompt', 'midday_reflection', 'evening_reflection')),
  prompt_description TEXT NOT NULL,
  prompt_author TEXT DEFAULT 'Abri Mathos',
  inspiration_notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Daily content selections (caching layer)
CREATE TABLE daily_content_selections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL UNIQUE,
  primary_prompt_id UUID REFERENCES daily_prompts(id),
  secondary_prompt_ids UUID[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_daily_prompts_type ON daily_prompts(prompt_type);
CREATE INDEX idx_daily_prompts_active ON daily_prompts(is_active);
CREATE UNIQUE INDEX idx_daily_content_date ON daily_content_selections(date); 