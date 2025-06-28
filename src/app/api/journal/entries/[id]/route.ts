import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '~/utils/supabase/server';
import type { UpdateJournalEntryRequest } from '~/types/journal';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PUT(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    console.log('[API] PUT /api/journal/entries/[id] called for entry:', id);
    
    // Use service role client since Farcaster users aren't authenticated with Supabase
    const supabase = createServiceRoleClient();
    
    // Get userFid from query params
    const userFidParam = req.nextUrl.searchParams.get('userFid');
    if (!userFidParam) {
      return NextResponse.json({ error: 'userFid parameter required' }, { status: 400 });
    }
    
    const userFid = parseInt(userFidParam, 10);
    if (isNaN(userFid)) {
      return NextResponse.json({ error: 'Invalid userFid' }, { status: 400 });
    }
    
    console.log('[API] Using user FID:', userFid);

    // Parse request body
    const body: UpdateJournalEntryRequest = await req.json();
    const { content } = body;

    // Validate input
    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    if (content.trim().length === 0) {
      return NextResponse.json({ error: 'Content cannot be empty' }, { status: 400 });
    }

    // Check if entry exists and belongs to user
    const { data: existingEntry, error: fetchError } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('id', id)
      .eq('user_fid', userFid)
      .single();

    if (fetchError || !existingEntry) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
    }

    // Only allow editing local and synced entries
    if (existingEntry.preservation_status === 'preserved') {
      return NextResponse.json({ error: 'Cannot edit preserved entries' }, { status: 400 });
    }

    // Calculate new word count
    const word_count = content.trim().split(/\s+/).length;

    // Update journal entry
    const { data: entry, error } = await supabase
      .from('journal_entries')
      .update({
        content: content.trim(),
        word_count
      })
      .eq('id', id)
      .eq('user_fid', userFid)
      .select()
      .single();

    if (error) {
      console.error('[API] Error updating journal entry:', error);
      return NextResponse.json({ error: 'Failed to update entry' }, { status: 500 });
    }

    console.log('[API] Entry updated successfully:', entry);
    return NextResponse.json({ entry });
  } catch (error) {
    console.error('[API] PUT /api/journal/entries/[id] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    console.log('[API] DELETE /api/journal/entries/[id] called for entry:', id);
    
    // Use service role client since Farcaster users aren't authenticated with Supabase
    const supabase = createServiceRoleClient();
    
    // Get userFid from query params
    const userFidParam = req.nextUrl.searchParams.get('userFid');
    if (!userFidParam) {
      return NextResponse.json({ error: 'userFid parameter required' }, { status: 400 });
    }
    
    const userFid = parseInt(userFidParam, 10);
    if (isNaN(userFid)) {
      return NextResponse.json({ error: 'Invalid userFid' }, { status: 400 });
    }
    
    console.log('[API] Using user FID:', userFid);

    // Check if entry exists and belongs to user
    const { data: existingEntry, error: fetchError } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('id', id)
      .eq('user_fid', userFid)
      .single();

    if (fetchError || !existingEntry) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
    }

    // Only allow deleting local and synced entries
    if (existingEntry.preservation_status === 'preserved') {
      return NextResponse.json({ error: 'Cannot delete preserved entries' }, { status: 400 });
    }

    // Delete journal entry
    const { error } = await supabase
      .from('journal_entries')
      .delete()
      .eq('id', id)
      .eq('user_fid', userFid);

    if (error) {
      console.error('[API] Error deleting journal entry:', error);
      return NextResponse.json({ error: 'Failed to delete entry' }, { status: 500 });
    }

    console.log('[API] Entry deleted successfully');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API] DELETE /api/journal/entries/[id] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 