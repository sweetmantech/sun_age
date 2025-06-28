import { createServiceRoleClient } from '~/utils/supabase/server';
import { NextRequest } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createServiceRoleClient();
    
    const { data: share, error } = await supabase
      .from('journal_shares')
      .select('*, journal_entries(*), user_fid')
      .eq('id', id)
      .single();

    if (error || !share || !share.journal_entries) {
      return new Response(JSON.stringify({ error: 'Entry not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(share), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching shared journal entry:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
} 