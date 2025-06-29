import { createServiceRoleClient } from './src/utils/supabase/server.ts';

async function testShares() {
  console.log('Testing journal shares...');
  
  const supabase = createServiceRoleClient();
  
  // Check journal_shares table
  const { data: shares, error } = await supabase
    .from('journal_shares')
    .select('*')
    .limit(5);
    
  if (error) {
    console.error('Error fetching shares:', error);
    return;
  }
  
  console.log('Journal shares found:', shares?.length || 0);
  if (shares && shares.length > 0) {
    console.log('Sample share:', shares[0]);
  }
  
  // Check journal_entries table
  const { data: entries, error: entriesError } = await supabase
    .from('journal_entries')
    .select('*')
    .limit(5);
    
  if (entriesError) {
    console.error('Error fetching entries:', entriesError);
    return;
  }
  
  console.log('Journal entries found:', entries?.length || 0);
  if (entries && entries.length > 0) {
    console.log('Sample entry:', entries[0]);
  }
}

testShares().catch(console.error); 