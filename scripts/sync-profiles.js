import { createServiceRoleClient } from '../src/utils/supabase/server.js';

async function syncProfiles() {
  const supabase = createServiceRoleClient();

  // Get all unique user_fid from journal_entries
  const { data: entryFids, error: entryError } = await supabase
    .from('journal_entries')
    .select('user_fid');
  if (entryError) {
    console.error('Error fetching journal_entries:', entryError);
    return;
  }

  // Get all unique user_fid from journal_shares
  const { data: shareFids, error: shareError } = await supabase
    .from('journal_shares')
    .select('user_fid');
  if (shareError) {
    console.error('Error fetching journal_shares:', shareError);
    return;
  }

  // Combine and dedupe
  const allFids = new Set([
    ...entryFids.map(e => e.user_fid),
    ...shareFids.map(s => s.user_fid),
  ].filter(Boolean));

  console.log(`Found ${allFids.size} unique FIDs to sync`);

  for (const fid of allFids) {
    const username = `soluser_${fid}`;
    const display_name = `soluser_${fid}`;
    // Upsert profile
    const { error } = await supabase
      .from('profiles')
      .upsert([{ fid, username, display_name }], { onConflict: ['fid'] });
    if (error) {
      console.error(`Error upserting profile for fid ${fid}:`, error);
    } else {
      console.log(`Profile synced for fid ${fid}`);
    }
  }
  console.log('Profile sync complete.');
}

syncProfiles().catch(console.error); 