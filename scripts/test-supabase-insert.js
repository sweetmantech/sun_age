const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function testInsert() {
  const { data, error } = await supabase
    .from('journal_entries')
    .insert([
      {
        user_fid: 123456, // Use a test FID
        sol_day: 9999,
        content: 'Test migration entry from script',
        word_count: 5,
        preservation_status: 'local',
      },
    ])
    .select();

  if (error) {
    console.error('Insert error:', error);
  } else {
    console.log('Insert success:', data);
  }
}

testInsert(); 