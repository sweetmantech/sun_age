const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function setupBotPosts() {
  console.log('🤖 Setting up bot posts database schema...\n');

  try {
    // Create bot_posts table
    console.log('📋 Creating bot_posts table...');
    const { error: tableError } = await supabase.rpc('exec_sql', {
      sql: `
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
      `
    });

    if (tableError) {
      console.log(`❌ Error creating bot_posts table: ${tableError.message}`);
    } else {
      console.log('✅ bot_posts table created successfully');
    }

    // Create indexes
    console.log('📊 Creating indexes...');
    const { error: indexError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE INDEX IF NOT EXISTS idx_bot_posts_active_type ON bot_posts (post_type, is_active, created_at DESC);
        CREATE INDEX IF NOT EXISTS idx_bot_posts_cast_hash ON bot_posts (cast_hash);
      `
    });

    if (indexError) {
      console.log(`❌ Error creating indexes: ${indexError.message}`);
    } else {
      console.log('✅ Indexes created successfully');
    }

    // Create functions
    console.log('🔧 Creating database functions...');
    const { error: functionError } = await supabase.rpc('exec_sql', {
      sql: `
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
          UPDATE bot_posts 
          SET is_active = false 
          WHERE post_type = p_post_type AND is_active = true;
          
          INSERT INTO bot_posts (cast_hash, content, post_type, mini_app_url, bot_fid, is_active)
          VALUES (p_cast_hash, p_content, p_post_type, p_mini_app_url, p_bot_fid, true)
          RETURNING id INTO new_post_id;
          
          RETURN new_post_id;
        END;
        $$ LANGUAGE plpgsql;
      `
    });

    if (functionError) {
      console.log(`❌ Error creating function: ${functionError.message}`);
    } else {
      console.log('✅ Database functions created successfully');
    }

    // Test the setup
    console.log('🧪 Testing bot posts setup...');
    const { data: testData, error: testError } = await supabase
      .from('bot_posts')
      .select('*')
      .limit(1);

    if (testError) {
      console.log(`❌ Error testing bot_posts table: ${testError.message}`);
    } else {
      console.log(`✅ bot_posts table is accessible (${testData?.length || 0} rows)`);
    }

    console.log('\n🎉 Bot posts database setup complete!');
    console.log('\n📋 Next steps:');
    console.log('1. Deploy the updated code to production');
    console.log('2. Start the @solaracosmos bot');
    console.log('3. Test the bot integration');

  } catch (error) {
    console.error('Error setting up bot posts:', error);
  }
}

setupBotPosts(); 