import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '~/utils/supabase/server';
import { cookies } from 'next/headers';
import type { CreateJournalEntryRequest } from '~/types/journal';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get user from session
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const preservation_status = searchParams.get('preservation_status');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build query
    let query = supabase
      .from('journal_entries')
      .select('*')
      .eq('user_fid', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (preservation_status && preservation_status !== 'all') {
      query = query.eq('preservation_status', preservation_status);
    }

    if (search) {
      query = query.ilike('content', `%${search}%`);
    }

    const { data: entries, error } = await query;

    if (error) {
      console.error('Error fetching journal entries:', error);
      return NextResponse.json({ error: 'Failed to fetch entries' }, { status: 500 });
    }

    return NextResponse.json({ entries });
  } catch (error) {
    console.error('Unexpected error in GET /api/journal/entries:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get user from session
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const body: CreateJournalEntryRequest = await request.json();
    const { content, sol_day } = body;

    // Validate input
    if (!content || !sol_day) {
      return NextResponse.json({ error: 'Content and sol_day are required' }, { status: 400 });
    }

    if (content.trim().length === 0) {
      return NextResponse.json({ error: 'Content cannot be empty' }, { status: 400 });
    }

    // Calculate word count
    const word_count = content.trim().split(/\s+/).length;

    // Create journal entry
    const { data: entry, error } = await supabase
      .from('journal_entries')
      .insert({
        user_fid: user.id,
        sol_day,
        content: content.trim(),
        word_count,
        preservation_status: 'local'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating journal entry:', error);
      return NextResponse.json({ error: 'Failed to create entry' }, { status: 500 });
    }

    return NextResponse.json({ entry }, { status: 201 });
  } catch (error) {
    console.error('Unexpected error in POST /api/journal/entries:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 