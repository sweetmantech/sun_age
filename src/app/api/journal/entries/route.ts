import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceRoleClient } from '~/utils/supabase/server';

export async function GET(req: NextRequest) {
  const isDev = process.env.NODE_ENV === 'development';
  const userFidParam = req.nextUrl.searchParams.get('userFid');

  let userFid: number | null = null;
  let supabase;

  if (isDev && userFidParam) {
    supabase = createServiceRoleClient();
    userFid = parseInt(userFidParam, 10);
  } else {
    supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    userFid = parseInt(user.id, 10);
  }

  const { data: entries, error } = await supabase
    .from('journal_entries')
    .select('*')
    .eq('user_fid', userFid)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching journal entries:', error);
    return NextResponse.json({ error: 'Failed to fetch journal entries' }, { status: 500 });
  }

  return NextResponse.json({ entries });
}

export async function POST(req: NextRequest) {
    try {
        console.log('[API] Journal entries POST request received');
        
        // Check content length
        const contentLength = req.headers.get('content-length');
        console.log('[API] Content length:', contentLength);
        
        const body = await req.json();
        console.log('[API] Request body:', body);
        console.log('[API] Request body type:', typeof body);
        console.log('[API] Request body keys:', Object.keys(body));
        
        const { content, sol_day, userFid } = body;

        console.log('[API] Extracted fields:', { 
            content: !!content, 
            contentLength: content?.length,
            sol_day, 
            userFid, 
            userFidType: typeof userFid 
        });

        // Validate content
        if (!content || typeof content !== 'string') {
            console.error('[API] Invalid content:', { content, contentType: typeof content });
            return NextResponse.json({ error: 'Invalid content field' }, { status: 400 });
        }

        if (!sol_day || typeof sol_day !== 'number') {
            console.error('[API] Invalid sol_day:', { sol_day, solDayType: typeof sol_day });
            return NextResponse.json({ error: 'Invalid sol_day field' }, { status: 400 });
        }

        // If userFid is provided, use service role to bypass RLS (for migration)
        // Otherwise, use regular client with auth
        let supabase;
        let finalUserFid: number;
        
        if (userFid) {
            // Validate userFid is a number
            const parsedUserFid = typeof userFid === 'string' ? parseInt(userFid, 10) : userFid;
            if (isNaN(parsedUserFid)) {
                console.error('[API] Invalid userFid:', userFid);
                return NextResponse.json({ error: 'Invalid userFid' }, { status: 400 });
            }
            
            // Use service role for migration
            console.log('[API] Using service role for migration with userFid:', parsedUserFid);
            supabase = createServiceRoleClient();
            finalUserFid = parsedUserFid;
        } else {
            // Use regular client with auth
            console.log('[API] Using regular client with auth');
            supabase = await createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                console.error('[API] No authenticated user found');
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            }
            finalUserFid = parseInt(user.id);
            console.log('[API] Using authenticated user FID:', finalUserFid);
        }

        const newEntry = {
            user_fid: finalUserFid,
            content,
            sol_day,
            word_count: content.trim().split(/\s+/).length,
            preservation_status: userFid ? 'synced' : 'local',
        };

        console.log('[API] Creating new entry:', newEntry);

        const { data: entry, error } = await supabase
            .from('journal_entries')
            .insert(newEntry)
            .select()
            .single();

        if (error) {
            console.error('[API] Error creating journal entry:', error);
            return NextResponse.json({ error: 'Failed to create journal entry' }, { status: 500 });
        }

        console.log('[API] Entry created successfully:', entry);
        return NextResponse.json({ entry });

    } catch (error) {
        console.error('[API] Error parsing request body:', error);
        console.error('[API] Error details:', {
            name: error instanceof Error ? error.name : 'Unknown',
            message: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined
        });
        return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }
} 