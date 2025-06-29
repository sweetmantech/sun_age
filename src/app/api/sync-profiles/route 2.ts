import { createServiceRoleClient } from '~/utils/supabase/server';

export async function POST() {
  try {
    const supabase = createServiceRoleClient();

    // Get all unique user_fid from journal_entries
    const { data: entryFids, error: entryError } = await supabase
      .from('journal_entries')
      .select('user_fid');
    if (entryError) {
      return new Response(JSON.stringify({ error: `Error fetching journal_entries: ${entryError.message}` }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get all unique user_fid from journal_shares
    const { data: shareFids, error: shareError } = await supabase
      .from('journal_shares')
      .select('user_fid');
    if (shareError) {
      return new Response(JSON.stringify({ error: `Error fetching journal_shares: ${shareError.message}` }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Combine and dedupe
    const allFids = new Set([
      ...entryFids.map(e => e.user_fid),
      ...shareFids.map(s => s.user_fid),
    ].filter(Boolean));

    type Result =
      | { fid: any; status: 'error'; message: string }
      | { fid: any; status: 'success'; username: string; display_name: string };
    const results: Result[] = [];
    for (const fid of allFids) {
      const username = `soluser_${fid}`;
      const display_name = `soluser_${fid}`;
      
      // Upsert profile
      const { error } = await supabase
        .from('profiles')
        .upsert([{ fid, username, display_name }], { onConflict: 'fid' });
      
      if (error) {
        results.push({ fid, status: 'error', message: error.message });
      } else {
        results.push({ fid, status: 'success', username, display_name });
      }
    }

    return new Response(JSON.stringify({
      message: 'Profile sync complete',
      totalFids: allFids.size,
      results
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in profile sync:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
} 