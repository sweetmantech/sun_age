import { createServiceRoleClient } from '~/utils/supabase/server';

export async function GET() {
  try {
    const supabase = createServiceRoleClient();
    
    // Check journal_shares table
    const { data: shares, error } = await supabase
      .from('journal_shares')
      .select('*')
      .limit(5);
      
    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    // Check journal_entries table
    const { data: entries, error: entriesError } = await supabase
      .from('journal_entries')
      .select('*')
      .limit(5);
      
    if (entriesError) {
      return new Response(JSON.stringify({ error: entriesError.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    return new Response(JSON.stringify({
      shares: shares || [],
      entries: entries || [],
      sharesCount: shares?.length || 0,
      entriesCount: entries?.length || 0,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
} 