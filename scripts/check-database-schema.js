const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function checkDatabaseSchema() {
  console.log('🔍 Checking Supabase database schema...\n');

  try {
    // Check if key tables exist by trying to query them
    const tablesToCheck = [
      'journal_entries',
      'journal_shares', 
      'token_claims',
      'claim_notifications',
      'user_notification_details',
      'wisdom_extracts',
      'user_wisdom_progress',
      'daily_prompts',
      'daily_content_selections'
    ];

    for (const tableName of tablesToCheck) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);

        if (error) {
          console.log(`❌ ${tableName}: ${error.message}`);
        } else {
          console.log(`✅ ${tableName}: EXISTS (${data?.length || 0} rows)`);
        }
      } catch (err) {
        console.log(`❌ ${tableName}: ${err.message}`);
      }
    }

    console.log('\n📊 Summary:');
    console.log('- Tables with ✅ exist and are accessible');
    console.log('- Tables with ❌ either don\'t exist or have permission issues');
    console.log('\n💡 If tables are missing, run the setup scripts:');
    console.log('   node scripts/setup-database.sql');

  } catch (error) {
    console.error('Error checking database schema:', error);
  }
}

checkDatabaseSchema(); 