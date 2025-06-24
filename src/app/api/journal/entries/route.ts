import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceRoleClient } from '~/utils/supabase/server';

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: entries, error } = await supabase
    .from('journal_entries')
    .select('*')
    .eq('user_fid', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching journal entries:', error);
    return NextResponse.json({ error: 'Failed to fetch journal entries' }, { status: 500 });
  }

  return NextResponse.json({ entries });
}

export async function POST(req: NextRequest) {
    try {
        const { content, sol_day, userFid } = await req.json();

        if (!content || typeof sol_day === 'undefined') {
            return NextResponse.json({ error: 'Missing required fields: content and sol_day' }, { status: 400 });
        }

        // If userFid is provided, use service role to bypass RLS (for migration)
        // Otherwise, use regular client with auth
        let supabase;
        let finalUserFid: number;
        
        if (userFid) {
            // Use service role for migration
            supabase = createServiceRoleClient();
            finalUserFid = userFid;
        } else {
            // Use regular client with auth
            supabase = await createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            }
            finalUserFid = parseInt(user.id);
        }

        const newEntry = {
            user_fid: finalUserFid,
            content,
            sol_day,
            word_count: content.trim().split(/\s+/).length,
            preservation_status: 'local',
        };

        const { data: entry, error } = await supabase
            .from('journal_entries')
            .insert(newEntry)
            .select()
            .single();

        if (error) {
            console.error('Error creating journal entry:', error);
            return NextResponse.json({ error: 'Failed to create journal entry' }, { status: 500 });
        }

        return NextResponse.json({ entry });

    } catch (error) {
        console.error('Error parsing request body:', error);
        return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }
} 